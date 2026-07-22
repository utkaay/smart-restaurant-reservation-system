import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const artifactsDirectory = path.join(projectRoot, "artifacts", "booking");
const homeUrl = process.argv[2] ?? "http://127.0.0.1:8765/";
const bookingUrl = new URL("pages/booking.html", homeUrl).href;
const profileUrl = new URL("pages/profile.html", homeUrl).href;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function getTomorrowInDubai() {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Dubai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date(Date.now() + 86400000));
    const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
}

async function getOpenPort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.on("error", reject);
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            server.close(() => resolve(typeof address === "object" && address ? address.port : 0));
        });
    });
}

async function getPageTarget(port) {
    for (let attempt = 0; attempt < 80; attempt += 1) {
        try {
            const response = await fetch(`http://127.0.0.1:${port}/json/list`);
            const targets = await response.json();
            const target = targets.find((entry) => entry.type === "page");
            if (target?.webSocketDebuggerUrl) return target;
        } catch {
            // Chrome is still starting.
        }
        await delay(125);
    }
    throw new Error("Chrome DevTools target did not become available.");
}

async function run() {
    await mkdir(artifactsDirectory, { recursive: true });
    const debuggingPort = await getOpenPort();
    const profileDirectory = await mkdtemp(path.join(os.tmpdir(), "jacks-booking-qa-"));
    const chrome = spawn(
        chromePath,
        [
            "--headless=new",
            "--enable-webgl",
            "--enable-unsafe-swiftshader",
            "--use-angle=swiftshader-webgl",
            "--ignore-gpu-blocklist",
            "--disable-dev-shm-usage",
            "--hide-scrollbars",
            "--no-first-run",
            `--remote-debugging-port=${debuggingPort}`,
            `--user-data-dir=${profileDirectory}`,
            "--window-size=1440,900",
            "about:blank"
        ],
        { stdio: "ignore", windowsHide: true }
    );
    let socket;

    try {
        const target = await getPageTarget(debuggingPort);
        socket = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => {
            socket.addEventListener("open", resolve, { once: true });
            socket.addEventListener("error", reject, { once: true });
        });

        let requestId = 0;
        const pendingRequests = new Map();
        const eventWaiters = new Map();
        const browserErrors = [];
        const browserWarnings = [];

        socket.addEventListener("message", (event) => {
            const message = JSON.parse(event.data);
            if (message.id) {
                const pending = pendingRequests.get(message.id);
                if (!pending) return;
                pendingRequests.delete(message.id);
                if (message.error) pending.reject(new Error(message.error.message));
                else pending.resolve(message.result);
                return;
            }

            if (message.method === "Runtime.exceptionThrown") {
                browserErrors.push(
                    message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text
                );
            }
            if (message.method === "Runtime.consoleAPICalled") {
                const consoleText = message.params.args
                    .map((argument) => argument.value ?? argument.description ?? "")
                    .join(" ");
                if (message.params.type === "error") browserErrors.push(consoleText);
                if (message.params.type === "warning") browserWarnings.push(consoleText);
            }

            const waiters = eventWaiters.get(message.method) ?? [];
            eventWaiters.delete(message.method);
            waiters.forEach((resolve) => resolve(message.params));
        });

        const send = (method, params = {}) =>
            new Promise((resolve, reject) => {
                requestId += 1;
                pendingRequests.set(requestId, { resolve, reject });
                socket.send(JSON.stringify({ id: requestId, method, params }));
            });
        const waitForEvent = (method) =>
            new Promise((resolve) => {
                const waiters = eventWaiters.get(method) ?? [];
                waiters.push(resolve);
                eventWaiters.set(method, waiters);
            });
        const evaluate = async (expression) => {
            const response = await send("Runtime.evaluate", {
                expression,
                awaitPromise: true,
                returnByValue: true
            });
            if (response.exceptionDetails) {
                throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
            }
            return response.result.value;
        };
        const navigate = async (url) => {
            const loaded = waitForEvent("Page.loadEventFired");
            await send("Page.navigate", { url });
            await Promise.race([loaded, delay(4000)]);
            await delay(250);
        };
        const waitFor = async (expression, timeout = 6000) => {
            const startedAt = Date.now();
            while (Date.now() - startedAt < timeout) {
                if (await evaluate(expression)) return;
                await delay(100);
            }
            throw new Error(`Timed out waiting for: ${expression}`);
        };
        const capture = async (fileName) => {
            const screenshot = await send("Page.captureScreenshot", {
                format: "png",
                captureBeyondViewport: false
            });
            const outputPath = path.join(artifactsDirectory, fileName);
            await writeFile(outputPath, Buffer.from(screenshot.data, "base64"));
            return outputPath;
        };

        await Promise.all([send("Page.enable"), send("Runtime.enable"), send("Log.enable")]);
        await send("Network.setCacheDisabled", { cacheDisabled: true });
        await send("Emulation.setDeviceMetricsOverride", {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        await navigate(homeUrl);
        await evaluate(`localStorage.clear()`);
        await navigate(homeUrl);
        const initialKeys = await evaluate(`Object.keys(localStorage).sort()`);
        assert.equal(initialKeys.includes("reservations"), true);
        assert.equal(initialKeys.includes("restaurants"), true);

        const user = {
            id: "booking-qa-user",
            name: "Booking QA Guest",
            email: "booking.qa@example.com",
            phone: "+971500000001",
            password: "Password123!",
            role: "guest",
            favoriteCuisines: [],
            dietaryTags: [],
            contactPreference: "Email"
        };
        await evaluate(`(() => {
            const user = ${JSON.stringify(user)};
            localStorage.setItem("users", JSON.stringify([user]));
            localStorage.setItem("currentUserId", JSON.stringify(user.id));
            localStorage.setItem("guestProfile", JSON.stringify(user));
            localStorage.setItem("authSession", JSON.stringify({ userId: user.id, email: user.email, role: "guest" }));
            localStorage.setItem("reservations", JSON.stringify([]));
        })()`);
        await navigate(homeUrl);

        await evaluate(`(async () => {
            const wait = () => new Promise((resolve) => setTimeout(resolve, 30));
            const choose = async (type, value) => {
                document.querySelector('[data-plan-trigger="' + type + '"]').click();
                document.querySelector('[data-plan-option="' + type + '"][data-plan-value="' + value + '"]').click();
                await wait();
            };
            await choose("date", "tomorrow");
            await choose("time", "20:00");
            await choose("guests", "2");
            await choose("mood", "Date night");
            document.querySelector(".home-discovery-grid .discovery-exact-table-button").click();
        })()`);
        await waitFor(`location.href === ${JSON.stringify(bookingUrl)}`);
        await waitFor(`Boolean(document.querySelector("#bookingTable3D canvas"))`);

        const entryState = await evaluate(`({
            restaurant: getSelectedRestaurant()?.name,
            draft: JSON.parse(localStorage.getItem("bookingDraft") || "null"),
            canvas: Boolean(document.querySelector("#bookingTable3D canvas")),
            tableCount: bookingTableSelector3DModule.getBookingTableSelector3DState()?.tableCount,
            overflow: document.documentElement.scrollWidth > innerWidth,
            stageBeforeControls: document.querySelector(".booking-table-panel").getBoundingClientRect().top < document.querySelector(".booking-controls-panel").getBoundingClientRect().top
        })`);
        assert.equal(entryState.restaurant, "Olive & Ember");
        assert.equal(entryState.draft.time, "20:00");
        assert.equal(entryState.draft.partySize, 2);
        assert.equal(entryState.draft.mood, "Date night");
        assert.equal(entryState.canvas, true);
        assert.equal(entryState.tableCount, 12);
        assert.equal(entryState.overflow, false);
        assert.equal(entryState.stageBeforeControls, true);
        await evaluate(`scrollTo(0, 0)`);
        const desktopScreenshot = await capture("01-booking-floor-1440x900.png");

        const cameraBefore = await evaluate(`bookingTableSelector3DModule.getBookingTableSelector3DState()`);
        await evaluate(`document.querySelector("#zoomIn3DButton").click()`);
        const cameraAfterZoom = await evaluate(`bookingTableSelector3DModule.getBookingTableSelector3DState()`);
        assert.equal(cameraAfterZoom.orbitDistance < cameraBefore.orbitDistance, true);
        await evaluate(`(() => {
            const canvas = document.querySelector("#bookingTable3D canvas");
            const bounds = canvas.getBoundingClientRect();
            const x = bounds.left + bounds.width / 2;
            const y = bounds.top + bounds.height / 2;
            canvas.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: x, clientY: y, button: 0, pointerId: 27 }));
            canvas.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: x + 70, clientY: y + 20, button: 0, pointerId: 27 }));
            canvas.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: x + 70, clientY: y + 20, button: 0, pointerId: 27 }));
        })()`);
        const cameraAfterRotate = await evaluate(`bookingTableSelector3DModule.getBookingTableSelector3DState()`);
        assert.notDeepEqual(cameraAfterRotate.cameraPosition, cameraAfterZoom.cameraPosition);
        await evaluate(`document.querySelector("#reset3DViewButton").click()`);

        const beforeTableValidation = await evaluate(`({
            disabled: document.querySelector("#confirmBookingButton").disabled,
            message: document.querySelector("#bookingValidationMessage").textContent.trim()
        })`);
        assert.equal(beforeTableValidation.disabled, true);
        assert.match(beforeTableValidation.message, /Choose an available table/);

        await evaluate(`document.querySelector('[data-table-label="A1"]').click()`);
        await waitFor(`bookingState.tableId === "A1"`);
        const selectedTableState = await evaluate(`({
            tableId: bookingState.tableId,
            focused: bookingTableSelector3DModule.getBookingTableSelector3DState()?.focusedTableId,
            required: getRequiredSeatCount(),
            confirmDisabled: document.querySelector("#confirmBookingButton").disabled,
            message: document.querySelector("#bookingValidationMessage").textContent.trim()
        })`);
        assert.equal(selectedTableState.tableId, "A1");
        assert.equal(selectedTableState.focused, "A1");
        assert.equal(selectedTableState.required, 2);
        assert.equal(selectedTableState.confirmDisabled, true);
        assert.match(selectedTableState.message, /Select exactly 2 seats/);

        await evaluate(`document.querySelectorAll(".seat-fallback-button")[0].click(); document.querySelectorAll(".seat-fallback-button")[1].click()`);
        const seatState = await evaluate(`({
            seats: bookingState.selectedSeatIds,
            confirmDisabled: document.querySelector("#confirmBookingButton").disabled,
            message: document.querySelector("#bookingValidationMessage").textContent.trim()
        })`);
        assert.deepEqual(seatState.seats, ["A1-S1", "A1-S2"]);
        assert.equal(seatState.confirmDisabled, false);
        assert.match(seatState.message, /Everything is ready/);

        await evaluate(`(() => {
            const form = document.querySelector("#invitedGuestForm");
            form.querySelector('[name="guestName"]').value = "Maya Guest";
            form.querySelector('[name="guestEmail"]').value = "maya@example.com";
            form.requestSubmit();
        })()`);
        await evaluate(`(() => {
            const select = document.querySelector(".invited-guest-card select");
            select.value = "accepted";
            select.dispatchEvent(new Event("change", { bubbles: true }));
        })()`);
        await evaluate(`(() => {
            const input = document.querySelector("[data-pre-order-item-id]");
            input.value = "2";
            input.dispatchEvent(new Event("change", { bubbles: true }));
        })()`);
        const extrasState = await evaluate(`({
            accepted: getAcceptedInvitedGuestCount(),
            requiredSeats: getRequiredSeatCount(),
            selectedSeats: bookingState.selectedSeatIds,
            preOrderSubtotal: calculatePreOrderSubtotal(getRestaurantMenu()),
            splitParticipants: getBillParticipants().length,
            confirmDisabled: document.querySelector("#confirmBookingButton").disabled
        })`);
        assert.equal(extrasState.accepted, 1);
        assert.equal(extrasState.requiredSeats, 2);
        assert.deepEqual(extrasState.selectedSeats, ["A1-S1", "A1-S2"]);
        assert.equal(extrasState.preOrderSubtotal > 0, true);
        assert.equal(extrasState.splitParticipants, 2);
        assert.equal(extrasState.confirmDisabled, false);

        await evaluate(`confirmBooking(); confirmBooking()`);
        await waitFor(`Boolean(bookingState.confirmedReservation)`);
        const confirmationState = await evaluate(`({
            reservations: JSON.parse(localStorage.getItem("reservations") || "[]"),
            draft: localStorage.getItem("bookingDraft"),
            success: document.querySelector(".booking-success-panel")?.textContent.trim(),
            checkIn: document.querySelector(".check-in-panel")?.textContent.trim()
        })`);
        assert.equal(confirmationState.reservations.length, 1);
        assert.equal(confirmationState.draft, null);
        assert.match(confirmationState.success, /Your table is ready/);
        assert.match(confirmationState.checkIn, /Arrival check-in/);
        const reservation = confirmationState.reservations[0];
        assert.equal(reservation.restaurantId, 1);
        assert.equal(reservation.tableId, "A1");
        assert.deepEqual(reservation.selectedSeatIds, ["A1-S1", "A1-S2"]);
        assert.equal(reservation.partySize, 2);
        assert.equal(reservation.guests.length, 1);
        assert.equal(reservation.preOrder.items.length > 0, true);
        const confirmationScreenshot = await capture("02-booking-confirmation-1440x900.png");

        const refreshedBookingUrl = `${bookingUrl}?qa-refresh=1`;
        await navigate(refreshedBookingUrl);
        await waitFor(`location.href === ${JSON.stringify(refreshedBookingUrl)} && typeof bookingState !== "undefined" && !bookingState.confirmedReservation`);
        const refreshState = await evaluate(`({
            reservations: JSON.parse(localStorage.getItem("reservations") || "[]").length,
            draft: localStorage.getItem("bookingDraft"),
            empty: Boolean(document.querySelector(".booking-empty-panel"))
        })`);
        assert.equal(refreshState.reservations, 1);
        assert.equal(refreshState.draft, null);
        assert.equal(refreshState.empty, true);

        await navigate(profileUrl);
        await waitFor(`Boolean(document.querySelector("#myBookingsSection"))`);
        const myBookingsState = await evaluate(`({
            text: document.querySelector("#myBookingsSection").textContent,
            cards: document.querySelectorAll(".my-booking-card").length
        })`);
        assert.match(myBookingsState.text, /Olive & Ember/);
        assert.match(myBookingsState.text, /A1/);
        assert.equal(myBookingsState.cards >= 1, true);

        await navigate(bookingUrl);
        await evaluate(`startBooking(1, { date: ${JSON.stringify(getTomorrowInDubai())}, time: "20:00", partySize: 2, mood: "Date night" })`);
        await waitFor(`Boolean(document.querySelector("#bookingTable3D canvas"))`);
        const conflictState = await evaluate(`({
            status: getTableStatus(getRestaurantTableLayout().find((table) => table.tableId === "A1")),
            labelDisabled: document.querySelector('[data-table-label="A1"]').disabled
        })`);
        assert.equal(conflictState.status, "Reserved");
        assert.equal(conflictState.labelDisabled, true);

        await evaluate(`startBooking(2, { date: ${JSON.stringify(getTomorrowInDubai())}, time: "20:00", partySize: 8, mood: "Casual" })`);
        await waitFor(`Boolean(document.querySelector("#bookingTable3D canvas"))`);
        const secondRestaurant = await evaluate(`({
            name: getSelectedRestaurant()?.name,
            slots: getRestaurantTimeSlots().length,
            available: getAvailableTableCountForSlot(),
            unavailable: getRestaurantTableLayout().filter((table) => getTableStatus(table) === "Unavailable").length,
            partySize: bookingState.partySize
        })`);
        assert.equal(secondRestaurant.name, "Noodle House");
        assert.equal(secondRestaurant.slots > 0, true);
        assert.equal(secondRestaurant.available, 2);
        assert.equal(secondRestaurant.unavailable, 10);
        assert.equal(secondRestaurant.partySize, 8);

        await send("Emulation.setDeviceMetricsOverride", {
            width: 390,
            height: 844,
            deviceScaleFactor: 1,
            mobile: true
        });
        await delay(500);
        await evaluate(`scrollTo(0, 0)`);
        const mobileState = await evaluate(`({
            viewport: [innerWidth, innerHeight],
            overflow: document.documentElement.scrollWidth > innerWidth,
            tableTop: document.querySelector(".booking-table-panel").getBoundingClientRect().top,
            controlsTop: document.querySelector(".booking-controls-panel").getBoundingClientRect().top,
            stageWidth: document.querySelector("#bookingTable3DStage").getBoundingClientRect().width,
            canvas: Boolean(document.querySelector("#bookingTable3D canvas"))
        })`);
        assert.deepEqual(mobileState.viewport, [390, 844]);
        assert.equal(mobileState.overflow, false);
        assert.equal(mobileState.tableTop < mobileState.controlsTop, true);
        assert.equal(mobileState.stageWidth <= 370, true);
        assert.equal(mobileState.canvas, true);
        const mobileScreenshot = await capture("03-booking-floor-390x844.png");

        await send("Emulation.setDeviceMetricsOverride", {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });
        await evaluate(`localStorage.setItem("reservations", JSON.stringify([
            "malformed",
            null,
            { reservationId: "older-confirmed", restaurantId: 1, restaurantName: "Olive & Ember", tableId: "A2", date: ${JSON.stringify(getTomorrowInDubai())}, time: "20:00", status: "confirmed" }
        ])); startBooking(1, { date: ${JSON.stringify(getTomorrowInDubai())}, time: "20:00", partySize: 2, mood: "Date night" })`);
        await waitFor(`Boolean(document.querySelector("#bookingTable3D canvas"))`);
        const malformedReservationsState = await evaluate(`({
            reserved: getTableStatus(getRestaurantTableLayout().find((table) => table.tableId === "A2")),
            safeCount: getSafeBookingReservations().length,
            pageReady: Boolean(document.querySelector(".booking-table-panel"))
        })`);
        assert.equal(malformedReservationsState.reserved, "Reserved");
        assert.equal(malformedReservationsState.safeCount, 1);
        assert.equal(malformedReservationsState.pageReady, true);

        await navigate(homeUrl);
        await waitFor(`location.href === ${JSON.stringify(homeUrl)} && document.body?.dataset.customerPage === "home"`);
        await evaluate(`localStorage.setItem("bookingDraft", "{bad-json")`);
        const malformedDraftState = await evaluate(`({
            state: loadBookingDraft(),
            parsedValue: getFromStorage(storageKeys.bookingDraft),
            pageReady: document.readyState === "complete"
        })`);
        assert.equal(malformedDraftState.state.restaurantId, null);
        assert.equal(malformedDraftState.parsedValue, null);
        assert.equal(malformedDraftState.pageReady, true);

        await evaluate(`localStorage.setItem("bookingDraft", JSON.stringify({
            restaurantId: 1,
            date: ${JSON.stringify(getTomorrowInDubai())},
            time: "20:00",
            tableId: "",
            selectedSeatIds: []
        }))`);
        const normalizedOlderDraft = await evaluate(`loadBookingDraft()`);
        assert.equal(normalizedOlderDraft.restaurantId, 1);
        assert.equal(normalizedOlderDraft.partySize, 1);
        assert.deepEqual(normalizedOlderDraft.invitedGuests, []);
        assert.deepEqual(normalizedOlderDraft.preOrderItems, {});
        await evaluate(`startBooking(1, loadBookingDraft())`);
        await waitFor(`location.href === ${JSON.stringify(bookingUrl)}`);
        await waitFor(`Boolean(document.querySelector("#bookingTable3D canvas"))`);
        const olderDraftState = await evaluate(`({
            restaurant: getSelectedRestaurant()?.name,
            partySize: bookingState.partySize,
            guests: bookingState.invitedGuests,
            preorder: bookingState.preOrderItems,
            canvas: Boolean(document.querySelector("#bookingTable3D canvas"))
        })`);
        assert.equal(olderDraftState.restaurant, "Olive & Ember");
        assert.equal(olderDraftState.partySize, 1);
        assert.deepEqual(olderDraftState.guests, []);
        assert.deepEqual(olderDraftState.preorder, {});
        assert.equal(olderDraftState.canvas, true);

        await delay(300);
        assert.deepEqual(browserErrors, []);
        assert.deepEqual(browserWarnings, []);

        console.log(
            JSON.stringify(
                {
                    passed: true,
                    freshState: { initialKeys },
                    entryState,
                    camera: { before: cameraBefore, afterZoom: cameraAfterZoom, afterRotate: cameraAfterRotate },
                    selectedTableState,
                    seatState,
                    extrasState,
                    reservation,
                    refreshState,
                    myBookingsState: { cards: myBookingsState.cards },
                    conflictState,
                    secondRestaurant,
                    mobileState,
                    malformedReservationsState,
                    malformedDraftState,
                    olderDraftState,
                    screenshots: [desktopScreenshot, confirmationScreenshot, mobileScreenshot],
                    browserErrors,
                    browserWarnings
                },
                null,
                2
            )
        );
    } finally {
        if (socket?.readyState === WebSocket.OPEN) socket.close();
        chrome.kill();
        await delay(750);
        for (let attempt = 0; attempt < 5; attempt += 1) {
            try {
                await rm(profileDirectory, { recursive: true, force: true, maxRetries: 2, retryDelay: 150 });
                break;
            } catch (error) {
                if (attempt === 4 && error?.code !== "EBUSY") throw error;
                await delay(300);
            }
        }
    }
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
