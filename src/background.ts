import browser from "webextension-polyfill";

browser.action.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});
