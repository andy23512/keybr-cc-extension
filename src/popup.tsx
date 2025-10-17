import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { LayoutType } from "./model/layout.model";

const Popup = () => {
  const [layout, setLayout] = useState<LayoutType>("cc1");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get(
      {
        layout: "cc1",
      },
      (items) => {
        setLayout(items.layout);
      }
    );
  }, []);

  const saveOptions = () => {
    // Saves options to chrome.storage.sync.
    chrome.storage.sync.set(
      {
        layout,
      },
      () => {
        // Update status to let user know options were saved.
        setStatus("Options saved.");
        const id = setTimeout(() => {
          setStatus("");
        }, 1000);
        return () => clearTimeout(id);
      }
    );
  };

  return (
    <>
      <div>
        Layout:{" "}
        <select
          title="layout"
          value={layout}
          onChange={(event) => setLayout(event.target.value as LayoutType)}
        >
          <option value="cc1">CharaChorder One/Two</option>
          <option value="m4g">Master Forge</option>
        </select>
      </div>
      <div>{status}</div>
      <button onClick={saveOptions}>Save</button>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
