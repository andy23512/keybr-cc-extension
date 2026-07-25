import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const EXTENSION_ROOT = path.join(here, "..");
export const DIST = path.join(EXTENSION_ROOT, "dist");
export const SITE_URL = "https://www.keybr.com/";
export const SNAPSHOT = path.join(here, "snapshot", "keybr.html");
export const OVERLAY_ROOT = "#keybr-cc-extension-root";

// The adapter these E2E tests exercise lives in src/site-config.ts. Kept in
// sync by hand; the point of the suite is to catch when the site's markup
// drifts away from them.
export const CURSOR_SELECTOR = 'div[dir="ltr"] span[class]';
export const REST_SELECTOR = 'div[dir="ltr"] span[class] ~ span';

/**
 * Launches Chromium with the built extension loaded, and does not return until
 * it has *proven the extension's code actually runs*.
 *
 * Two hard constraints, learned the slow way, and neither has a workaround:
 *
 *   1. It must be headed. Playwright's headless shell cannot run extensions at
 *      all — the service worker never starts.
 *   2. It must be Playwright's own full Chromium, at a build that matches the
 *      Playwright client driving it. A mismatched binary still launches and
 *      still reports an extension target, but its renderer silently never
 *      executes the bundle: the options page stays blank, no content script
 *      injects, and nothing is logged anywhere.
 *
 * Because of (2), checking that an extension target *exists* is not enough —
 * it exists even in the broken case. So the self-check below opens the
 * extension's own options page and waits for React to render into it. If that
 * fails, the environment is broken, not the code, and we say so loudly here
 * rather than letting every downstream assertion fail for the wrong reason.
 */
export async function launchWithExtension() {
  if (!fs.existsSync(path.join(DIST, "manifest.json"))) {
    throw new Error(
      `No build at ${DIST}. Run \`yarn build\` before the e2e suite.`,
    );
  }

  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [`--disable-extensions-except=${DIST}`, `--load-extension=${DIST}`],
  });

  const worker =
    context.serviceWorkers()[0] ??
    (await context
      .waitForEvent("serviceworker", { timeout: 10000 })
      .catch(() => null));

  if (!worker) {
    await context.close();
    throw new Error(
      "The extension's service worker never started. This almost always means " +
        "the browser is Playwright's headless shell, which cannot run " +
        "extensions. The suite must run headed.",
    );
  }

  const extensionId = new URL(worker.url()).host;
  await assertBundleExecutes(context, extensionId);

  return { context, extensionId };
}

/**
 * Opens the extension's options page and waits for it to render. A blank
 * options page is the tell-tale of a mismatched browser binary.
 */
async function assertBundleExecutes(context, extensionId) {
  const page = await context.newPage();
  try {
    await page.goto(`chrome-extension://${extensionId}/options.html`, {
      waitUntil: "load",
    });
    await page.waitForSelector("#root > *", { timeout: 10000 });
  } catch {
    await context.close();
    throw new Error(
      "The extension loaded but its bundle never executed (the options page " +
        "stayed blank). This is the signature of a Playwright/Chromium version " +
        "mismatch — run `npx playwright install chromium` to fetch the browser " +
        "build matching the installed @playwright/test.",
    );
  } finally {
    await page.close();
  }
}

/**
 * Serves the recorded snapshot at the real site URL, and blocks the site's own
 * scripts so the captured DOM is not torn down and rebuilt by Keybr's SPA.
 *
 * The URL stays genuine because that is what the manifest's
 * `content_scripts.matches` is tested against; serving from file:// or
 * localhost injects nothing.
 *
 * The page is a recording rather than a hand-written fixture on purpose. A
 * fixture only encodes what we *believe* the markup is — the very assumption
 * that keeps turning out wrong — and a minimal hand-written page also tripped
 * webpack's runtime publicPath detection, so the bundle threw before rendering.
 */
export async function replaySnapshot(context) {
  if (!fs.existsSync(SNAPSHOT)) {
    throw new Error(
      `No snapshot at ${SNAPSHOT}. Run \`yarn e2e:record\` to capture one.`,
    );
  }
  const body = fs.readFileSync(SNAPSHOT, "utf8");
  // A single handler for every keybr request. Playwright runs matching routes
  // in reverse registration order and `route.continue()` goes straight to the
  // network rather than to the next handler, so splitting this across two
  // routes silently sends the document to the live site. One handler avoids
  // the trap: serve the recorded document, drop the site's own scripts so its
  // SPA cannot tear the snapshot down, and let everything else (styles, fonts)
  // continue to the network.
  await context.route("https://www.keybr.com/**", (route) => {
    const request = route.request();
    if (request.url() === SITE_URL || request.resourceType() === "document") {
      return route.fulfill({ status: 200, contentType: "text/html", body });
    }
    if (request.resourceType() === "script") {
      return route.abort();
    }
    return route.continue();
  });
}

/** Opens the site and waits for the overlay to finish its first render. */
export async function openOverlay(context) {
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(SITE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(`${OVERLAY_ROOT} svg`, { timeout: 15000 });
  return { page, pageErrors };
}

/**
 * Reads the overlay's state from the page.
 *
 * A highlighted key is the single shape the layout renders at 0.5 opacity;
 * every other highlight shape sits at 0 (hidden) or 1 (plain key).
 */
export function readOverlayState(page) {
  return page.evaluate((overlayRoot) => {
    const root = document.querySelector(overlayRoot);
    const style = getComputedStyle(document.documentElement);
    const highlighted = [...root.querySelectorAll('[opacity="0.5"]')];
    return {
      svgCount: root.querySelectorAll("svg").length,
      labelCount: root.querySelectorAll("text").length,
      highlightCount: highlighted.length,
      highlightClass: highlighted[0]?.getAttribute("class") ?? null,
      semanticVars: {
        frame: style.getPropertyValue("--cc-frame-color").trim(),
        key: style.getPropertyValue("--cc-key-color").trim(),
        symbol: style.getPropertyValue("--cc-symbol-color").trim(),
        pointer: style.getPropertyValue("--cc-pointer-color").trim(),
      },
      siteVars: {
        frame: style.getPropertyValue("--Keyboard-frame__color").trim(),
        key: style.getPropertyValue("--KeyboardKey-button__color").trim(),
        symbol: style.getPropertyValue("--KeyboardKey-symbol__color").trim(),
        pointer: style.getPropertyValue("--KeyboardKey-pointer__color").trim(),
      },
    };
  }, OVERLAY_ROOT);
}

/** What the site adapter would read from the page right now. */
export function readNextTextFromPage(page) {
  return page.evaluate(
    ([cursorSelector, restSelector]) => {
      const current = document.querySelector(cursorSelector);
      const rest = document.querySelector(restSelector);
      return {
        cursorFound: !!current,
        restFound: !!rest,
        text: (current?.textContent ?? "") + (rest?.textContent ?? ""),
      };
    },
    [CURSOR_SELECTOR, REST_SELECTOR],
  );
}
