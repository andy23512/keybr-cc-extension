import React, { ChangeEvent, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";
import { DeviceLayout } from "./model/device-layout.model";
import "./popup.css";

const Popup = () => {
  const [layout, setLayout] = useState<string>("cc1");
  const [customDeviceLayouts, setCustomDeviceLayouts] = useState<
    DeviceLayout[]
  >([]);
  const [showThumb3Switch, setShowThumb3Switch] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    browser.storage.local
      .get({
        layout: "cc1",
        customDeviceLayouts: [],
        showThumb3Switch: true,
      })
      .then((items) => {
        setLayout(items.layout as string);
        setCustomDeviceLayouts(items.customDeviceLayouts as DeviceLayout[]);
        setShowThumb3Switch(items.showThumb3Switch as boolean);
      });
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

  const handleLayoutChange = (event: ChangeEvent<HTMLSelectElement>) => {
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

  function showSavedMessage() {
    setStatus("Setting saved.");
    const id = setTimeout(() => {
      setStatus("");
    }, 1000);
    return () => clearTimeout(id);
  }

  return (
    <div className="p-2">
      <ol className="list-outside list-decimal text-base pl-[revert] space-y-2">
        <li>
          (Optional) Import a device layout file (the backup file from
          CharaChorder Device Manager website).
          <br />
          <input
            className="p-1 bg-gray-300 border border-solid border-gray-700"
            type="file"
            accept=".json"
            onChange={handleFileChange}
          ></input>
        </li>
        <li>
          Select a loaded device layout.
          <br />
          <select
            className="p-1 bg-gray-300 border border-solid border-gray-700"
            title="layout"
            value={layout}
            onChange={handleLayoutChange}
          >
            <option value="cc1">CharaChorder One/Two</option>
            <option value="m4g">Master Forge</option>
            {customDeviceLayouts.map((layout) => (
              <option value={layout.id}>{layout.name}</option>
            ))}
          </select>
        </li>
        <li>
          <label>
            <input
              type="checkbox"
              checked={showThumb3Switch}
              onChange={handleShowThumb3SwitchChange}
            />
            Show Thumb 3 Switch
          </label>
        </li>
      </ol>
      <div>{status}</div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
