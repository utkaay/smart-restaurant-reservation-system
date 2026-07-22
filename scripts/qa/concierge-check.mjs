import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const cdpBaseUrl = process.argv[2] ?? "http://127.0.0.1:9333";
const pageUrl = process.argv[3] ?? "http://127.0.0.1:8765/pages/concierge.html";
const artifactDirectory = path.resolve(process.argv[4] ?? "artifacts/concierge");

const moodOptions = ["Date Night", "Family Friendly", "Quick Bite", "Fine Dining", "Casual"];
const budgetOptions = ["$", "$$", "$$$", "$$$$"];
const distanceOptions = ["Nearby", "Medium", "Far"];
const screenshotSpecifications = [
  { name: "smart-concierge-1586x992.png", width: 1586, height: 992, mobile: false },
  { name: "smart-concierge-390x844.png", width: 390, height: 844, mobile: true },
  {
    name: "smart-concierge-390x844-results.png",
    width: 390,
    height: 844,
    mobile: true,
    scrollSelector: ".concierge-results-area",
  },
];

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

class CdpConnection {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 0;
    this.pendingRequests = new Map();
    this.eventListeners = new Set();

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));

      if (message.id) {
        const pendingRequest = this.pendingRequests.get(message.id);
        if (!pendingRequest) return;
        this.pendingRequests.delete(message.id);
        clearTimeout(pendingRequest.timeoutId);

        if (message.error) {
          pendingRequest.reject(
            new Error(`${pendingRequest.method}: ${message.error.message}`),
          );
        } else {
          pendingRequest.resolve(message.result ?? {});
        }
        return;
      }

      this.eventListeners.forEach((listener) => listener(message));
    });
  }

  static async connect(webSocketUrl) {
    const socket = new WebSocket(webSocketUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    return new CdpConnection(socket);
  }

  onEvent(listener) {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  send(method, params = {}, sessionId = "", timeoutMilliseconds = 60_000) {
    return new Promise((resolve, reject) => {
      this.nextId += 1;
      const id = this.nextId;
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`${method}: timed out after ${timeoutMilliseconds}ms`));
      }, timeoutMilliseconds);

      this.pendingRequests.set(id, { method, resolve, reject, timeoutId });
      this.socket.send(
        JSON.stringify({
          id,
          method,
          params,
          ...(sessionId ? { sessionId } : {}),
        }),
      );
    });
  }

  close() {
    if (
      this.socket.readyState === WebSocket.OPEN ||
      this.socket.readyState === WebSocket.CONNECTING
    ) {
      this.socket.close();
    }
  }
}

async function getBrowserWebSocketUrl() {
  let response;

  try {
    response = await fetch(`${cdpBaseUrl}/json/version`);
  } catch (error) {
    throw new Error(
      `Unable to connect to Chrome at ${cdpBaseUrl}. Start Chrome with --remote-debugging-port=9333. ${error.message}`,
    );
  }

  if (!response.ok) {
    throw new Error(`Chrome CDP endpoint returned HTTP ${response.status}.`);
  }

  const version = await response.json();
  if (!version.webSocketDebuggerUrl) {
    throw new Error("Chrome CDP endpoint did not provide webSocketDebuggerUrl.");
  }

  return { version, webSocketDebuggerUrl: version.webSocketDebuggerUrl };
}

async function evaluate(connection, target, expression, timeoutMilliseconds = 60_000) {
  const response = await connection.send(
    "Runtime.evaluate",
    {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    },
    target.sessionId,
    timeoutMilliseconds,
  );

  if (response.exceptionDetails) {
    const description =
      response.exceptionDetails.exception?.description ??
      response.exceptionDetails.text ??
      "Runtime evaluation failed";
    throw new Error(description);
  }

  return response.result?.value;
}

async function waitForExpression(
  connection,
  target,
  expression,
  timeoutMilliseconds = 15_000,
) {
  const deadline = Date.now() + timeoutMilliseconds;

  while (Date.now() < deadline) {
    try {
      if (await evaluate(connection, target, `Boolean(${expression})`)) return;
    } catch {
      // A navigation can briefly destroy the previous execution context.
    }
    await delay(75);
  }

  throw new Error(`Timed out waiting for: ${expression}`);
}

