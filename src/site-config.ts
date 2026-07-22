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
