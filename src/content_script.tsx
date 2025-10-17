import React from "react";
import ReactDOM from "react-dom/client";
import App from "./component/App";
let currentText: string | null = null;
const CHARACTER_TO_POS = {
  w: 6,
  g: 8,
  z: 9,
  k: 11,
  v: 12,
  m: 13,
  c: 14,
  r: 16,
  e: 19,
  i: 21,
  o: 24,
  u: 29,
  b: 51,
  x: 52,
  q: 54,
  f: 56,
  p: 57,
  h: 58,
  d: 59,
  a: 61,
  "": 63,
  t: 64,
  l: 66,
  j: 68,
  n: 69,
  y: 71,
  s: 74,
};
function getCurrentText() {
  const text = document.querySelector('div[dir="ltr"] span[class]');
  let nextCurrentText = text ? text.textContent : null;
  if (currentText !== nextCurrentText) {
    currentText = nextCurrentText;
    updateHighlight();
  }
}
setInterval(getCurrentText, 100);
updateHighlight();
const appContainer = document.createElement("div");
appContainer.id = "keybr-cc-extension-root";
document.body.appendChild(appContainer);
const root = ReactDOM.createRoot(appContainer);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

function updateHighlight() {
  document
    .querySelectorAll('[data-type="highlight"]')
    .forEach((e) => e.setAttribute("opacity", "0"));
  if (currentText) {
    const positionCode =
      CHARACTER_TO_POS[currentText as keyof typeof CHARACTER_TO_POS];
    if (!positionCode) {
      return;
    }
    document
      .querySelector(
        `[ng-reflect-position-code="${positionCode}"] [data-type="highlight"]`
      )
      ?.setAttribute("opacity", "0.5");
  }
}