async function createTarget(
  connection,
  browserContextId,
  label,
  sessionLabels,
) {
  const { targetId } = await connection.send("Target.createTarget", {
    url: "about:blank",
    browserContextId,
  });
  const { sessionId } = await connection.send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });
  const target = { label, targetId, sessionId };
  sessionLabels.set(sessionId, label);

  await connection.send("Page.enable", {}, sessionId);
  await connection.send("Runtime.enable", {}, sessionId);
  await connection.send("Log.enable", {}, sessionId);

  return target;
}

async function closeTarget(connection, target, sessionLabels) {
  if (!target) return;
  sessionLabels.delete(target.sessionId);
  await connection.send("Target.closeTarget", { targetId: target.targetId });
}

async function navigate(connection, target, url) {
  const navigation = await connection.send(
    "Page.navigate",
    { url },
    target.sessionId,
  );
  if (navigation.errorText) {
    throw new Error(`Page.navigate failed for ${url}: ${navigation.errorText}`);
  }

  try {
    await waitForExpression(
      connection,
      target,
      `["interactive", "complete"].includes(document.readyState) && location.href.startsWith(${JSON.stringify(url)})`,
    );
  } catch (error) {
    const diagnostic = await evaluate(
      connection,
      target,
      `({ href: location.href, readyState: document.readyState, title: document.title })`,
    ).catch((diagnosticError) => ({ evaluationError: diagnosticError.message }));
    throw new Error(`${error.message}. Navigation state: ${JSON.stringify(diagnostic)}`);
  }
}

async function waitForConcierge(connection, target) {
  await waitForExpression(
    connection,
    target,
    `
      document.body?.dataset.customerPage === "concierge" &&
      document.querySelectorAll("[data-smart-filter]").length === 3 &&
      document.querySelectorAll(".concierge-mood-option").length === 5 &&
      Boolean(document.querySelector("#conciergeFindMatches")) &&
      Boolean(document.querySelector(".concierge-results-panel"))
    `,
  );
  await delay(250);
}

async function setConciergeFilters(connection, target, filters) {
  for (const [key, value] of Object.entries(filters)) {
    const changed = await evaluate(
      connection,
      target,
      `(async () => {
        const selector = '[data-smart-filter="' + ${JSON.stringify(key)} + '"]';
        const previous = document.querySelector(selector);
        if (!previous) return false;
        previous.value = ${JSON.stringify(value)};
        previous.dispatchEvent(new Event("change", { bubbles: true }));
        for (let attempt = 0; attempt < 100; attempt += 1) {
          const current = document.querySelector(selector);
          if (
            current &&
            current !== previous &&
            current.value === ${JSON.stringify(value)} &&
            document.querySelectorAll(".concierge-mood-option").length === 5 &&
            document.querySelector("#conciergeFindMatches") &&
            document.querySelector(".concierge-results-panel")
          ) {
            return true;
          }
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        return false;
      })()`,
    );

    if (!changed) {
      throw new Error(`Concierge filter did not rerender: ${key}=${value}`);
    }
  }
}

function formatBrowserMessage(message, label) {
  if (message.method === "Runtime.consoleAPICalled") {
    return {
      target: label,
      source: "console",
      level: message.params.type,
      text: message.params.args
        .map((argument) => argument.value ?? argument.description ?? "")
        .join(" "),
    };
  }

  if (message.method === "Runtime.exceptionThrown") {
    return {
      target: label,
      source: "runtime",
      level: "exception",
      text:
        message.params.exceptionDetails.exception?.description ??
        message.params.exceptionDetails.text,
    };
  }

  return {
    target: label,
    source: "log",
    level: message.params.entry.level,
    text: message.params.entry.text,
    url: message.params.entry.url ?? "",
  };
}

