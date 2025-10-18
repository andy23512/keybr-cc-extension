# Keybr CC Extension

- [Chrome Web Store](https://chromewebstore.google.com/detail/keybr-cc-extension/fdofhfbipdhkkhhdjlfjnjfnkibpbdpg)

An unofficial browser extension for showing layout of CharaChorder 3D input devices (CharaChorder One, CharaChorder Two and Master Forge) at keybr.com.

## Disclaimer

This extension is not affiliated, associated, authorized, endorsed by, or in any way officially connected with CharaChorder and Keybr.

## Setup

```
yarn
```

## Build

```
yarn build
```

### Author's build environment

- macOS Tahoe 26.0.1
- Apple M4 Pro Chip
- 24 GB of system memory, 12 cores of CPU
- Node 24.8.0, npm 11.6.0 and yarn 1.22.22
- 270 GB of free disk space

## Build in watch mode

### terminal

```
yarn watch
```

## Load the built extension

### Chrome

1. Go to "chrome://extensions/".
2. Open "Developer mode" at top-right.
3. Click "Load unpacked" at top-left.
4. Select "dist" directory.

### Firefox

1. Go to "about:debugging#/runtime/this-firefox".
2. Click "Load Temporary Add-on".
3. Select any file under the "dist" directory.
