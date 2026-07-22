import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const pageUrl = process.argv[2] ?? "http://127.0.0.1:8765/";
const screenshotPath = path.resolve(
  process.argv[3] ?? "artifacts/homepage-1440x900-final.png",
);
const viewportWidth = Number(process.argv[4] ?? 1440);
const viewportHeight = Number(process.argv[5] ?? 900);
const captureSelector = process.argv[6] ?? "";

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function getOpenPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => { 
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

async function pollForTarget(port) {
  const endpoint = `http://127.0.0.1:${port}/json/list`;

  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(endpoint);
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
  const profileDirectory = await mkdtemp(
    path.join(os.tmpdir(), "jacks-homepage-qa-"),
  );
  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--hide-scrollbars",
      "--disable-gpu",
      "--autoplay-policy=no-user-gesture-required",
      `--remote-debugging-port=${debuggingPort}`,
      `--user-data-dir=${profileDirectory}`,
      `--window-size=${viewportWidth},${viewportHeight}`,
      "about:blank",
    ],
    { stdio: "ignore", windowsHide: true },
  );

  let socket;

  try {
    const target = await pollForTarget(debuggingPort);
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });

    let requestId = 0;
    const pendingRequests = new Map();
    const eventWaiters = new Map();
    const browserMessages = [];

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

      if (
        message.method === "Runtime.exceptionThrown" ||
        message.method === "Runtime.consoleAPICalled" ||
        message.method === "Log.entryAdded"
      ) {
        browserMessages.push({ method: message.method, params: message.params });
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
        returnByValue: true,
      });
      if (response.exceptionDetails) {
        throw new Error(
          response.exceptionDetails.exception?.description ??
            response.exceptionDetails.text,
        );
      }
      return response.result.value;
    };

    await Promise.all([
      send("Page.enable"),
      send("Runtime.enable"),
      send("Log.enable"),
      send("Network.enable"),
    ]);
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    await send("Emulation.setDeviceMetricsOverride", {
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: viewportWidth,
      screenHeight: viewportHeight,
    });

    const loaded = waitForEvent("Page.loadEventFired");
    await send("Page.navigate", { url: pageUrl });
    await loaded;

    const renderState = await evaluate(`(async () => {
      const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
      const video = document.querySelector('#heroBackgroundVideo');
      const captureSelector = ${JSON.stringify(captureSelector)};
      await document.fonts.ready;
      await Promise.all([...document.images].map(async (image) => {
        if (!image.complete) {
          await Promise.race([
            new Promise((resolve) => {
              image.addEventListener('load', resolve, { once: true });
              image.addEventListener('error', resolve, { once: true });
            }),
            wait(5000),
          ]);
        }
        if (image.complete && image.decode) await image.decode().catch(() => {});
      }));
      if (video && video.readyState < 2) {
        await Promise.race([
          new Promise((resolve) => video.addEventListener('loadeddata', resolve, { once: true })),
          wait(5000),
        ]);
      }
      if (video) {
        video.pause();
        if (Math.abs(video.currentTime) > 0.001) {
          const seeked = new Promise((resolve) => video.addEventListener('seeked', resolve, { once: true }));
          video.currentTime = 0;
          await Promise.race([seeked, wait(3000)]);
        }
      }
      if (captureSelector) {
        const captureTarget = document.querySelector(captureSelector);
        if (captureTarget) {
          document.documentElement.style.scrollBehavior = 'auto';
          scrollTo(0, captureTarget.getBoundingClientRect().top + scrollY);
          await wait(80);
        }
      }
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const rect = (selector) => {
        const node = document.querySelector(selector);
        if (!node) return null;
        const box = node.getBoundingClientRect();
        return {
          x: Math.round(box.x * 10) / 10,
          y: Math.round(box.y * 10) / 10,
          width: Math.round(box.width * 10) / 10,
          height: Math.round(box.height * 10) / 10,
        };
      };
      const styles = (selector) => {
        const node = document.querySelector(selector);
        if (!node) return null;
        const style = getComputedStyle(node);
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          color: style.color,
        };
      };
      return {
        viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
        title: document.title,
        rects: {
          header: rect('.site-header'),
          hero: rect('.home-hero'),
          heroContent: rect('.home-hero-content'),
          reservationBar: rect('.home-hero-search'),
          curatedSection: rect('.home-curated-section'),
          discoverySection: rect('.home-results-section'),
          discoveryHeading: rect('.home-discovery-heading'),
          discoveryToolbar: rect('.home-discovery-toolbar'),
          discoveryPlan: rect('.home-discovery-plan'),
          discoveryGrid: rect('.home-discovery-grid'),
          firstRestaurantCard: rect('.home-discovery-grid .restaurant-card'),
          firstCardImage: rect('.home-discovery-grid .restaurant-card .card-image'),
          firstCardHeading: rect('.home-discovery-grid .restaurant-card .discovery-card-heading'),
          firstCardLocation: rect('.home-discovery-grid .restaurant-card .location'),
          firstCardBadges: rect('.home-discovery-grid .restaurant-card .badges'),
          firstCardAvailability: rect('.home-discovery-grid .restaurant-card .discovery-availability'),
          firstCardActions: rect('.home-discovery-grid .restaurant-card .discovery-card-actions'),
          discoveryFilters: rect('.home-discovery-filters'),
        },
        discoveryFilterLayout: (() => {
          const node = document.querySelector('.home-discovery-filters');
          if (!node) return null;
          const style = getComputedStyle(node);
          return {
            justifyContent: style.justifyContent,
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight,
            columnGap: style.columnGap,
          };
        })(),
        discoveryFilterRects: [...document.querySelectorAll('.home-discovery-filter-control')]
          .map((node) => {
            const box = node.getBoundingClientRect();
            return {
              label: node.querySelector('.home-discovery-filter-value')?.textContent?.trim(),
              x: Math.round(box.x * 10) / 10,
              width: Math.round(box.width * 10) / 10,
            };
          }),
        typography: {
          heading: styles('.home-hero-content h1'),
          body: styles('.home-hero-copy'),
          interface: styles('.site-header'),
        },
        fontsLoaded: {
          playfairDisplay: document.fonts.check('76px "Playfair Display"'),
          dmSans: document.fonts.check('16px "DM Sans"'),
        },
        video: video ? {
          src: video.currentSrc,
          currentTime: video.currentTime,
          paused: video.paused,
          readyState: video.readyState,
        } : null,
      };
    })()`);

    await mkdir(path.dirname(screenshotPath), { recursive: true });
    const screenshot = await send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));

    const interactionState = await evaluate(`(async () => {
      const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
      const restaurantsLink = document.querySelector('#restaurantsNavLink')
        ?? document.querySelector('a[href="#restaurants"]');
      const restaurantSection = document.querySelector('#restaurants');
      if (restaurantsLink) {
        restaurantsLink.click();
      } else {
        history.replaceState(null, '', '#restaurants');
        restaurantSection.scrollIntoView({ behavior: 'smooth' });
      }
      await wait(900);
      const navigation = {
        hash: location.hash,
        scrollY: Math.round(scrollY),
        targetTop: Math.round(restaurantSection.getBoundingClientRect().top),
      };

      scrollTo(0, 0);
      const input = document.querySelector('#searchInput');
      input.value = 'Mediterranean';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await wait(80);
      const filteredCards = [...document.querySelectorAll('#restaurantGrid .restaurant-card')];
      const search = {
        query: input.value,
        resultCount: filteredCards.length,
        resultNames: filteredCards.map((card) => card.querySelector('h3')?.textContent?.trim()),
      };

      document.querySelector('#searchForm').dispatchEvent(new Event('submit', {
        bubbles: true,
        cancelable: true,
      }));
      await wait(900);
      search.submitScrollY = Math.round(scrollY);
      search.gridTop = Math.round(document.querySelector('#restaurantGrid').getBoundingClientRect().top);

      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await wait(80);
      search.restoredResultCount = document.querySelectorAll('#restaurantGrid .restaurant-card').length;
      input.focus();
      const focusedField = input.closest('.home-availability-field');
      const accessibility = {
        searchFocusRing: getComputedStyle(focusedField).boxShadow,
        decorativeVideoHidden: document.querySelector('#heroBackgroundVideo')?.getAttribute('aria-hidden'),
        videoToggleLabel: document.querySelector('#heroVideoToggle')?.getAttribute('aria-label'),
      };
      input.blur();

      const discoveryInput = document.querySelector('#discoverySearchInput');
      let discovery = null;
      if (discoveryInput) {
        discoveryInput.value = 'Japanese';
        discoveryInput.dispatchEvent(new Event('input', { bubbles: true }));
        await wait(100);
        const japaneseCards = [...document.querySelectorAll('#restaurantGrid .restaurant-card')];
        const japaneseResultNames = japaneseCards.map((card) => card.querySelector('h3')?.textContent?.trim());

        document.querySelector('#discoveryClearFilters').click();
        await wait(100);
        const cuisineSelect = document.querySelector('[data-discovery-filter="cuisine"]');
        cuisineSelect.value = 'Mediterranean';
        cuisineSelect.dispatchEvent(new Event('change', { bubbles: true }));
        await wait(100);
        const mediterraneanNames = [...document.querySelectorAll('#restaurantGrid .restaurant-card')]
          .map((card) => card.querySelector('h3')?.textContent?.trim());

        document.querySelector('#discoveryResetFilters').click();
        await wait(100);
        const firstCard = document.querySelector('#restaurantGrid .restaurant-card');
        const favoriteButton = firstCard?.querySelector('.discovery-favorite-button');
        const timeSlot = firstCard?.querySelector('.discovery-time-slot');
        favoriteButton?.click();
        timeSlot?.click();
        const listViewButton = document.querySelector('[data-discovery-view="list"]');
        const gridViewButton = document.querySelector('[data-discovery-view="grid"]');
        listViewButton?.click();
        const listViewActivated = document.querySelector('#restaurantGrid').classList.contains('is-list-view');
        gridViewButton?.click();

        discoveryInput.focus();
        const discoveryFocusRing = getComputedStyle(discoveryInput.closest('.home-discovery-search')).boxShadow;
        discoveryInput.blur();

        discovery = {
          initialResultCount: search.restoredResultCount,
          japaneseResultCount: japaneseCards.length,
          japaneseResultNames,
          mediterraneanResultNames: mediterraneanNames,
          restoredResultCount: document.querySelectorAll('#restaurantGrid .restaurant-card').length,
          resultCountLabel: document.querySelector('#discoveryResultCount')?.textContent?.trim(),
          preservedBadgeCount: firstCard?.querySelectorAll('.badge').length ?? 0,
          preservedBadges: [...(firstCard?.querySelectorAll('.badge') ?? [])].map((badge) => badge.textContent.trim()),
          bookingButtons: firstCard?.querySelectorAll('.book-button[data-restaurant-id]').length ?? 0,
          favoritePressed: favoriteButton?.getAttribute('aria-pressed'),
          selectedTime: timeSlot?.classList.contains('active') ? timeSlot.dataset.time : null,
          listViewActivated,
          gridViewRestored: !document.querySelector('#restaurantGrid').classList.contains('is-list-view'),
          discoveryFocusRing,
          plan: {
            date: document.querySelector('#discoveryPlanDate')?.textContent?.trim(),
            time: document.querySelector('#discoveryPlanTime')?.textContent?.trim(),
            guests: document.querySelector('#discoveryPlanGuests')?.textContent?.trim(),
          },
        };
      }

      scrollTo(0, 0);
      const video = document.querySelector('#heroBackgroundVideo');
      const toggle = document.querySelector('.home-film-toggle');
      video.pause();
      const pausedBeforeToggle = video.paused;
      toggle.click();
      await wait(350);
      const playingAfterToggle = !video.paused;
      toggle.click();
      await wait(80);

      return {
        navigation,
        search,
        accessibility,
        discovery,
        videoToggle: {
          pausedBeforeToggle,
          playingAfterToggle,
          pausedAfterSecondToggle: video.paused,
          ariaLabel: toggle.getAttribute('aria-label'),
        },
        links: {
          discover: restaurantsLink?.getAttribute('href') ?? '#restaurants',
          concierge: document.querySelector('#smartConciergeLink')?.getAttribute('href'),
          bookings: document.querySelector('.nav a[href="pages/profile.html"]')?.getAttribute('href'),
          auth: document.querySelector('#authNavLink')?.getAttribute('href'),
        },
      };
    })()`);

    let bookingState = null;
    if (captureSelector) {
      const bookingLoaded = waitForEvent("Page.loadEventFired");
      await evaluate(`document.querySelector('.home-discovery-grid .book-button:not(.discovery-exact-table-button)')?.click()`);
      await Promise.race([bookingLoaded, delay(3000)]);
      bookingState = await evaluate(`({
        url: location.href,
        pendingAction: localStorage.getItem('pendingAction'),
      })`);
    }

    const actionableBrowserMessages = browserMessages
      .filter((entry) => {
        if (entry.method === "Runtime.consoleAPICalled") {
          return ["error", "warning"].includes(entry.params.type);
        }
        return true;
      })
      .map((entry) => {
        if (entry.method === "Runtime.consoleAPICalled") {
          return {
            type: entry.params.type,
            text: entry.params.args
              .map((argument) => argument.value ?? argument.description ?? "")
              .join(" "),
          };
        }
        if (entry.method === "Runtime.exceptionThrown") {
          return {
            type: "exception",
            text:
              entry.params.exceptionDetails.exception?.description ??
              entry.params.exceptionDetails.text,
          };
        }
        return {
          type: entry.params.entry.level,
          text: entry.params.entry.text,
        };
      });

    console.log(
      JSON.stringify(
        {
          screenshotPath,
          renderState,
          interactionState,
          bookingState,
          browserMessages: actionableBrowserMessages,
        },
        null,
        2,
      ),
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
