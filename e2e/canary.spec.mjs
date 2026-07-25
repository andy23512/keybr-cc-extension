/**
 * Canary tier — "did the site change?"
 *
 * Runs against the live keybr.com, so it needs network and is allowed to be
 * flaky. It is deliberately *not* part of `yarn e2e`: a failure here usually
 * means Keybr shipped a redesign, which calls for re-recording the snapshot
 * and revisiting the adapter, not for reverting whatever was just committed.
 *
 * Assertions stay coarse on purpose. The practice text is generated per
 * session and adapts to the user's profile, so nothing about its content can
 * be pinned — only that the selectors the adapter depends on still find
 * something, and that the overlay still comes up.
 */
import { expect, test } from "@playwright/test";
import {
  CURSOR_SELECTOR,
  launchWithExtension,
  openOverlay,
  readNextTextFromPage,
  readOverlayState,
  REST_SELECTOR,
} from "./harness.mjs";

test.describe("live keybr.com", () => {
  let context;
  let page;
  let pageErrors;

  test.beforeAll(async () => {
    ({ context } = await launchWithExtension());
    ({ page, pageErrors } = await openOverlay(context));
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test("still injects the overlay", async () => {
    expect(pageErrors).toEqual([]);
    const state = await readOverlayState(page);
    expect(state.svgCount).toBe(1);
    expect(state.labelCount).toBeGreaterThan(50);
  });

  test("the adapter's selectors still match the site's markup", async () => {
    const { cursorFound, restFound, text } = await readNextTextFromPage(page);
    expect(cursorFound, CURSOR_SELECTOR).toBe(true);
    expect(restFound, REST_SELECTOR).toBe(true);
    expect(text.length).toBeGreaterThan(0);
  });

  test("the site's theme variables still exist", async () => {
    const state = await readOverlayState(page);
    for (const name of ["frame", "key", "symbol", "pointer"]) {
      expect(state.siteVars[name], `site variable for ${name}`).not.toBe("");
    }
  });
});
