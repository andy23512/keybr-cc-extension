# Keybr CC Extension

[![CI](https://img.shields.io/github/actions/workflow/status/andy23512/keybr-cc-extension/ci.yml?branch=main&label=CI)](https://github.com/andy23512/keybr-cc-extension/actions/workflows/ci.yml)

## Publication Status

| Published Version                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [<img src="https://img.shields.io/chrome-web-store/v/fdofhfbipdhkkhhdjlfjnjfnkibpbdpg">](https://chromewebstore.google.com/detail/keybr-cc-extension/fdofhfbipdhkkhhdjlfjnjfnkibpbdpg) |
| [<img src="https://img.shields.io/amo/v/keybr-cc-extension">](https://addons.mozilla.org/en-US/firefox/addon/keybr-cc-extension/)                                                      |

## Link

- [Demonstration video](https://youtu.be/IQWf4IuekFQ?si=q_DkxyKOvMsdcqV3)
- [Dev note](https://andy23512.github.io/blog/cc-extensions-unofficial-extensions-that-display-the-layout-of-charachorder-input-devices-on-typing-websites/)

## Summary

An unofficial browser extension that displays the layout of CharaChorder input devices on [Keybr](https://www.keybr.com/)

## Description

An unofficial browser extension that displays the layout of CharaChorder input devices (CharaChorder One, CharaChorder Two, CCU, Master Forge and CharaChorder Lite) on [Keybr](https://www.keybr.com/).

With this extension, users can familiarize themselves with the layouts of CharaChorder input devices directly on Keybr.

After installation, click the extension icon to open an option page, where you can choose a layout type (3D input device or Lite), import a device layout file, choose which device layout to display, toggle the thumb-3 switch, toggle key highlighting, and choose an OS keyboard layout.

Clicking the settings button on the layout enters edit mode, allowing you to adjust its position, size, and transparency by dragging, resizing, and scrolling.

### Disclaimer

This extension is not affiliated, associated, authorized, endorsed by, or in any way officially connected with CharaChorder and Keybr.

## Development

### Setup

```
yarn
```

### Build

```
yarn build
```

#### Author's build environment

- macOS Tahoe 26.0.1
- Apple M4 Pro Chip
- 24 GB of system memory, 12 cores of CPU
- Node 24.8.0, npm 11.6.0 and yarn 1.22.22
- 270 GB of free disk space

### Build in watch mode

#### terminal

```
yarn watch
```

### Load the built extension

#### Chrome

1. Go to "chrome://extensions/".
2. Open "Developer mode" at top-right.
3. Click "Load unpacked" at top-left.
4. Select "dist" directory.

#### Firefox

1. Go to "about:debugging#/runtime/this-firefox".
2. Click "Load Temporary Add-on".
3. Select any file under the "dist" directory.

### Test

Unit tests (jsdom) cover the site adapter in `src/site-config.ts`:

```
yarn test
```

End-to-end tests drive the built extension in a real browser. Build first
(`yarn build`), then:

```
yarn e2e          # hermetic: replays a recorded keybr.com snapshot, deterministic
yarn e2e:canary   # live: runs against the real keybr.com, may be flaky
yarn e2e:record   # re-capture the snapshot when the canary suite reports drift
```

Two constraints are enforced by the harness and cannot be worked around:

- The suite runs **headed**. Playwright's headless shell cannot run
  extensions.
- It needs Playwright's own Chromium at the build matching the installed
  `@playwright/test`. Run `npx playwright install chromium` once. A mismatched
  browser loads the extension but silently never executes its code; the
  harness detects this at startup and fails with an explanation rather than a
  confusing timeout.

### Release smoke test

Automated tests cover the logic and rendering; the interactive behaviour
(edit-mode dragging, file import/export, live typing, theming) is verified by
hand before a release. The shared checklist lives in cc-extension-core:
[RELEASE-SMOKE.md](https://github.com/andy23512/cc-extension-core/blob/main/RELEASE-SMOKE.md).
