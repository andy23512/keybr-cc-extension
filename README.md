# Keybr CC Extension

## Publication Status

| Published Version                                                                                                                                                                      | Pending Review Version |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| [<img src="https://img.shields.io/chrome-web-store/v/fdofhfbipdhkkhhdjlfjnjfnkibpbdpg">](https://chromewebstore.google.com/detail/keybr-cc-extension/fdofhfbipdhkkhhdjlfjnjfnkibpbdpg) | N/A                    |
| [<img src="https://img.shields.io/amo/v/keybr-cc-extension">](https://addons.mozilla.org/en-US/firefox/addon/keybr-cc-extension/)                                                      | N/A                    |

## Link

- [Demonstration video](https://youtu.be/IQWf4IuekFQ?si=q_DkxyKOvMsdcqV3)
- [Dev note](https://andy23512.github.io/blog/cc-extensions-unofficial-extensions-that-display-the-layout-of-charachorder-3d-input-devices-on-typing-websites/)

## Summary

An unofficial browser extension that displays the layout of CharaChorder 3D input devices on Keybr

## Description

An unofficial browser extension that displays the layout of CharaChorder 3D input devices (CharaChorder One, CharaChorder Two, and Master Forge) on Keybr.

With this extension, users can familiarize themselves with the layouts of CharaChorder 3D input devices directly on Keybr.

After installation, click the extension icon to open an option page, where you can import a device layout file, choose which device layout to display, toggle the thumb-3 switch, and choose an OS keyboard layout.

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
