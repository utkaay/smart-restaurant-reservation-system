import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const cdpBaseUrl = process.argv[2] ?? "http://127.0.0.1:9555";
const baseUrl = process.argv[3] ?? "http://127.0.0.1:8765";
const artifactDirectory = path.resolve(process.argv[4] ?? "artifacts/admin");
const loginUrl = `${baseUrl}/pages/admin/login.html`;
const dashboardUrl = `${baseUrl}/pages/admin/index.html`;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

class CdpConnection {
    constructor(socket) {
        this.socket = socket;
        this.nextId = 0;
        this.pending = new Map();
        this.listeners = new Set();
        socket.addEventListener("message", (event) => {
            const message = JSON.parse(String(event.data));
            if (message.id) {
                const request = this.pending.get(message.id);
                if (!request) return;
                this.pending.delete(message.id);
                clearTimeout(request.timer);
                if (message.error) request.reject(new Error(`${request.method}: ${message.error.message}`));
                else request.resolve(message.result ?? {});
                return;
            }
            this.listeners.forEach((listener) => listener(message));
        });
    }

    static async connect(url) {
        const socket = new WebSocket(url);
        await new Promise((resolve, reject) => {
            socket.addEventListener("open", resolve, { once: true });
            socket.addEventListener("error", reject, { once: true });
        });
        return new CdpConnection(socket);
    }

    on(listener) {
        this.listeners.add(listener);
    }

    send(method, params = {}, timeout = 30_000) {
        return new Promise((resolve, reject) => {
            const id = ++this.nextId;
            const timer = setTimeout(() => {
                this.pending.delete(id);
                reject(new Error(`${method} timed out`));
            }, timeout);
            this.pending.set(id, { method, resolve, reject, timer });
            this.socket.send(JSON.stringify({ id, method, params }));
        });
    }

    close() {
        this.socket.close();
    }
}

const tests = [];
function assert(condition, label, detail = "") {
    tests.push({ label, passed: Boolean(condition), detail });
    if (!condition) throw new Error(`${label}${detail ? `: ${detail}` : ""}`);
}

async function getPageTarget() {
    const response = await fetch(`${cdpBaseUrl}/json/list`);
    const targets = await response.json();
    const page = targets.find((target) => target.type === "page");
    if (!page?.webSocketDebuggerUrl) throw new Error("No Chrome page target is available.");
    return page;
}

async function evaluate(connection, expression) {
    const response = await connection.send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
        userGesture: true,
    });
    if (response.exceptionDetails) {
        throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
    }
    return response.result?.value;
}

async function waitFor(connection, expression, timeout = 12_000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        try {
            if (await evaluate(connection, `Boolean(${expression})`)) return;
        } catch {
            // Navigation briefly destroys the prior execution context.
        }
        await delay(80);
    }
    throw new Error(`Timed out waiting for ${expression}`);
}

async function navigate(connection, url, readyExpression) {
    await connection.send("Page.navigate", { url });
    await waitFor(connection, readyExpression);
    await delay(180);
}

async function setViewport(connection, width, height, mobile = false) {
    await connection.send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile,
        screenWidth: width,
        screenHeight: height,
    });
}

async function screenshot(connection, filename) {
    await evaluate(connection, "window.scrollTo(0, 0)");
    await evaluate(connection, "document.fonts ? document.fonts.ready.then(() => true) : true");
    await delay(420);
    const { data } = await connection.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
        fromSurface: true,
    });
    await writeFile(path.join(artifactDirectory, filename), Buffer.from(data, "base64"));
}

async function click(connection, selector) {
    return evaluate(
        connection,
        `(() => { const node = document.querySelector(${JSON.stringify(selector)}); if (!node) return false; node.click(); return true; })()`,
    );
}

async function setValue(connection, selector, value, eventName = "input") {
    return evaluate(
        connection,
        `(() => { const node = document.querySelector(${JSON.stringify(selector)}); if (!node) return false; node.value = ${JSON.stringify(value)}; node.dispatchEvent(new Event(${JSON.stringify(eventName)}, { bubbles: true })); return true; })()`,
    );
}

async function selectSection(connection, section) {
    assert(await click(connection, `[data-admin-section="${section}"]`), `Open ${section} section`);
    await waitFor(connection, `document.querySelector('[data-admin-section="${section}"]').classList.contains('is-active')`);
    await delay(120);
}

