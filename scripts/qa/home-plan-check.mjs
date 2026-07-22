import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const homeUrl = process.argv[2] ?? "http://127.0.0.1:8765/";
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

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
            if (target?.webSocketDebuggerUrl) {
                return target;
            }
        } catch {
            // Chrome is still starting.
        }
        await delay(125);
    }

    throw new Error("Chrome DevTools target did not become available.");
}

async function run() {
    const debuggingPort = await getOpenPort();
    const profileDirectory = await mkdtemp(path.join(os.tmpdir(), "jacks-plan-qa-"));
    const chrome = spawn(
        chromePath,
        [
            "--headless=new",
            "--disable-gpu",
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
                browserErrors.push(message.params.exceptionDetails.text);
            }
            if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
                browserErrors.push(
                    message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ")
                );
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
            await loaded;
            await delay(150);
        };

        await Promise.all([send("Page.enable"), send("Runtime.enable")]);
        await send("Network.setCacheDisabled", { cacheDisabled: true });
        await navigate(homeUrl);

        const controlResults = await evaluate(`(async () => {
            const wait = (milliseconds = 20) => new Promise((resolve) => setTimeout(resolve, milliseconds));
            const text = (selector) => document.querySelector(selector)?.textContent?.trim() || '';
            const trigger = (name) => document.querySelector('[data-plan-trigger="' + name + '"]');
            const menu = (name) => document.querySelector('[data-plan-menu="' + name + '"]');
            const option = (name, value) => document.querySelector('[data-plan-option="' + name + '"][data-plan-value="' + value + '"]');
            const clickOption = async (name, value) => {
                trigger(name).click();
                option(name, value).click();
                await wait();
            };
            const labels = () => ({
                date: text('#discoveryPlanDate'),
                time: text('#discoveryPlanTime'),
                guests: text('#discoveryPlanGuests'),
                mood: text('#discoveryPlanMood')
            });

            const defaults = labels();
            const fullRowButtons = ['date', 'time', 'guests', 'mood'].every((name) => trigger(name)?.tagName === 'BUTTON');
            const optionSets = {
                date: [...menu('date').querySelectorAll('[data-plan-option="date"]')].map((item) => item.textContent.trim()),
                time: [...menu('time').querySelectorAll('[data-plan-option="time"]')].map((item) => item.textContent.trim()),
                guests: [...menu('guests').querySelectorAll('[data-plan-option="guests"]')].map((item) => item.textContent.trim()),
                mood: [...menu('mood').querySelectorAll('[data-plan-option="mood"]')].map((item) => item.textContent.trim())
            };

            trigger('date').querySelector('.material-symbols-outlined').click();
            const iconClickOpened = !menu('date').hidden && trigger('date').getAttribute('aria-expanded') === 'true';
            document.querySelector('#discoveryHeading').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
            const outsideClosed = menu('date').hidden;

            trigger('time').click();
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            const escapeClosed = menu('time').hidden && document.activeElement === trigger('time');

            trigger('guests').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await wait(40);
            const keyboardOpened = !menu('guests').hidden && menu('guests').contains(document.activeElement);
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

            await clickOption('date', 'tomorrow');
            await clickOption('time', '20:00');
            await clickOption('guests', '1');
            const oneGuestLabel = text('#discoveryPlanGuests');
            await clickOption('guests', '8');
            const eightGuestLabel = text('#discoveryPlanGuests');

            trigger('date').click();
            const customInput = document.querySelector('#discoveryPlanCustomDate');
            const customDate = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
            customInput.value = customDate;
            customInput.dispatchEvent(new Event('change', { bubbles: true }));
            await wait();
            const customDateResult = { value: customInput.value, label: text('#discoveryPlanDate'), min: customInput.min };

            const moodLeaders = {};
            for (const mood of ['Date night', 'Family friendly', 'Quick bite', 'Fine dining', 'Casual']) {
                await clickOption('mood', mood);
                moodLeaders[mood] = text('#restaurantGrid .restaurant-card h3');
            }

            const cuisine = document.querySelector('[data-discovery-filter="cuisine"]');
            cuisine.value = 'Mediterranean';
            cuisine.dispatchEvent(new Event('change', { bubbles: true }));
            await wait();
            const composedFilter = {
                count: document.querySelectorAll('#restaurantGrid .restaurant-card').length,
                first: text('#restaurantGrid .restaurant-card h3')
            };

            document.querySelector('#discoverySearchInput').value = 'Olive';
            document.querySelector('#discoverySearchInput').dispatchEvent(new Event('input', { bubbles: true }));
            await clickOption('guests', '5');
            document.querySelector('#discoveryClearFilters').click();
            await wait();
            const clearResult = {
                labels: labels(),
                search: document.querySelector('#discoverySearchInput').value,
                count: document.querySelectorAll('#restaurantGrid .restaurant-card').length,
                cuisine: document.querySelector('[data-discovery-filter="cuisine"]').value
            };

            await clickOption('time', '20:30');
            document.querySelector('#discoveryResetFilters').click();
            await wait();
            const resetResult = labels();
            const moodLabel = document.querySelector('#discoveryPlanMood');

            return {
                defaults,
                fullRowButtons,
                optionSets,
                iconClickOpened,
                outsideClosed,
                escapeClosed,
                keyboardOpened,
                selected: labels(),
                oneGuestLabel,
                eightGuestLabel,
                customDateResult,
                moodLeaders,
                composedFilter,
                clearResult,
                resetResult,
                moodNotTruncated: moodLabel.scrollWidth <= moodLabel.clientWidth + 1
            };
        })()`);

        assert.deepEqual(controlResults.defaults, {
            date: "Tonight",
            time: "7:30 PM",
            guests: "2 guests",
            mood: "Date night"
        });
        assert.equal(controlResults.fullRowButtons, true);
        assert.deepEqual(controlResults.optionSets.date, ["Tonight", "Tomorrow"]);
        assert.equal(controlResults.optionSets.time.includes("8:00 PM"), true);
        assert.deepEqual(controlResults.optionSets.guests, [
            "1 guest",
            "2 guests",
            "3 guests",
            "4 guests",
            "5 guests",
            "6 guests",
            "7 guests",
            "8 guests"
        ]);
        assert.deepEqual(controlResults.optionSets.mood, [
            "Date night",
            "Family friendly",
            "Quick bite",
            "Fine dining",
            "Casual"
        ]);
        assert.equal(controlResults.iconClickOpened, true);
        assert.equal(controlResults.outsideClosed, true);
        assert.equal(controlResults.escapeClosed, true);
        assert.equal(controlResults.keyboardOpened, true);
        assert.equal(controlResults.oneGuestLabel, "1 guest");
        assert.equal(controlResults.eightGuestLabel, "8 guests");
        assert.notEqual(controlResults.customDateResult.label, "Tonight");
        assert.equal(controlResults.customDateResult.min.length, 10);
        assert.deepEqual(controlResults.moodLeaders, {
            "Date night": "Olive & Ember",
            "Family friendly": "The Garden Table",
            "Quick bite": "Noodle House",
            "Fine dining": "Bistro Lumiere",
            Casual: "Olive & Ember"
        });
        assert.deepEqual(controlResults.composedFilter, { count: 1, first: "Olive & Ember" });
        assert.deepEqual(controlResults.clearResult, {
            labels: { date: "Tonight", time: "7:30 PM", guests: "2 guests", mood: "Date night" },
            search: "",
            count: 6,
            cuisine: "All"
        });
        assert.deepEqual(controlResults.resetResult, {
            date: "Tonight",
            time: "7:30 PM",
            guests: "2 guests",
            mood: "Date night"
        });
        assert.equal(controlResults.moodNotTruncated, true);

        const user = {
            id: "qa-user",
            name: "QA Guest",
            email: "qa@example.com",
            phone: "+971500000000",
            password: "Password123!",
            role: "guest",
            favoriteCuisines: [],
            dietaryTags: [],
            contactPreference: "Email"
        };
        await evaluate(`localStorage.setItem('users', ${JSON.stringify(JSON.stringify([user]))});
            localStorage.removeItem('authSession');
            localStorage.removeItem('currentUserId');
            localStorage.removeItem('guestProfile');
            localStorage.removeItem('pendingAction');
            localStorage.removeItem('bookingDraft');`);

        const loginLoaded = waitForEvent("Page.loadEventFired");
        await evaluate(`(async () => {
            const wait = () => new Promise((resolve) => setTimeout(resolve, 20));
            const choose = async (type, value) => {
                document.querySelector('[data-plan-trigger="' + type + '"]').click();
                document.querySelector('[data-plan-option="' + type + '"][data-plan-value="' + value + '"]').click();
                await wait();
            };
            await choose('date', 'tomorrow');
            await choose('time', '20:00');
            await choose('guests', '5');
            await choose('mood', 'Fine dining');
            document.querySelector('.home-discovery-grid .book-button:not(.discovery-exact-table-button)').click();
        })()`);
        await Promise.race([loginLoaded, delay(3000)]);

        const pendingAction = await evaluate(`JSON.parse(localStorage.getItem('pendingAction'))`);
        assert.equal(pendingAction.time, "20:00");
        assert.equal(pendingAction.partySize, 5);
        assert.equal(pendingAction.mood, "Fine dining");
        assert.equal(pendingAction.date.length, 10);

        const bookingLoadedAfterLogin = waitForEvent("Page.loadEventFired");
        await evaluate(`(() => {
            const form = document.querySelector('#loginForm');
            form.querySelector('[name="email"]').value = 'qa@example.com';
            form.querySelector('[name="password"]').value = 'Password123!';
            form.requestSubmit();
        })()`);
        await Promise.race([bookingLoadedAfterLogin, delay(3000)]);
        await delay(100);

        const resumedBooking = await evaluate(`({
            url: location.href,
            draft: JSON.parse(localStorage.getItem('bookingDraft')),
            requiredSeats: getRequiredSeatCount(),
            partyChip: [...document.querySelectorAll('.booking-restaurant-meta .summary-chip')]
                .map((chip) => chip.textContent.trim())
                .find((label) => label.includes('guest')) || ''
        })`);
        assert.equal(resumedBooking.draft.date, pendingAction.date);
        assert.equal(resumedBooking.draft.time, "20:00");
        assert.equal(resumedBooking.draft.partySize, 5);
        assert.equal(resumedBooking.draft.mood, "Fine dining");
        assert.equal(resumedBooking.requiredSeats, 5);
        assert.equal(resumedBooking.partyChip, "5 guests");

        await navigate(homeUrl);
        const exactBookingLoaded = waitForEvent("Page.loadEventFired");
        await evaluate(`(async () => {
            const wait = () => new Promise((resolve) => setTimeout(resolve, 20));
            const choose = async (type, value) => {
                document.querySelector('[data-plan-trigger="' + type + '"]').click();
                document.querySelector('[data-plan-option="' + type + '"][data-plan-value="' + value + '"]').click();
                await wait();
            };
            await choose('date', 'tomorrow');
            await choose('time', '20:00');
            await choose('guests', '5');
            await choose('mood', 'Casual');
            document.querySelector('.home-discovery-grid .discovery-exact-table-button').click();
        })()`);
        await Promise.race([exactBookingLoaded, delay(3000)]);
        await delay(100);

        const exactBooking = await evaluate(`JSON.parse(localStorage.getItem('bookingDraft'))`);
        assert.equal(exactBooking.time, "20:00");
        assert.equal(exactBooking.partySize, 5);
        assert.equal(exactBooking.mood, "Casual");
        assert.equal(exactBooking.date.length, 10);
        assert.deepEqual(browserErrors, []);

        console.log(
            JSON.stringify(
                {
                    passed: true,
                    controls: controlResults,
                    pendingAction,
                    resumedBooking: resumedBooking.draft,
                    exactBooking,
                    browserErrors
                },
                null,
                2
            )
        );
    } finally {
        if (socket?.readyState === WebSocket.OPEN) socket.close();
        chrome.kill();
        await delay(250);
        await rm(profileDirectory, { recursive: true, force: true });
    }
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
