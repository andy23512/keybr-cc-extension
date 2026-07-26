/**
 * Hermetic tier — options page → content overlay live sync.
 *
 * This is the one integration nothing else covers: a setting changed on the
 * options page reaches the already-open overlay on the typing site, with no
 * reload. The path is real and stateful — the options page writes to
 * `browser.storage.local`, which fires `storage.onChanged` in the content
 * script, which rehydrates the settings store, which re-renders the overlay.
 *
 * It is driven through the real "Highlight Keys" checkbox rather than a direct
 * storage write, so the test also covers that the options control writes the
 * setting at all.
 */
import { expect, test } from "@playwright/test";
import {
  launchWithExtension,
  openOverlay,
  readHighlightCount,
  replaySnapshot,
} from "./harness.mjs";

test.describe("options page to overlay sync", () => {
  let context;
  let extensionId;

  test.beforeAll(async () => {
    ({ context, extensionId } = await launchWithExtension());
    await replaySnapshot(context);
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test("toggling Highlight Keys updates the open overlay without a reload", async () => {
    const { page } = await openOverlay(context);
    expect(await readHighlightCount(page)).toBe(1);

    const options = await context.newPage();
    await options.goto(`chrome-extension://${extensionId}/options.html`, {
      waitUntil: "load",
    });
    const highlightKeys = options.getByLabel("Highlight Keys");
    await expect(highlightKeys).toBeChecked();
    await highlightKeys.click();
    await expect(highlightKeys).not.toBeChecked();
    await options.close();

    // The content page is never reloaded — the overlay must react to the
    // storage change on its own.
    await expect
      .poll(() => readHighlightCount(page), { timeout: 5000 })
      .toBe(0);
  });
});
