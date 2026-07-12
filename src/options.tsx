import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CssBaseline,
  FormControlLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { ChangeEvent, MouseEvent, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  downloadDeviceLayout,
  KeyboardLayout,
  LayoutType,
} from "tangent-cc-lib";
import browser from "webextension-polyfill";
import {
  LITE_PRESET_DEVICE_LAYOUTS,
  PRESET_DEVICE_LAYOUTS,
} from "./data/device-layouts";
import { KEYBOARD_LAYOUTS } from "./data/keyboard-layouts";
import "./options.css";
import { useSettingsStore } from "./store/settings-store";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const Options = () => {
  const layoutType = useSettingsStore.use.layoutType();
  const isLiteLayoutType = layoutType === "lite";
  const layout = isLiteLayoutType
    ? useSettingsStore.use.liteLayout()
    : useSettingsStore.use.layout();
  const customDeviceLayouts = isLiteLayoutType
    ? useSettingsStore.use.liteCustomDeviceLayouts()
    : useSettingsStore.use.customDeviceLayouts();
  const selectedKeyboardLayoutId =
    useSettingsStore.use.selectedKeyboardLayoutId();
  const showThumb3Switch = useSettingsStore.use.showThumb3Switch();
  const highlightKeysEnabled = useSettingsStore.use.highlightKeysEnabled();
  const setSettings = useSettingsStore.use.set();

  const [status, setStatus] = useState<string>("");

  const defaultKeyboardLayout = KEYBOARD_LAYOUTS.find(
    (k) => k.id === "us",
  ) as KeyboardLayout;
  const selectedKeyboardLayout =
    KEYBOARD_LAYOUTS.find((k) => k.id === selectedKeyboardLayoutId) ??
    defaultKeyboardLayout;

  const handleLayoutTypeChange = (
    _: MouseEvent<HTMLElement>,
    nextLayoutType: LayoutType,
  ) => {
    setSettings("layoutType", nextLayoutType);
    browser.storage.local
      .set({
        layoutType: nextLayoutType,
      })
      .then(showSavedMessage);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files === null || files.length === 0) {
      return;
    }
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        return;
      }
      const data = JSON.parse(e.target.result as string);
      if (!data) {
        return;
      }
      let layoutItem = null;
      if (data.history) {
        layoutItem = data.history[0].find(
          (item: any) =>
            item.type === "layout" &&
            (isLiteLayoutType
              ? ["LITE"].includes(item.device)
              : ["ONE", "TWO", "M4G"].includes(item.device)),
        );
      } else {
        layoutItem = data;
      }
      if (!layoutItem) {
        return;
      }
      const deviceLayout = {
        id: file.name,
        name: file.name,
        layout: layoutItem.layout,
      };
      const nextLayout = deviceLayout.id;
      const nextCustomDeviceLayouts = [...customDeviceLayouts];
      const index = nextCustomDeviceLayouts.findIndex(
        ({ id }) => id === deviceLayout.id,
      );
      if (index >= 0) {
        nextCustomDeviceLayouts[index] = deviceLayout;
      } else {
        nextCustomDeviceLayouts.push(deviceLayout);
      }
      setSettings(isLiteLayoutType ? "liteLayout" : "layout", nextLayout);
      setSettings(
        isLiteLayoutType ? "liteCustomDeviceLayouts" : "customDeviceLayouts",
        nextCustomDeviceLayouts,
      );
      browser.storage.local
        .set({
          [isLiteLayoutType ? "liteLayout" : "layout"]: nextLayout,
          [isLiteLayoutType
            ? "liteCustomDeviceLayouts"
            : "customDeviceLayouts"]: nextCustomDeviceLayouts,
        })
        .then(showSavedMessage);
    };
    reader.readAsText(file);
  };

  const handleLayoutChange = (event: SelectChangeEvent) => {
    const nextLayout = event.target.value;
    const nextShowThumb3Switch =
      nextLayout === "m4g"
        ? false
        : nextLayout === "cc1"
        ? true
        : showThumb3Switch;
    setSettings(isLiteLayoutType ? "liteLayout" : "layout", nextLayout);
    setSettings("showThumb3Switch", nextShowThumb3Switch);
    browser.storage.local
      .set({
        [isLiteLayoutType ? "liteLayout" : "layout"]: nextLayout,
        showThumb3Switch: nextShowThumb3Switch,
      })
      .then(showSavedMessage);
  };

  const handleShowThumb3SwitchChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.checked;
    setSettings("showThumb3Switch", value);
    browser.storage.local
      .set({
        showThumb3Switch: value,
      })
      .then(showSavedMessage);
  };

  const handleHighlightKeysEnabledChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.checked;
    setSettings("highlightKeysEnabled", value);
    browser.storage.local
      .set({
        highlightKeysEnabled: value,
      })
      .then(showSavedMessage);
  };

  const handleSelectedKeyboardLayoutChange = (
    _: any,
    newValue: KeyboardLayout | null,
  ) => {
    const value = newValue?.id ?? "us";
    setSettings("selectedKeyboardLayoutId", value);
    browser.storage.local
      .set({
        selectedKeyboardLayoutId: value,
      })
      .then(showSavedMessage);
  };

  const getKeyboardLayoutOptionLabel = (keyboardLayout: KeyboardLayout) =>
    keyboardLayout.name;

  function showSavedMessage() {
    setStatus("Setting saved.");
    const id = setTimeout(() => {
      setStatus("");
    }, 1000);
    return () => clearTimeout(id);
  }

  function handleDeviceLayoutExport() {
    const deviceLayout = [
      ...(isLiteLayoutType
        ? LITE_PRESET_DEVICE_LAYOUTS
        : PRESET_DEVICE_LAYOUTS),
      ...customDeviceLayouts,
    ].find((deviceLayout) => deviceLayout.id === layout);
    if (!deviceLayout) {
      return;
    }
    downloadDeviceLayout(deviceLayout);
  }

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto" }}>
      <AppBar enableColorOnDark={true} position="static">
        <Typography variant="h6" sx={{ mx: 2 }}>
          Keybr CC Extension - Options
        </Typography>
      </AppBar>
      <div className="p-3 flex flex-col items-center">
        <div className="mt-4">
          <ol className="list-inside list-decimal text-base space-y-2">
            <li>
              Select a layout type.
              <br />
              <ToggleButtonGroup
                sx={{ mt: 1 }}
                color="primary"
                value={layoutType}
                exclusive
                onChange={handleLayoutTypeChange}
              >
                <ToggleButton value="3d">3D input device</ToggleButton>
                <ToggleButton value="lite">Lite</ToggleButton>
              </ToggleButtonGroup>
            </li>
            <li>
              (Optional) Import a device layout file (the backup file from
              CharaChorder Device Manager website).
              <br />
              <Button
                sx={{ mt: 1 }}
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
              >
                Choose File
                <input
                  className="opacity-0 size-[1px]"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                ></input>
              </Button>
            </li>
            <li>
              Select a loaded device layout.
              <div className="mt-2 flex gap-2">
                {isLiteLayoutType ? (
                  <Select value={layout} onChange={handleLayoutChange}>
                    <MenuItem value="cclite">
                      CharaChorder Lite - Default
                    </MenuItem>
                    {customDeviceLayouts.map((layout) => (
                      <MenuItem value={layout.id}>{layout.name}</MenuItem>
                    ))}
                  </Select>
                ) : (
                  <Select value={layout} onChange={handleLayoutChange}>
                    <MenuItem value="cc1">
                      CharaChorder One / CharaChorder Two / CCU - Default
                    </MenuItem>
                    <MenuItem value="m4g">Master Forge - Default</MenuItem>
                    <MenuItem value="cc1-left-hand-only">
                      CharaChorder One / CharaChorder Two / CCU - Left Hand Only
                    </MenuItem>
                    <MenuItem value="cc1-right-hand-only">
                      CharaChorder One / CharaChorder Two / CCU - Right Hand
                      Only
                    </MenuItem>
                    {customDeviceLayouts.map((layout) => (
                      <MenuItem value={layout.id}>{layout.name}</MenuItem>
                    ))}
                  </Select>
                )}
                <Button
                  component="label"
                  role={undefined}
                  variant="outlined"
                  tabIndex={-1}
                  onClick={handleDeviceLayoutExport}
                >
                  Export
                </Button>
              </div>
            </li>
            <li>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showThumb3Switch}
                    disabled={isLiteLayoutType}
                    onChange={handleShowThumb3SwitchChange}
                  />
                }
                label="Show Thumb 3 Switch"
              />
            </li>
            <li>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={highlightKeysEnabled}
                    onChange={handleHighlightKeysEnabledChange}
                  />
                }
                label="Highlight Keys"
              />
            </li>
            <li>
              Select an OS keyboard layout.
              <br />
              <Autocomplete
                sx={{ mt: 1 }}
                options={KEYBOARD_LAYOUTS}
                getOptionLabel={getKeyboardLayoutOptionLabel}
                defaultValue={defaultKeyboardLayout}
                value={selectedKeyboardLayout}
                onChange={handleSelectedKeyboardLayoutChange}
                renderInput={(params) => <TextField {...params}></TextField>}
              ></Autocomplete>
            </li>
          </ol>
          <Snackbar
            open={!!status}
            message={status}
            anchorOrigin={{ horizontal: "center", vertical: "top" }}
          ></Snackbar>
        </div>
      </div>
    </Box>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Options />
    </ThemeProvider>
  </React.StrictMode>,
);