await mkdir(artifactDirectory, { recursive: true });
const target = await getPageTarget();
const connection = await CdpConnection.connect(target.webSocketDebuggerUrl);
const consoleErrors = [];
const runtimeErrors = [];
const networkErrors = [];
let acceptDialogs = false;
let dialogCount = 0;

connection.on((message) => {
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
        consoleErrors.push(message.params.args.map((argument) => argument.value ?? argument.description).join(" "));
    }
    if (message.method === "Runtime.exceptionThrown") {
        runtimeErrors.push(message.params.exceptionDetails?.exception?.description ?? message.params.exceptionDetails?.text);
    }
    if (message.method === "Network.loadingFailed" && !message.params.canceled) {
        networkErrors.push(`${message.params.errorText}: ${message.params.type}`);
    }
    if (message.method === "Page.javascriptDialogOpening") {
        dialogCount += 1;
        connection.send("Page.handleJavaScriptDialog", { accept: acceptDialogs }).catch(() => {});
    }
});

await connection.send("Runtime.enable");
await connection.send("Page.enable");
await connection.send("Network.enable");
await connection.send("Network.setCacheDisabled", { cacheDisabled: true });
await setViewport(connection, 1440, 900);

try {
    await navigate(connection, loginUrl, "document.body?.dataset.adminPage === 'login'");
    await evaluate(connection, "localStorage.clear(); location.reload()");
    await waitFor(connection, "document.readyState === 'complete' && typeof handleAdminLoginSubmit === 'function' && document.querySelector('#adminLoginForm')");
    assert((await evaluate(connection, "JSON.parse(localStorage.getItem('restaurants') || '[]').length")) >= 1, "Fresh storage seeds default restaurants");
    await screenshot(connection, "admin-login-1440x900.png");

    await setValue(connection, 'input[name="email"]', "");
    await setValue(connection, 'input[name="password"]', "");
    await evaluate(connection, "document.querySelector('#adminLoginForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))");
    const validationMessage = await evaluate(connection, "document.querySelector('#adminLoginMessage').textContent");
    assert(validationMessage.includes("valid Admin"), "Login validation is inline", validationMessage);
    await setValue(connection, 'input[name="email"]', await evaluate(connection, "ADMIN_EMAIL"));
    await setValue(connection, 'input[name="password"]', "not-initialized");
    await evaluate(connection, "document.querySelector('#adminLoginForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))");
    assert((await evaluate(connection, "document.querySelector('#adminLoginMessage').textContent")).includes("not been initialized"), "Fresh storage explains unavailable Admin access");
    await click(connection, "[data-admin-password-toggle]");
    assert((await evaluate(connection, "document.querySelector('input[name=password]').type")) === "text", "Password visibility control works");
    await click(connection, "[data-admin-password-toggle]");

    await evaluate(
        connection,
        `localStorage.setItem('users', JSON.stringify([{id:'qa-admin',name:'Operations Admin',email:ADMIN_EMAIL,password:'qa-password'}]))`,
    );
    await setValue(connection, 'input[name="email"]', "wrong@example.com");
    await setValue(connection, 'input[name="password"]', "wrong");
    await click(connection, "#adminLoginSubmit");
    assert(
        (await evaluate(connection, "document.querySelector('#adminLoginMessage').textContent")).includes("Invalid Admin credentials"),
        "Incorrect credentials fail clearly",
    );

    await evaluate(
        connection,
        `(() => {
            const restaurants = DEFAULT_RESTAURANTS.slice(0, 3);
            const firstId = restaurants[0].id;
            const secondId = restaurants[1].id;
            localStorage.setItem('restaurants', JSON.stringify(restaurants));
            localStorage.setItem('priceTiers', JSON.stringify({'2':0,'4':12,'6':24,'8':36}));
            localStorage.setItem('waitlist', JSON.stringify([{id:'wait-1',restaurantId:firstId,name:'Wait Guest',status:'waiting'}]));
            localStorage.setItem('reservations', JSON.stringify([
                {reservationId:'RSV-QA-1001',restaurantId:firstId,restaurantName:restaurants[0].name,status:'confirmed',date:'2026-08-12',time:'19:00',tableId:'A1',selectedSeatIds:['A1-1','A1-2'],partySize:2,tableExperience:'Premium',guestName:'Maya Hassan',guestEmail:'maya@example.com',guestPhone:'+971500000001',guests:[{name:'Sam',email:'sam@example.com',rsvpStatus:'accepted'}],pricing:{tableFee:10,timeAdjustment:{amount:6},finalTotal:286},preOrder:{items:[{name:'Chef tasting menu',quantity:2,price:125}],subtotal:250},checkInCode:'JACKS-1001'},
                {reservationId:'RSV-QA-1002',restaurantId:secondId,restaurantName:restaurants[1].name,status:'active',date:'2026-08-14',time:'20:00',tableId:'B1',selectedSeatIds:['B1-1','B1-2','B1-3','B1-4'],partySize:4,tableExperience:'Regular',guestName:'Omar Ali',guestEmail:'omar@example.com',pricing:{finalTotal:420},checkInCode:'JACKS-1002'},
                {reservationId:'RSV-QA-0999',restaurantId:firstId,restaurantName:restaurants[0].name,status:'completed',date:'2026-06-02',time:'18:30',tableId:'C1',partySize:5,guestName:'Leila Noor',guestEmail:'leila@example.com',pricing:{finalTotal:610}},
                {reservationId:'RSV-QA-0998',restaurantId:secondId,restaurantName:restaurants[1].name,status:'cancelled',date:'2026-05-18',time:'19:30',tableId:'D1',partySize:6,guestName:'Daniel Kim',guestEmail:'daniel@example.com',pricing:{finalTotal:720}}
            ]));
            localStorage.setItem('jacksSupportRequests', JSON.stringify([
                {requestId:'SUP-QA-01',createdAt:'2026-07-21T12:00:00.000Z',user:{id:'user-1',name:'Maya Hassan',email:'maya@example.com',phone:'+971500000001'},topic:'Reservation Help',reservationId:'RSV-QA-1001',message:'Please confirm the invited guest list for my dinner.',status:'new'},
                {requestId:'SUP-QA-02',createdAt:'2026-07-20T10:00:00.000Z',user:{id:null,name:'Omar Ali',email:'omar@example.com',phone:null},topic:'Technical Problem',reservationId:null,message:'The check-in code did not appear on my first visit.',status:'in-progress'}
            ]));
        })()`,
    );

    await setValue(connection, 'input[name="email"]', await evaluate(connection, "ADMIN_EMAIL"));
    await setValue(connection, 'input[name="password"]', "qa-password");
    await click(connection, "#adminLoginSubmit");
    await delay(30);
    assert((await evaluate(connection, "document.querySelector('#adminLoginSubmit')?.disabled === true")), "Login exposes a disabled loading state");
    await waitFor(connection, "location.pathname.endsWith('/pages/admin/index.html') && document.querySelector('#adminDashboard')?.children.length > 0");
    assert((await evaluate(connection, "document.querySelector('#adminIdentityName').textContent")) === "Operations Admin", "Correct Admin login succeeds");
    assert((await evaluate(connection, "document.querySelector('[data-stat=\"active\"]')?.textContent || ''")).includes("2"), "Confirmed and active reservations count as active");
    await screenshot(connection, "admin-dashboard-1440x900.png");

    await selectSection(connection, "restaurants");
    assert((await evaluate(connection, "document.querySelectorAll('.restaurant-management-card').length")) === 3, "Multiple restaurants render");
    await setValue(connection, "#adminRestaurantPriceFilter", "$$$", "change");
    assert((await evaluate(connection, "document.querySelectorAll('.restaurant-management-card').length")) >= 1, "Restaurant price filter works");
    await setValue(connection, "#adminRestaurantPriceFilter", "all", "change");
    await screenshot(connection, "admin-restaurants-1440x900.png");

    const initialRestaurantCount = await evaluate(connection, "getRestaurants().length");
    await evaluate(
        connection,
        `(() => { const f=document.querySelector('#addRestaurantForm'); const set=(n,v)=>f.elements[n].value=v; set('name','QA Garden'); set('cuisine','Mediterranean'); set('location','Dubai Marina'); set('openingTime','11:00'); set('closingTime','23:00'); set('rating','4.6'); set('priceLevel','$$$'); set('distanceCategory','Nearby'); set('image',getRestaurants()[0].image); f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); })()`,
    );
    assert((await evaluate(connection, "getRestaurants().length")) === initialRestaurantCount + 1, "Restaurant add persists");
    await evaluate(
        connection,
        `(() => { const f=document.querySelector('#addRestaurantForm'); const set=(n,v)=>f.elements[n].value=v; set('name','QA Garden'); set('cuisine','Mediterranean'); set('location','Dubai Marina'); set('openingTime','11:00'); set('closingTime','23:00'); set('rating','4.6'); set('priceLevel','$$$'); set('distanceCategory','Nearby'); set('image',getRestaurants()[0].image); f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); })()`,
    );
    assert((await evaluate(connection, "getRestaurants().length")) === initialRestaurantCount + 1, "Duplicate restaurant is prevented");

    await setValue(connection, "#adminRestaurantSearch", "QA Garden");
    assert((await evaluate(connection, "document.querySelectorAll('.restaurant-management-card').length")) === 1, "Restaurant search filters results");
    assert(await click(connection, "[data-edit-restaurant-id]"), "Restaurant edit opens after filtered search");
    await setValue(connection, '#addRestaurantForm input[name="cuisine"]', "Levantine");
    await evaluate(connection, "document.querySelector('#addRestaurantForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))");
    assert((await evaluate(connection, "getRestaurants().some(r => r.name === 'QA Garden' && r.cuisine === 'Levantine')")), "Restaurant edit persists");
    await setValue(connection, "#adminRestaurantSearch", "QA Garden");
    acceptDialogs = false;
    const beforeDelete = await evaluate(connection, "getRestaurants().length");
    await click(connection, "[data-delete-restaurant-id]");
    await delay(100);
    assert((await evaluate(connection, "getRestaurants().length")) === beforeDelete, "Restaurant deletion can be cancelled");
    acceptDialogs = true;
    await click(connection, "[data-delete-restaurant-id]");
    await delay(100);
    assert((await evaluate(connection, "getRestaurants().length")) === beforeDelete - 1, "Confirmed restaurant deletion persists");

    await selectSection(connection, "reservations");
    assert((await evaluate(connection, "document.querySelectorAll('.reservation-management-card').length")) === 4, "Multiple reservation statuses render");
    await setValue(connection, "#reservationSearchInput", "RSV-QA-1001");
    assert((await evaluate(connection, "document.querySelectorAll('.reservation-management-card').length")) === 1, "Reservation search filters by ID");
    await click(connection, "[data-reservation-details-id]");
    assert((await evaluate(connection, "document.querySelector('.reservation-details-panel')?.textContent || ''")).includes("JACKS-1001"), "Reservation details expose check-in code");
    assert((await evaluate(connection, "document.querySelector('.reservation-details-panel')?.textContent || ''")).includes("A1-1"), "Reservation details preserve selected seats");
    await screenshot(connection, "admin-reservations-1440x900.png");
    await setValue(connection, "#reservationSearchInput", "");
    await setValue(connection, "#reservationStatusFilter", "completed", "change");
    assert((await evaluate(connection, "document.querySelectorAll('.reservation-management-card').length")) === 1, "Reservation status filter works");
    await setValue(connection, "#reservationStatusFilter", "all", "change");

    await selectSection(connection, "tables");
    const firstTableRestaurantId = await evaluate(connection, "document.querySelector('#tableRestaurantSelect').value");
    const alternateTableRestaurantId = await evaluate(connection, "Array.from(document.querySelector('#tableRestaurantSelect').options).find(option => option.value !== document.querySelector('#tableRestaurantSelect').value)?.value || ''");
    if (alternateTableRestaurantId) {
        await setValue(connection, "#tableRestaurantSelect", alternateTableRestaurantId, "change");
        assert((await evaluate(connection, "adminSelectedRestaurantId")) === alternateTableRestaurantId, "Table restaurant selector works");
        await setValue(connection, "#tableRestaurantSelect", firstTableRestaurantId, "change");
    }
    await setValue(connection, "#tableDateInput", "2026-08-12", "change");
    await setValue(connection, "#tableTimeSelect", "19:00", "change");
    assert((await evaluate(connection, "document.querySelector('.admin-table-card')?.textContent || ''")).includes("A1"), "Table inventory renders");
    assert((await evaluate(connection, "Array.from(document.querySelectorAll('.admin-table-card')).find(c => c.textContent.includes('A1'))?.classList.contains('status-reserved')")), "Confirmed reservation blocks its table");
    await screenshot(connection, "admin-tables-1440x900.png");
    const beforeTableAdd = await evaluate(connection, "getRestaurantTableLayout(getRestaurantById(adminSelectedRestaurantId)).length");
    await evaluate(connection, `(() => { const f=document.querySelector('#addTableForm'); f.elements.tableId.value='QA99'; f.elements.seats.value='4'; f.elements.experience.value='Regular'; f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); })()`);
    assert((await evaluate(connection, "getRestaurantTableLayout(getRestaurantById(adminSelectedRestaurantId)).length")) === beforeTableAdd + 1, "Table add persists");
    acceptDialogs = false;
    await click(connection, '[data-delete-table-id="QA99"]');
    await delay(100);
    assert((await evaluate(connection, "getRestaurantTableLayout(getRestaurantById(adminSelectedRestaurantId)).some(t => t.tableId === 'QA99')")), "Table deletion can be cancelled");
    acceptDialogs = true;
    await click(connection, '[data-delete-table-id="QA99"]');
    await delay(100);
    assert(!(await evaluate(connection, "getRestaurantTableLayout(getRestaurantById(adminSelectedRestaurantId)).some(t => t.tableId === 'QA99')")), "Confirmed table deletion persists");

    await selectSection(connection, "reservations");
    const beforeStatusCount = await evaluate(connection, "getReservations().length");
    await setValue(connection, "#reservationSearchInput", "RSV-QA-1002");
    await setValue(connection, "[data-reservation-status-id]", "completed", "change");
    assert((await evaluate(connection, "getReservations().find(r => r.reservationId === 'RSV-QA-1002').status")) === "completed", "Allowed reservation status transition persists");
    assert((await evaluate(connection, "getReservations().length")) === beforeStatusCount, "Status transition preserves reservation history");
    await setValue(connection, "#reservationSearchInput", "RSV-QA-1001");
    acceptDialogs = true;
    await setValue(connection, "[data-reservation-status-id]", "cancelled", "change");
    assert((await evaluate(connection, "getReservations().find(r => r.reservationId === 'RSV-QA-1001').status")) === "cancelled", "Cancellation updates status only");
    assert((await evaluate(connection, "getReservations().length")) === beforeStatusCount, "Cancellation retains reservation record");

    await selectSection(connection, "support");
    assert((await evaluate(connection, "document.querySelectorAll('.support-request-row').length")) === 2, "Populated support inbox renders");
    assert((await evaluate(connection, "document.querySelector('.support-request-detail')?.textContent || ''")).includes("invited guest list"), "Full support message opens");
    await screenshot(connection, "admin-support-1440x900.png");
    await setValue(connection, "#supportSearchInput", "SUP-QA-02");
    assert((await evaluate(connection, "document.querySelectorAll('.support-request-row').length")) === 1, "Support search filters requests");
    await setValue(connection, "#supportSearchInput", "");
    await setValue(connection, "#supportTopicFilter", "Technical Problem", "change");
    assert((await evaluate(connection, "document.querySelectorAll('.support-request-row').length")) === 1, "Support topic filter works");
    await setValue(connection, "#supportTopicFilter", "all", "change");
    await setValue(connection, "#supportStatusFilter", "new", "change");
    assert((await evaluate(connection, "document.querySelectorAll('.support-request-row').length")) === 1, "Support status filter works");
    await setValue(connection, "#supportStatusFilter", "all", "change");
    await setValue(connection, "[data-support-status-index]", "in-progress", "change");
    assert((await evaluate(connection, "JSON.parse(localStorage.getItem('jacksSupportRequests'))[0].status")) === "in-progress", "Support status persists as in-progress");
    await setValue(connection, "[data-support-status-index]", "resolved", "change");
    assert((await evaluate(connection, "JSON.parse(localStorage.getItem('jacksSupportRequests'))[0].status")) === "resolved", "Support status persists as resolved");

    await selectSection(connection, "settings");
    await screenshot(connection, "admin-settings-1440x900.png");
    await setValue(connection, "[data-price-tier-seats='4']", "18");
    await evaluate(connection, "document.querySelector('#priceTierForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))");
    assert((await evaluate(connection, "JSON.parse(localStorage.getItem('priceTiers'))['4']")) === 18, "Settings pricing persists");

    await evaluate(connection, "location.reload()");
    await waitFor(connection, "document.querySelector('#adminDashboard')?.children.length > 0");
    assert((await evaluate(connection, "getPriceTiers()['4']")) === 18, "Refresh retains settings");
    assert((await evaluate(connection, "getSupportRequests().some(r => r.status === 'resolved')")), "Refresh retains support updates");

    await selectSection(connection, "dashboard");
    await setViewport(connection, 390, 844, true);
    assert((await evaluate(connection, "document.documentElement.scrollWidth <= document.documentElement.clientWidth")), "Mobile has no horizontal overflow");
    assert(await click(connection, "#adminMenuButton"), "Mobile navigation opens");
    assert((await evaluate(connection, "document.querySelector('#adminSidebar').classList.contains('is-open')")), "Mobile drawer is visible");
    await screenshot(connection, "admin-mobile-390x844.png");
    await setViewport(connection, 1440, 900, false);

    const customerReservationCount = await evaluate(connection, "getReservations().length");
    await navigate(connection, `${baseUrl}/index.html`, "document.readyState === 'complete'");
    assert((await evaluate(connection, "document.body !== null")), "Customer website still loads");
    assert((await evaluate(connection, "JSON.parse(localStorage.getItem('reservations') || '[]').length")) === customerReservationCount, "Customer reservation data remains intact");
    await navigate(connection, dashboardUrl, "location.pathname.endsWith('/pages/admin/index.html') && document.querySelector('#adminDashboard')?.children.length > 0");

    await selectSection(connection, "support");
    await evaluate(connection, "localStorage.setItem('jacksSupportRequests', '{bad json'); renderActiveAdminSection()");
    assert((await evaluate(connection, "document.querySelector('.support-empty-state') !== null")), "Malformed support storage shows a safe empty state");
    await evaluate(connection, "localStorage.setItem('restaurants', JSON.stringify([null,{},'old'])); localStorage.setItem('reservations','{bad'); localStorage.setItem('waitlist','null'); setActiveAdminSection('dashboard')");
    assert((await evaluate(connection, "document.querySelectorAll('.overview-card').length")) >= 7, "Malformed and older storage does not crash dashboard");
    await evaluate(connection, "localStorage.setItem('restaurants', '[]'); setActiveAdminSection('restaurants')");
    assert((await evaluate(connection, "document.querySelector('.empty-state')?.textContent || ''")).includes("No restaurants"), "Empty restaurant storage shows a safe empty state");

    const usersBeforeLogout = await evaluate(connection, "localStorage.getItem('users')");
    await click(connection, "#adminLogoutButton");
    await waitFor(connection, "location.pathname.endsWith('/pages/admin/login.html')");
    assert((await evaluate(connection, "localStorage.getItem('adminSession') === null")), "Logout clears only Admin session");
    assert((await evaluate(connection, "localStorage.getItem('users')")) === usersBeforeLogout, "Logout preserves user storage");
    await navigate(connection, dashboardUrl, "location.pathname.endsWith('/pages/admin/login.html')");
    assert((await evaluate(connection, "location.pathname.endsWith('/pages/admin/login.html')")), "Logged-out access redirects to Admin login");
    await evaluate(connection, "localStorage.setItem('users', JSON.stringify([{id:'qa-customer',name:'Customer Only',email:'customer@example.com',password:'customer'}])); localStorage.setItem('adminSession', JSON.stringify({userId:'qa-customer',email:'customer@example.com',role:'guest'}))");
    await navigate(connection, dashboardUrl, "location.pathname.endsWith('/pages/admin/login.html')");
    assert((await evaluate(connection, "location.pathname.endsWith('/pages/admin/login.html')")), "Customer accounts cannot access Admin dashboard");

    assert(dialogCount >= 2, "Destructive actions request confirmation", `dialogs observed: ${dialogCount}`);
    assert(runtimeErrors.length === 0, "Browser runtime has no exceptions", runtimeErrors.join(" | "));
    assert(consoleErrors.length === 0, "Browser console is clean", consoleErrors.join(" | "));
    const meaningfulNetworkErrors = networkErrors.filter((error) => !error.includes("ERR_ABORTED"));
    assert(meaningfulNetworkErrors.length === 0, "Browser network is clean", meaningfulNetworkErrors.join(" | "));

    const report = {
        passed: tests.filter((test) => test.passed).length,
        failed: tests.filter((test) => !test.passed).length,
        tests,
        consoleErrors,
        runtimeErrors,
        networkErrors,
    };
    console.log(JSON.stringify(report, null, 2));
} finally {
    connection.close();
}
