import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  Tooltip,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { ChangeEvent, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CHARACHORDER_3D_INPUT_DEVICE_PORTS,
  DeviceLayout,
  downloadDeviceLayout,
  KeyboardLayout,
  SerialHandler,
  SerialPortHandler,
} from "tangent-cc-lib";
import browser from "webextension-polyfill";
import { PRESET_DEVICE_LAYOUTS } from "./data/device-layouts";
import { KEYBOARD_LAYOUTS } from "./data/keyboard-layouts";
import DeviceLayoutImportDialog from "./device-layout-import-dialog";
import "./options.css";
import { useSettingsStore } from "./store/settings-store";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const isWebSerialApiSupported = "serial" in navigator;
const serialPortHandler = new SerialPortHandler(
  false,
  CHARACHORDER_3D_INPUT_DEVICE_PORTS,
);
const serialHandler = new SerialHandler(serialPortHandler);

enum SerialLogType {
  Send = "send",
  Receive = "receive",
}

const Options = () => {
  const layout = useSettingsStore.use.layout();
  const customDeviceLayouts = useSettingsStore.use.customDeviceLayouts();
  const selectedKeyboardLayoutId =
    useSettingsStore.use.selectedKeyboardLayoutId();
  const showThumb3Switch = useSettingsStore.use.showThumb3Switch();
  const setSettings = useSettingsStore.use.set();

  const [status, setStatus] = useState<string>("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importDialogInitialName, setImportDialogInitialName] = useState("");
  const [importDialogLayout, setImportDialogLayout] = useState<
    DeviceLayout["layout"] | null
  >(null);
  const [serialLog, setSerialLog] = useState<
    { type: SerialLogType; data: string }[]
  >([]);

  const defaultKeyboardLayout = KEYBOARD_LAYOUTS.find(
    (k) => k.id === "us",
  ) as KeyboardLayout;
  const selectedKeyboardLayout =
    KEYBOARD_LAYOUTS.find((k) => k.id === selectedKeyboardLayoutId) ??
    defaultKeyboardLayout;

  useEffect(() => {
    function sendListener(data: string) {
      setSerialLog((prev) => [...prev, { type: SerialLogType.Send, data }]);
    }
    function receiveListener(data: string) {
      setSerialLog((prev) => [...prev, { type: SerialLogType.Receive, data }]);
    }
    if (isWebSerialApiSupported) {
      serialHandler.on("sendSerialData", sendListener);
      serialHandler.on("receiveSerialData", receiveListener);
    }
    return () => {
      if (isWebSerialApiSupported) {
        serialHandler.off("sendSerialData", sendListener);
        serialHandler.off("receiveSerialData", receiveListener);
      }
    };
  }, []);

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
            ["ONE", "TWO", "M4G"].includes(item.device),
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
      setSettings("layout", nextLayout);
      setSettings("customDeviceLayouts", nextCustomDeviceLayouts);
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
    setSettings("layout", nextLayout);
    setSettings("showThumb3Switch", nextShowThumb3Switch);
    browser.storage.local
      .set({
        layout: nextLayout,
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
      ...PRESET_DEVICE_LAYOUTS,
      ...customDeviceLayouts,
    ].find((deviceLayout) => deviceLayout.id === layout);
    if (!deviceLayout) {
      return;
    }
    downloadDeviceLayout(deviceLayout);
  }

  function pad(number: number) {
    return String(number).padStart(2, "0");
  }

  async function handleLoadLayoutFromDevice() {
    const { id } = await serialHandler.connect();
    const layout = await serialHandler.loadLayout();
    await serialHandler.disconnect();
    const date = new Date();
    const name = `${id}_${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(
      date.getSeconds(),
    )}`;
    setImportDialogInitialName(name);
    setImportDialogLayout(layout);
    setImportDialogOpen(true);
  }

  function importDeviceLayout(name: string) {
    if (!importDialogLayout) {
      return;
    }
    const nextId = name + "-" + Date.now();
    const nextCustomDeviceLayouts = [...customDeviceLayouts];
    const index = nextCustomDeviceLayouts.findIndex(({ id }) => id === nextId);
    if (index >= 0) {
      nextCustomDeviceLayouts[index] = {
        id: nextId,
        name,
        layout: importDialogLayout,
      };
    } else {
      nextCustomDeviceLayouts.push({
        id: nextId,
        name,
        layout: importDialogLayout,
      });
    }
    setSettings("layout", nextId);
    setSettings("customDeviceLayouts", nextCustomDeviceLayouts);
    browser.storage.local
      .set({
        layout: nextId,
        customDeviceLayouts: nextCustomDeviceLayouts,
      })
      .then(showSavedMessage);
  }

  function closeImportDialog() {
    setImportDialogOpen(false);
    setImportDialogInitialName("");
    setImportDialogLayout(null);
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
              (Optional) Load a device layout from a file (the backup file from
              CharaChorder Device Manager website) or from a device.
              <br />
              <div className="flex mt-2 gap-2 items-center">
                <Button
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
                or
                {isWebSerialApiSupported && (
                  <Button
                    color="secondary"
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    onClick={handleLoadLayoutFromDevice}
                  >
                    Load from Device
                  </Button>
                )}
                {!isWebSerialApiSupported && (
                  <Tooltip title="Web Serial API is not supported in your browser. Please use a compatible browser to load device layouts from your device.">
                    <span>
                      <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        disabled
                      >
                        Load from Device
                      </Button>
                    </span>
                  </Tooltip>
                )}
                <DeviceLayoutImportDialog
                  open={importDialogOpen}
                  initialName={importDialogInitialName}
                  onCancel={() => closeImportDialog()}
                  onSubmit={(name) => {
                    importDeviceLayout(name);
                    closeImportDialog();
                  }}
                ></DeviceLayoutImportDialog>
              </div>
            </li>
            <li>
              Select a loaded device layout.
              <div className="mt-2 flex gap-2">
                <Select value={layout} onChange={handleLayoutChange}>
                  <MenuItem value="cc1">
                    CharaChorder One / CharaChorder Two / CCU - Default
                  </MenuItem>
                  <MenuItem value="m4g">Master Forge - Default</MenuItem>
                  <MenuItem value="cc1-left-hand-only">
                    CharaChorder One / CharaChorder Two / CCU - Left Hand Only
                  </MenuItem>
                  <MenuItem value="cc1-right-hand-only">
                    CharaChorder One / CharaChorder Two / CCU - Right Hand Only
                  </MenuItem>
                  {customDeviceLayouts.map((layout) => (
                    <MenuItem value={layout.id}>{layout.name}</MenuItem>
                  ))}
                </Select>
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
          {isWebSerialApiSupported && (
            <Accordion sx={{ mt: 4 }}>
              <AccordionSummary
                expandIcon={<span className="text-gray-400">▼</span>}
              >
                Serial Log
              </AccordionSummary>
              <AccordionDetails className="max-h-64 overflow-auto">
                {serialLog.length === 0 ? (
                  <span>No serial log to display.</span>
                ) : (
                  <ul>
                    {serialLog.map((log, index) => (
                      <li className="flex items-center" key={index}>
                        {log.type === SerialLogType.Send ? (
                          <span className="text-green-500 flex-none">▲</span>
                        ) : (
                          <span className="text-red-500 flex-none">▼</span>
                        )}
                        <span className="font-mono whitespace-wrap">
                          {log.data}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionDetails>
            </Accordion>
          )}
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
