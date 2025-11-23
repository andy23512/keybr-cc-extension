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
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { ChangeEvent, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";
import { KEYBOARD_LAYOUTS } from "./data/keyboard-layouts";
import { DeviceLayout } from "./model/device-layout.model";
import { KeyBoardLayout } from "./model/keyboard-layout.model";
import "./options.css";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const Options = () => {
  const [layout, setLayout] = useState<string>("cc1");
  const [customDeviceLayouts, setCustomDeviceLayouts] = useState<
    DeviceLayout[]
  >([]);
  const [selectedKeyboardLayoutId, setSelectedKeyboardLayoutId] =
    useState<string>("us");
  const [showThumb3Switch, setShowThumb3Switch] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    browser.storage.local
      .get({
        layout: "cc1",
        customDeviceLayouts: [],
        showThumb3Switch: true,
        selectedKeyboardLayoutId: "us",
      })
      .then((items) => {
        setLayout(items.layout as string);
        setCustomDeviceLayouts(items.customDeviceLayouts as DeviceLayout[]);
        setShowThumb3Switch(items.showThumb3Switch as boolean);
        setSelectedKeyboardLayoutId(items.selectedKeyboardLayoutId as string);
      });
  }, []);

  const defaultKeyboardLayout = KEYBOARD_LAYOUTS.find(
    (k) => k.id === "us"
  ) as KeyBoardLayout;
  const selectedKeyboardLayout =
    KEYBOARD_LAYOUTS.find((k) => k.id === selectedKeyboardLayoutId) ??
    defaultKeyboardLayout;

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
            ["ONE", "TWO", "M4G"].includes(item.device)
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
        ({ id }) => id === deviceLayout.id
      );
      if (index >= 0) {
        nextCustomDeviceLayouts[index] = deviceLayout;
      } else {
        nextCustomDeviceLayouts.push(deviceLayout);
      }
      setLayout(nextLayout);
      setCustomDeviceLayouts(nextCustomDeviceLayouts);
      browser.storage.local
        .set({
          layout: nextLayout,
          customDeviceLayouts: nextCustomDeviceLayouts,
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
    setLayout(nextLayout);
    setShowThumb3Switch(nextShowThumb3Switch);
    browser.storage.local
      .set({
        layout: nextLayout,
        showThumb3Switch: nextShowThumb3Switch,
      })
      .then(showSavedMessage);
  };

  const handleShowThumb3SwitchChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.checked;
    setShowThumb3Switch(value);
    browser.storage.local
      .set({
        showThumb3Switch: value,
      })
      .then(showSavedMessage);
  };

  const handleSelectedKeyboardLayoutChange = (
    _: any,
    newValue: KeyBoardLayout | null
  ) => {
    const value = newValue?.id ?? "us";
    setSelectedKeyboardLayoutId(value);
    browser.storage.local
      .set({
        selectedKeyboardLayoutId: value,
      })
      .then(showSavedMessage);
  };

  const getKeyboardLayoutOptionLabel = (keyboardLayout: KeyBoardLayout) =>
    keyboardLayout.name;

  function showSavedMessage() {
    setStatus("Setting saved.");
    const id = setTimeout(() => {
      setStatus("");
    }, 1000);
    return () => clearTimeout(id);
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
              <br />
              <Select
                sx={{ mt: 1 }}
                value={layout}
                onChange={handleLayoutChange}
              >
                <MenuItem value="cc1">CharaChorder One/Two</MenuItem>
                <MenuItem value="m4g">Master Forge</MenuItem>
                {customDeviceLayouts.map((layout) => (
                  <MenuItem value={layout.id}>{layout.name}</MenuItem>
                ))}
              </Select>
            </li>
            <li>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showThumb3Switch}
                    onChange={handleShowThumb3SwitchChange}
                  />
                }
                label="Show Thumb 3 Switch"
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
  </React.StrictMode>
);
