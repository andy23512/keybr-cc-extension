/**
 * Hermetic tier — the overlay under non-default settings.
 *
 * overlay.spec covers the default state. The render pipeline branches on the
 * settings below, and those branches were previously only ever exercised at
 * their defaults. Each case seeds one setting into storage before the overlay
 * loads and asserts the one observable thing that setting changes.
 */
import { expect, test } from "@playwright/test";
import { renderOverlayWithSettings } from "./harness.mjs";

/** Parses the height component out of an SVG `viewBox` string. */
function viewBoxHeight(viewBox) {
  return Number(viewBox.split(" ")[3]);
}

test.describe("overlay under non-default settings", () => {
  // Rendering each state launches its own browser, so capture them all once up
  // front and let the individual tests assert on the results.
  const rendered = {};

  test.beforeAll(async () => {
    rendered.default = await renderOverlayWithSettings({});
    rendered.thumb3Off = await renderOverlayWithSettings({
      showThumb3Switch: false,
    });
    rendered.highlightOff = await renderOverlayWithSettings({
      highlightKeysEnabled: false,
    });
    rendered.lite = await renderOverlayWithSettings({ layoutType: "lite" });
  });

  test("every state renders the layout without page errors", () => {
    for (const [name, state] of Object.entries(rendered)) {
      expect(state.pageErrors, name).toEqual([]);
      expect(state.svgCount, name).toBe(1);
    }
  });

  test("hiding the thumb-3 switch drops the layout's fifth row", () => {
    expect(rendered.thumb3Off.layoutSvgClass).toContain("layout");
    expect(
      viewBoxHeight(rendered.thumb3Off.layoutViewBox),
      "thumb-3 hidden should be shorter than the default",
    ).toBeLessThan(viewBoxHeight(rendered.default.layoutViewBox));
  });

  test("disabling highlighting removes the highlighted key", () => {
    expect(rendered.default.highlightCount).toBe(1);
    expect(rendered.highlightOff.highlightCount).toBe(0);
  });

  test("the Lite layout type renders the CCLite keyboard instead", () => {
    expect(rendered.default.layoutSvgClass).toContain("layout");
    expect(rendered.default.layoutSvgClass).not.toContain("cclite");
    expect(rendered.lite.layoutSvgClass).toContain("cclite-layout");
  });
});
