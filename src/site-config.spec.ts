import { keybrSiteConfig } from "./site-config";

/**
 * Keybr renders the space character as U+E000, a glyph in its own font's
 * private use area, rather than as an actual space.
 */
const KEYBR_SPACE = "";

function render(html: string) {
  document.body.innerHTML = html;
}

const readNextText = () => keybrSiteConfig.readNextText();

describe("keybr readNextText", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("returns null when no typing test is on screen", () => {
    render("<div>not a typing test</div>");
    expect(readNextText()).toBeNull();
  });

  it("joins the character under the cursor with the rest of the word", () => {
    render(
      '<div dir="ltr"><span class="cursor">t</span><span>he</span></div>',
    );
    expect(readNextText()).toBe("the");
  });

  it("returns just the cursor character when nothing follows it", () => {
    render('<div dir="ltr"><span class="cursor">x</span></div>');
    expect(readNextText()).toBe("x");
  });

  it("translates a lone private-use space into a real space", () => {
    render(`<div dir="ltr"><span class="cursor">${KEYBR_SPACE}</span></div>`);
    expect(readNextText()).toBe(" ");
  });

  it("ignores spans that carry no class before the cursor", () => {
    render(
      '<div dir="ltr"><span>done</span><span class="cursor">n</span><span>ext</span></div>',
    );
    expect(readNextText()).toBe("next");
  });

  it("only reads inside an LTR container", () => {
    render('<div dir="rtl"><span class="cursor">a</span></div>');
    expect(readNextText()).toBeNull();
  });
});