function getPngDimensions(buffer) {
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a" || buffer.length < 24) {
    throw new Error("Screenshot output is not a valid PNG.");
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

async function captureScreenshot(connection, target, specification) {
  await connection.send(
    "Emulation.setDeviceMetricsOverride",
    {
      width: specification.width,
      height: specification.height,
      deviceScaleFactor: 1,
      mobile: specification.mobile,
      screenWidth: specification.width,
      screenHeight: specification.height,
      screenOrientation: {
        type: specification.width > specification.height ? "landscapePrimary" : "portraitPrimary",
        angle: 0,
      },
    },
    target.sessionId,
  );
  await evaluate(
    connection,
    target,
    `(async () => {
      const scrollSelector = ${JSON.stringify(specification.scrollSelector ?? "")};
      if (scrollSelector) {
        const target = document.querySelector(scrollSelector);
        const header = document.querySelector(".site-header");
        const headerOffset = header?.getBoundingClientRect().height ?? 0;
        if (target) {
          window.scrollTo(0, window.scrollY + target.getBoundingClientRect().top - headerOffset - 8);
        }
      } else {
        window.scrollTo(0, 0);
      }
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 450));
      return {
        innerWidth,
        innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
      };
    })()`,
  );

  const viewportState = await evaluate(
    connection,
    target,
    `({
      innerWidth,
      innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
    })`,
  );
  const { data } = await connection.send(
    "Page.captureScreenshot",
    {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    },
    target.sessionId,
  );
  const buffer = Buffer.from(data, "base64");
  const outputPath = path.join(artifactDirectory, specification.name);
  await writeFile(outputPath, buffer);

  return {
    outputPath,
    bytes: buffer.length,
    ...getPngDimensions(buffer),
    viewportState,
  };
}

function sameJson(first, second) {
  return JSON.stringify(first) === JSON.stringify(second);
}

async function run() {
  const checks = [];
  const recordCheck = (name, passed, detail = undefined) => {
    checks.push({ name, passed: Boolean(passed), ...(detail === undefined ? {} : { detail }) });
  };

  const { version, webSocketDebuggerUrl } = await getBrowserWebSocketUrl();
  const connection = await CdpConnection.connect(webSocketDebuggerUrl);
  const sessionLabels = new Map();
  const browserMessages = [];
  const openTargets = new Set();
  let browserContextId = "";

  connection.onEvent((message) => {
    if (
      ![
        "Runtime.consoleAPICalled",
        "Runtime.exceptionThrown",
        "Log.entryAdded",
      ].includes(message.method)
    ) {
      return;
    }

    const label = sessionLabels.get(message.sessionId);
    if (label) browserMessages.push(formatBrowserMessage(message, label));
  });

  try {
    ({ browserContextId } = await connection.send("Target.createBrowserContext"));
    await mkdir(artifactDirectory, { recursive: true });

    const mainTarget = await createTarget(
      connection,
      browserContextId,
      "main",
      sessionLabels,
    );
    openTargets.add(mainTarget);
    await navigate(connection, mainTarget, pageUrl);
    await waitForConcierge(connection, mainTarget);

    const initialState = await evaluate(
      connection,
      mainTarget,
      `(() => {
        const readCards = () => Array.from(document.querySelectorAll(".smart-recommendation-card")).map((card) => {
          const matchText = card.querySelector(".smart-card-image strong")?.textContent ??
            card.querySelector(".smart-card-image > span")?.textContent ?? "";
          return {
            id: Number(card.querySelector(".book-button")?.dataset.restaurantId),
            name: card.querySelector("h3")?.textContent.trim() ?? "",
            percentage: Number(matchText.match(/\\d+/)?.[0]),
          };
        });
        return {
          options: Object.fromEntries(["mood", "budget", "distance"].map((key) => [
            key,
            Array.from(document.querySelector('[data-smart-filter="' + key + '"]').options).map((option) => option.value),
          ])),
          selections: Object.fromEntries(["mood", "budget", "distance"].map((key) => [
            key,
            document.querySelector('[data-smart-filter="' + key + '"]').value,
          ])),
          selectedMoodPills: Array.from(document.querySelectorAll(".concierge-mood-option.is-selected")).map((button) => ({
            value: button.dataset.moodValue,
            pressed: button.getAttribute("aria-pressed"),
          })),
          actualCards: readCards(),
          expectedCards: getSmartRecommendations().map((restaurant) => ({
            id: Number(restaurant.id),
            name: restaurant.name,
            percentage: restaurant.match.percentage,
          })),
          ariaLive: document.querySelector("#smartConciergeView")?.getAttribute("aria-live"),
          findButtonText: document.querySelector("#conciergeFindMatches")?.textContent.trim(),
          nav: {
            home: document.querySelector("#homeLink")?.href,
            restaurants: document.querySelector('.main-nav a[href="../index.html#restaurants"]')?.href,
            concierge: document.querySelector("#smartConciergeLink")?.href,
            contact: document.querySelector('.main-nav a[href="contact.html"]')?.href,
            auth: document.querySelector("#authNavLink")?.href,
            authText: document.querySelector("#authNavLink")?.textContent.trim(),
            current: document.querySelector("#smartConciergeLink")?.getAttribute("aria-current"),
          },
        };
      })()`,
    );

    recordCheck("Mood options are unchanged", sameJson(initialState.options.mood, moodOptions), initialState.options.mood);
    recordCheck("Budget options are unchanged", sameJson(initialState.options.budget, budgetOptions), initialState.options.budget);
    recordCheck("Distance options are unchanged", sameJson(initialState.options.distance, distanceOptions), initialState.options.distance);
    recordCheck(
      "Default filters are unchanged",
      sameJson(initialState.selections, {
        mood: "Date Night",
        budget: "$$",
        distance: "Nearby",
      }),
      initialState.selections,
    );
    recordCheck(
      "Default recommendations match existing page functions",
      sameJson(initialState.actualCards, initialState.expectedCards),
      { actual: initialState.actualCards, expected: initialState.expectedCards },
    );
    recordCheck(
      "Default Mood pill mirrors the native Mood control",
      sameJson(initialState.selectedMoodPills, [{ value: "Date Night", pressed: "true" }]),
      initialState.selectedMoodPills,
    );
    recordCheck("Recommendation region remains polite", initialState.ariaLive === "polite", initialState.ariaLive);
    recordCheck("Find my matches control is present", initialState.findButtonText === "Find my matches", initialState.findButtonText);

    const expectedUrls = {
      home: new URL("../index.html", pageUrl).href,
      restaurants: new URL("../index.html#restaurants", pageUrl).href,
      concierge: new URL("concierge.html", pageUrl).href,
      contact: new URL("contact.html", pageUrl).href,
      auth: new URL("login.html", pageUrl).href,
      authText: "Login",
      current: "page",
    };
    recordCheck("All Concierge navigation URLs are correct", sameJson(initialState.nav, expectedUrls), {
      actual: initialState.nav,
      expected: expectedUrls,
    });

    const combinationState = await evaluate(
      connection,
      mainTarget,
      `(async () => {
        const moods = ${JSON.stringify(moodOptions)};
        const budgets = ${JSON.stringify(budgetOptions)};
        const distances = ${JSON.stringify(distanceOptions)};
        const failures = [];
        let tested = 0;

        const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
        const waitFor = async (predicate, attempts = 80) => {
          for (let attempt = 0; attempt < attempts; attempt += 1) {
            if (predicate()) return true;
            await sleep(20);
          }
          return false;
        };
        const setFilter = async (key, value) => {
          const selector = '[data-smart-filter="' + key + '"]';
          const previous = document.querySelector(selector);
          if (!previous) return false;
          previous.value = value;
          previous.dispatchEvent(new Event("change", { bubbles: true }));
          return waitFor(() => {
            const current = document.querySelector(selector);
            return current && current !== previous && current.value === value &&
              document.querySelectorAll(".concierge-mood-option").length === moods.length &&
              Boolean(document.querySelector("#conciergeFindMatches")) &&
              Boolean(document.querySelector(".concierge-results-panel"));
          });
        };
        const readActual = () => Array.from(document.querySelectorAll(".smart-recommendation-card")).map((card, index) => {
          const matchText = card.querySelector(".smart-card-image strong")?.textContent ??
            card.querySelector(".smart-card-image > span")?.textContent ?? "";
          return {
            id: Number(card.querySelector(".book-button")?.dataset.restaurantId),
            name: card.querySelector("h3")?.textContent.trim() ?? "",
            percentage: Number(matchText.match(/\\d+/)?.[0]),
            best: card.classList.contains("is-best-match"),
            action: card.querySelector(".book-button")?.textContent.trim() ?? "",
            index,
          };
        });
        const readExpected = () => getSmartRecommendations().map((restaurant, index) => ({
          id: Number(restaurant.id),
          name: restaurant.name,
          percentage: restaurant.match.percentage,
          best: index === 0,
          action: "Explore tables",
          index,
        }));

        for (const mood of moods) {
          for (const budget of budgets) {
            for (const distance of distances) {
              const moodChanged = await setFilter("mood", mood);
              const budgetChanged = await setFilter("budget", budget);
              const distanceChanged = await setFilter("distance", distance);
              tested += 1;

              if (!moodChanged || !budgetChanged || !distanceChanged) {
                failures.push({ mood, budget, distance, reason: "control did not rerender" });
                continue;
              }

              const actual = readActual();
              const expected = readExpected();
              if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                failures.push({ mood, budget, distance, reason: "recommendation mismatch", actual, expected });
              }
              if (actual.length > 3) {
                failures.push({ mood, budget, distance, reason: "more than three recommendations", count: actual.length });
              }
            }
          }
        }

        return { tested, failures };
      })()`,
      120_000,
    );
    recordCheck(
      "All 60 Mood/Budget/Distance combinations match existing scoring functions",
      combinationState.tested === 60 && combinationState.failures.length === 0,
      combinationState,
    );

    const moodPillState = await evaluate(
      connection,
      mainTarget,
      `(async () => {
        const moods = ${JSON.stringify(moodOptions)};
        const failures = [];
        const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
        const waitFor = async (predicate, attempts = 80) => {
          for (let attempt = 0; attempt < attempts; attempt += 1) {
            if (predicate()) return true;
            await sleep(20);
          }
          return false;
        };

        for (const mood of moods) {
          const previousSelect = document.querySelector('[data-smart-filter="mood"]');
          const pill = document.querySelector('.concierge-mood-option[data-mood-value="' + mood + '"]');
          if (!previousSelect || !pill) {
            failures.push({ mood, reason: "pill or select missing" });
            continue;
          }
          pill.click();
          const synchronized = await waitFor(() => {
            const currentSelect = document.querySelector('[data-smart-filter="mood"]');
            const selectedPills = Array.from(document.querySelectorAll(".concierge-mood-option.is-selected"));
            return currentSelect && currentSelect !== previousSelect && currentSelect.value === mood &&
              selectedPills.length === 1 && selectedPills[0].dataset.moodValue === mood &&
              selectedPills[0].getAttribute("aria-pressed") === "true";
          });
          if (!synchronized) failures.push({ mood, reason: "pill and native select diverged" });
        }

        return { tested: moods.length, failures };
      })()`,
    );
    recordCheck(
      "Every Mood pill stays synchronized through rerenders",
      moodPillState.tested === moodOptions.length && moodPillState.failures.length === 0,
      moodPillState,
    );

    const resetState = await evaluate(
      connection,
      mainTarget,
      `(async () => {
        const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
        const setFilter = async (key, value) => {
          const selector = '[data-smart-filter="' + key + '"]';
          const previous = document.querySelector(selector);
          previous.value = value;
          previous.dispatchEvent(new Event("change", { bubbles: true }));
          for (let attempt = 0; attempt < 80; attempt += 1) {
            const current = document.querySelector(selector);
            if (current && current !== previous && current.value === value && document.querySelector("#conciergeFindMatches")) return true;
            await sleep(20);
          }
          return false;
        };
        return {
          mood: await setFilter("mood", "Date Night"),
          budget: await setFilter("budget", "$$"),
          distance: await setFilter("distance", "Nearby"),
        };
      })()`,
    );
    recordCheck("Filters reset to the preserved default state", Object.values(resetState).every(Boolean), resetState);

    const findMatchesState = await evaluate(
      connection,
      mainTarget,
      `(async () => {
        const button = document.querySelector("#conciergeFindMatches");
        const panel = document.querySelector(".concierge-results-panel");
        const status = button?.nextElementSibling;
        if (!button || !panel || !status) return { present: false };
        button.click();
        const immediate = {
          refreshed: panel.classList.contains("is-refreshed"),
          status: status.textContent.trim(),
          role: status.getAttribute("role"),
        };
        await new Promise((resolve) => setTimeout(resolve, 800));
        return {
          present: true,
          immediate,
          removedAfterAnimation: !panel.classList.contains("is-refreshed"),
        };
      })()`,
    );
    recordCheck(
      "Find my matches refreshes, announces, and clears its visual state",
      findMatchesState.present &&
        findMatchesState.immediate.refreshed &&
        findMatchesState.immediate.role === "status" &&
        findMatchesState.immediate.status ===
          "Matches refreshed using the selected mood, budget, and distance." &&
        findMatchesState.removedAfterAnimation,
      findMatchesState,
    );

    const backTarget = await createTarget(
      connection,
      browserContextId,
      "back-route",
      sessionLabels,
    );
    openTargets.add(backTarget);
    await navigate(connection, backTarget, pageUrl);
    await waitForConcierge(connection, backTarget);
    await evaluate(connection, backTarget, `document.querySelector("#backFromConciergeButton").click()`);
    const expectedBackUrl = new URL("../index.html#restaurants", pageUrl).href;
    await waitForExpression(connection, backTarget, `location.href === ${JSON.stringify(expectedBackUrl)}`);
    const actualBackUrl = await evaluate(connection, backTarget, "location.href");
    recordCheck("Back to restaurants uses the preserved route", actualBackUrl === expectedBackUrl, actualBackUrl);
    await closeTarget(connection, backTarget, sessionLabels);
    openTargets.delete(backTarget);

    const bookingTarget = await createTarget(
      connection,
      browserContextId,
      "logged-out-booking",
      sessionLabels,
    );
    openTargets.add(bookingTarget);
    await navigate(connection, bookingTarget, pageUrl);
    await waitForConcierge(connection, bookingTarget);
    const bookingRestaurant = await evaluate(
      connection,
      bookingTarget,
      `(() => {
        const button = document.querySelector(".smart-recommendation-card .book-button[data-restaurant-id]");
        return button ? {
          id: Number(button.dataset.restaurantId),
          text: button.textContent.trim(),
          ariaLabel: button.getAttribute("aria-label"),
        } : null;
      })()`,
    );
    recordCheck("A recommendation exposes the preserved booking hook", Boolean(bookingRestaurant?.id), bookingRestaurant);
    await evaluate(
      connection,
      bookingTarget,
      `document.querySelector(".smart-recommendation-card .book-button[data-restaurant-id]").click()`,
    );
    const expectedLoginUrl = new URL("login.html", pageUrl).href;
    await waitForExpression(connection, bookingTarget, `location.href === ${JSON.stringify(expectedLoginUrl)}`);
    const bookingRouteState = await evaluate(
      connection,
      bookingTarget,
      `({
        url: location.href,
        pendingAction: JSON.parse(localStorage.getItem("pendingAction") || "null"),
        bookingDraft: JSON.parse(localStorage.getItem("bookingDraft") || "null"),
      })`,
    );
    recordCheck(
      "Logged-out Start Booking preserves pendingAction and routes to login",
      bookingRouteState.url === expectedLoginUrl &&
        bookingRouteState.pendingAction?.type === "booking" &&
        bookingRouteState.pendingAction?.restaurantId === bookingRestaurant.id &&
        bookingRouteState.bookingDraft === null,
      bookingRouteState,
    );
    await evaluate(connection, bookingTarget, `localStorage.removeItem("pendingAction")`);
    await closeTarget(connection, bookingTarget, sessionLabels);
    openTargets.delete(bookingTarget);

    const threeCardTarget = await createTarget(
      connection,
      browserContextId,
      "three-card-hooks",
      sessionLabels,
    );
    openTargets.add(threeCardTarget);
    await navigate(connection, threeCardTarget, pageUrl);
    await waitForConcierge(connection, threeCardTarget);
    await setConciergeFilters(connection, threeCardTarget, {
      budget: "$$",
      distance: "Far",
    });
    const threeCardState = await evaluate(
      connection,
      threeCardTarget,
      `({
        actual: Array.from(document.querySelectorAll(".smart-recommendation-card .book-button[data-restaurant-id]")).map((button) => ({
          id: Number(button.dataset.restaurantId),
          text: button.textContent.trim(),
          ariaLabel: button.getAttribute("aria-label"),
        })),
        expectedIds: getSmartRecommendations().map((restaurant) => Number(restaurant.id)),
      })`,
    );
    recordCheck(
      "A three-card filter state renders a delegated Explore tables hook for every recommendation",
      threeCardState.actual.length === 3 &&
        sameJson(
          threeCardState.actual.map(({ id }) => id),
          threeCardState.expectedIds,
        ) &&
        threeCardState.actual.every(
          ({ id, text, ariaLabel }) =>
            Number.isSafeInteger(id) &&
            text === "Explore tables" &&
            ariaLabel?.startsWith("Explore tables at "),
        ),
      threeCardState,
    );
    await closeTarget(connection, threeCardTarget, sessionLabels);
    openTargets.delete(threeCardTarget);

    const delegatedHookResults = [];
    for (const { id: restaurantId } of threeCardState.actual) {
      const hookTarget = await createTarget(
        connection,
        browserContextId,
        `delegated-hook-${restaurantId}`,
        sessionLabels,
      );
      openTargets.add(hookTarget);
      await navigate(connection, hookTarget, pageUrl);
      await waitForConcierge(connection, hookTarget);
      await setConciergeFilters(connection, hookTarget, {
        budget: "$$",
        distance: "Far",
      });
      const hookPresence = await evaluate(
        connection,
        hookTarget,
        `(() => {
          const button = Array.from(document.querySelectorAll(".book-button[data-restaurant-id]")).find(
            (candidate) => Number(candidate.dataset.restaurantId) === ${JSON.stringify(restaurantId)},
          );
          if (!button) return null;
          button.click();
          return { id: Number(button.dataset.restaurantId), text: button.textContent.trim() };
        })()`,
      );
      await waitForExpression(
        connection,
        hookTarget,
        `location.href === ${JSON.stringify(expectedLoginUrl)}`,
      );
      const hookRouteState = await evaluate(
        connection,
        hookTarget,
        `({
          url: location.href,
          pendingAction: JSON.parse(localStorage.getItem("pendingAction") || "null"),
          bookingDraft: JSON.parse(localStorage.getItem("bookingDraft") || "null"),
        })`,
      );
      delegatedHookResults.push({
        restaurantId,
        hookPresence,
        routeState: hookRouteState,
        passed:
          hookPresence?.id === restaurantId &&
          hookRouteState.url === expectedLoginUrl &&
          hookRouteState.pendingAction?.type === "booking" &&
          hookRouteState.pendingAction?.restaurantId === restaurantId &&
          hookRouteState.bookingDraft === null,
      });
      await evaluate(connection, hookTarget, `localStorage.removeItem("pendingAction")`);
      await closeTarget(connection, hookTarget, sessionLabels);
      openTargets.delete(hookTarget);
    }
    recordCheck(
      "Every rendered Explore tables button reaches the shared logged-out booking flow with its own restaurant ID",
      delegatedHookResults.length === 3 &&
        delegatedHookResults.every(({ passed }) => passed),
      delegatedHookResults,
    );

    const loggedInBookingTarget = await createTarget(
      connection,
      browserContextId,
      "logged-in-booking",
      sessionLabels,
    );
    openTargets.add(loggedInBookingTarget);
    await navigate(connection, loggedInBookingTarget, pageUrl);
    await waitForConcierge(connection, loggedInBookingTarget);
    const seededAuthState = await evaluate(
      connection,
      loggedInBookingTarget,
      `(() => {
        const user = {
          id: "concierge-qa-user",
          name: "Concierge QA",
          email: "concierge.qa@example.com",
          phone: "0500000000",
          password: "ConciergeQA1",
          role: "guest",
          favoriteCuisines: [],
          dietaryTags: [],
          contactPreference: "Email",
          createdAt: new Date().toISOString(),
        };
        const profile = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          favoriteCuisines: user.favoriteCuisines,
          dietaryTags: user.dietaryTags,
          contactPreference: user.contactPreference,
        };
        const authSession = {
          userId: user.id,
          email: user.email,
          role: "guest",
        };
        localStorage.setItem("users", JSON.stringify([user]));
        localStorage.setItem("currentUserId", JSON.stringify(user.id));
        localStorage.setItem("guestProfile", JSON.stringify(profile));
        localStorage.setItem("authSession", JSON.stringify(authSession));
        localStorage.removeItem("pendingAction");
        localStorage.removeItem("bookingDraft");
        return { user, profile, authSession };
      })()`,
    );
    await connection.send(
      "Page.reload",
      { ignoreCache: true },
      loggedInBookingTarget.sessionId,
    );
    await waitForConcierge(connection, loggedInBookingTarget);
    const loggedInRestaurant = await evaluate(
      connection,
      loggedInBookingTarget,
      `(() => {
        const button = document.querySelector(".smart-recommendation-card .book-button[data-restaurant-id]");
        const restaurantId = Number(button?.dataset.restaurantId);
        return {
          id: restaurantId,
          action: button?.textContent.trim(),
          authText: document.querySelector("#authNavLink")?.textContent.trim(),
          authHref: document.querySelector("#authNavLink")?.href,
          expectedDate: getTodayDateValue(),
        };
      })()`,
    );
    await evaluate(
      connection,
      loggedInBookingTarget,
      `document.querySelector(".smart-recommendation-card .book-button[data-restaurant-id]").click()`,
    );
    const expectedBookingUrl = new URL("booking.html", pageUrl).href;
    await waitForExpression(
      connection,
      loggedInBookingTarget,
      `location.href === ${JSON.stringify(expectedBookingUrl)}`,
    );
    await waitForExpression(
      connection,
      loggedInBookingTarget,
      `document.body?.dataset.customerPage === "booking" && typeof getRestaurantTimeSlots === "function"`,
    );
    const loggedInRouteState = await evaluate(
      connection,
      loggedInBookingTarget,
      `(() => {
        const bookingDraft = JSON.parse(localStorage.getItem("bookingDraft") || "null");
        const restaurant = getRestaurants().find(
          ({ id }) => Number(id) === Number(bookingDraft?.restaurantId),
        );
        return {
          url: location.href,
          pendingAction: JSON.parse(localStorage.getItem("pendingAction") || "null"),
          bookingDraft,
          currentUserId: JSON.parse(localStorage.getItem("currentUserId") || "null"),
          authSession: JSON.parse(localStorage.getItem("authSession") || "null"),
          validRestaurantTime:
            Boolean(restaurant) &&
            getRestaurantTimeSlots(restaurant).includes(bookingDraft?.time),
        };
      })()`,
    );
    const loggedInDraft = loggedInRouteState.bookingDraft;
    recordCheck(
      "Logged-in Start Booking routes directly to booking.html with the selected restaurant and preserved draft defaults",
      loggedInRestaurant.authText === "Profile" &&
        loggedInRestaurant.authHref === new URL("profile.html", pageUrl).href &&
        loggedInRestaurant.action === "Explore tables" &&
        loggedInRouteState.url === expectedBookingUrl &&
        loggedInRouteState.pendingAction === null &&
        loggedInRouteState.currentUserId === seededAuthState.user.id &&
        sameJson(loggedInRouteState.authSession, seededAuthState.authSession) &&
        loggedInDraft?.restaurantId === loggedInRestaurant.id &&
        loggedInDraft?.date === loggedInRestaurant.expectedDate &&
        loggedInRouteState.validRestaurantTime &&
        loggedInDraft?.partySize === 1 &&
        loggedInDraft?.mood === "" &&
        loggedInDraft?.tableId === "" &&
        sameJson(loggedInDraft?.selectedSeatIds, []) &&
        loggedInDraft?.experienceFilter === "Regular" &&
        loggedInDraft?.couponCode === "" &&
        loggedInDraft?.memberTier === "Standard" &&
        sameJson(loggedInDraft?.invitedGuests, []) &&
        sameJson(loggedInDraft?.preOrderItems, {}) &&
        loggedInDraft?.confirmedReservation === null,
      {
        seededAuthState,
        loggedInRestaurant,
        routeState: loggedInRouteState,
      },
    );
    await closeTarget(connection, loggedInBookingTarget, sessionLabels);
    openTargets.delete(loggedInBookingTarget);

    const screenshots = [];
    for (const specification of screenshotSpecifications) {
      const screenshot = await captureScreenshot(connection, mainTarget, specification);
      screenshots.push(screenshot);
      recordCheck(
        `${specification.width}x${specification.height} screenshot has exact dimensions`,
        screenshot.width === specification.width && screenshot.height === specification.height,
        screenshot,
      );
      recordCheck(
        `${specification.width}px viewport has no horizontal overflow`,
        screenshot.viewportState.scrollWidth <= specification.width,
        screenshot.viewportState,
      );
    }

    await delay(500);
    const actionableBrowserMessages = browserMessages.filter((message) => {
      if (message.source === "runtime") return true;
      return ["error", "warning", "assert", "exception"].includes(message.level);
    });
    recordCheck(
      "No console, runtime, or browser-log errors or warnings",
      actionableBrowserMessages.length === 0,
      actionableBrowserMessages,
    );

    const failedChecks = checks.filter((check) => !check.passed);
    const report = {
      passed: failedChecks.length === 0,
      browser: version.Browser,
      protocolVersion: version["Protocol-Version"],
      cdpBaseUrl,
      pageUrl,
      combinationsTested: combinationState.tested,
      checks,
      failedChecks,
      browserMessages: actionableBrowserMessages,
      screenshots,
    };

    console.log(JSON.stringify(report, null, 2));
    if (failedChecks.length) process.exitCode = 1;
  } finally {
    for (const target of openTargets) {
      try {
        await closeTarget(connection, target, sessionLabels);
      } catch {
        // The browser context cleanup below also closes any remaining targets.
      }
    }
    if (browserContextId) {
      try {
        await connection.send("Target.disposeBrowserContext", { browserContextId });
      } catch {
        // Chrome may already have disposed the context after a fatal failure.
      }
    }
    connection.close();
  }
}

run().catch((error) => {
  console.error(error.stack ?? error);
  process.exitCode = 1;
});
