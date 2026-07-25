/**
 * Hermetic tier — "did we break it?"
 *
 * Runs against a recorded snapshot of keybr.com, so it is deterministic and
 * needs no network. It covers the parts nothing else does: that the content
 * script injects, that React renders the layout, that the theme variables
 * resolve through the mapping in src/style.css, and that a key is highlighted
 * for the text on screen.
 *
 * When the site redesigns, this suite keeps passing against the old snapshot.
 * That is what the canary suite is for.
 */
import { expect, test } from "@playwright/test";
import {
  launchWithExtension,
  openOverlay,
  readNextTextFromPage,
  readOverlayState,
  replaySnapshot,
} from "./harness.mjs";

test.describe("overlay on a recorded keybr page", () => {
  let context;
  let page;
  let pageErrors;
  let state;

  test.beforeAll(async () => {
    ({ context } = await launchWithExtension());
    await replaySnapshot(context);
    ({ page, pageErrors } = await openOverlay(context));
    state = await readOverlayState(page);
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test("renders without page errors", () => {
    expect(pageErrors).toEqual([]);
  });

  test("renders the device layout", () => {
    expect(state.svgCount).toBe(1);
    // The layout draws a label per key per layer; the exact count shifts with
    // the layout data, so assert it is populated rather than pinning a number.
    expect(state.labelCount).toBeGreaterThan(50);
  });

  test("resolves every semantic colour from the site's own theme", () => {
    for (const name of ["frame", "key", "symbol", "pointer"]) {
      expect(state.semanticVars[name], `--cc-${name}-color is set`).not.toBe("");
      expect(
        state.semanticVars[name],
        `--cc-${name}-color maps to the site variable`,
      ).toBe(state.siteVars[name]);
    }
  });

  test("highlights exactly one key for the text on screen", async () => {
    const { text } = await readNextTextFromPage(page);
    expect(text).not.toBe("");
    expect(state.highlightCount).toBe(1);
    expect(state.highlightClass).toContain("--cc-pointer-color");
  });
});
