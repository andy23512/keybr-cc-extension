/**
 * Hermetic tier — upgrading from a pre-Lite-layout install.
 *
 * Settings persist as flat keys in `browser.storage.local` (see harness.mjs),
 * so nothing forces a schema migration when new fields are added — the store
 * just backfills missing ones with defaults at read time. This seeds storage
 * with exactly the shape an 8.2 install left behind (no `layoutType` or
 * `lite*` keys at all, since those fields did not exist yet) and checks that
 * upgrading doesn't lose a returning user's settings or silently switch them
 * into the new Lite mode.
 */
import { expect, test } from "@playwright/test";
import {
  launchWithExtension,
  openOverlay,
  readOverlayState,
  replaySnapshot,
  seedSettings,
} from "./harness.mjs";

const legacySettings = {
  layout: "cc2",
  customDeviceLayouts: [],
  showThumb3Switch: false,
  selectedKeyboardLayoutId: "de",
  height: 300,
  xPosition: 0.3,
  yPosition: 0.6,
  opacity: 0.7,
  highlightKeysEnabled: false,
};

test.describe("upgrading from pre-Lite-layout storage", () => {
  let context;
  let extensionId;

  test.beforeAll(async () => {
    ({ context, extensionId } = await launchWithExtension());
    await seedSettings(context, extensionId, legacySettings);
    await replaySnapshot(context);
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test("legacy keys survive untouched and no schema migration is written", async () => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`, {
      waitUntil: "load",
    });
    const raw = await page.evaluate(
      () => new Promise((resolve) => chrome.storage.local.get(null, resolve)),
    );
    await page.close();

    expect(raw).toMatchObject(legacySettings);
    // Backfilled at read time only -- never written back for an untouched install.
    expect(raw.layoutType).toBeUndefined();
  });

  test("options page resolves the missing layoutType to 3D, not Lite", async () => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`, {
      waitUntil: "load",
    });

    await expect(
      page.getByRole("button", { name: "3D input device" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Lite" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await page.close();
  });

  test("the overlay renders the carried-over 3D layout, not a Lite default", async () => {
    const { page, pageErrors } = await openOverlay(context);
    const state = await readOverlayState(page);
    await page.close();

    expect(pageErrors).toEqual([]);
    expect(state.layoutSvgClass).toContain("layout");
    expect(state.layoutSvgClass).not.toContain("cclite");
    // highlightKeysEnabled: false carried over from the legacy settings.
    expect(state.highlightCount).toBe(0);
  });
});
