import cc1Layout from "./layout/cc1-layout.svg";
import m4gLayout from "./layout/m4g-layout.svg";
console.log(cc1Layout, m4gLayout);
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
buildLayout();
updateHighlight();
function buildLayout() {
  const layout = cc1Layout;
  const layoutContainer = document.createElement("div");
  layoutContainer.classList.add("layout-container");
  layoutContainer.innerHTML = layout;
  window.document.body.appendChild(layoutContainer);
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .layout-container {
      background-color: #333;
      bottom: 0px;
      color: white;
      height: 16rem;
      left: 0px;
      padding: 16px;
      position: fixed;
      width: 100%;
      z-index: 10;
    }
    .fill-current {
      fill: currentColor;
    }
    .stroke-white {
      stroke: white;
    }
    .material-icons {
      visibility: hidden;
    }
    .fill-alnitak-500 {
      fill: #0fe8fb;
    }
  `;
  document.head.appendChild(styleSheet);
}
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
      ?.setAttribute("opacity", "1");
  }
}
