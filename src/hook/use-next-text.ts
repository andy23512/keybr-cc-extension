import { useEffect, useState } from "react";

export function useNextText() {
  const [nextText, setNextText] = useState<string | null>(null);

  useEffect(() => {
    function getCurrentText() {
      const currentCharacterElement = document.querySelector(
        'div[dir="ltr"] span[class]'
      );
      const nextTextElement = document.querySelector(
        'div[dir="ltr"] span[class] ~ span'
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
      setNextText(nextText);
    }
    const interval = setInterval(getCurrentText, 100);
    return () => {
      clearInterval(interval);
    };
  });

  return nextText;
}
