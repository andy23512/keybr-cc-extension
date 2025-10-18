import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";
import { Layout } from "./model/layout.model";

const Popup = () => {
  const [layout, setLayout] = useState<Layout>("cc1");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    browser.storage.local
      .get({
        layout: "cc1",
      })
      .then((items) => {
        setLayout(items.layout as Layout);
      });
  }, []);

  const saveOptions = () => {
    browser.storage.local
      .set({
        layout,
      })
      .then(() => {
        // Update status to let user know options were saved.
        setStatus("Options saved.");
        const id = setTimeout(() => {
          setStatus("");
        }, 1000);
        return () => clearTimeout(id);
      });
  };

  return (
    <>
      <div>
        Layout:{" "}
        <select
          title="layout"
          value={layout}
          onChange={(event) => setLayout(event.target.value as Layout)}
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
