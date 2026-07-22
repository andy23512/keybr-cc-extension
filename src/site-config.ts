import { SiteConfig } from "cc-extension-core";

/**
 * Keybr renders the typing test as a run of `<span>`s inside an LTR wrapper.
 * The span carrying a class is the character under the cursor; the one right
 * after it is the rest of the current word.
 */
function readNextText(): string | null {
  const currentCharacterElement = document.querySelector(
    'div[dir="ltr"] span[class]',
  );
  const nextTextElement = document.querySelector(
    'div[dir="ltr"] span[class] ~ span',
  );
  let nextText = currentCharacterElement
    ? currentCharacterElement.textContent
    : null;
  if (nextText && nextTextElement) {
    nextText += nextTextElement.textContent;
  }
  // The literal below is U+E000, not an empty string: Keybr draws the space
  // character as a glyph in its own font's private use area. Comparing for
  // equality rather than replacing occurrences is deliberate — on Keybr that
  // character only ever arrives on its own, so there is nothing to replace
  // mid-string.
  if (nextText === "") {
    nextText = " ";
  }
  return nextText;
}

export const keybrSiteConfig: SiteConfig = {
  id: "keybr",
  siteName: "Keybr",
  readNextText,
};
