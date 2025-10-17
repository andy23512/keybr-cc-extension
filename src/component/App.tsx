import React, { useEffect, useState } from "react";
import { LayoutType } from "../model/layout.model";
import "./App.css";
import Layout from "./Layout";

function App() {
  const [layout, setLayout] = useState<LayoutType>("cc1");

  useEffect(() => {
    // Load initial value from storage
    chrome.storage.sync.get({ layout: "cc1" }, (items) => {
      setLayout(items.layout);
    });

    // Listen for changes in storage from other parts of the extension
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: chrome.storage.AreaName
    ) => {
      if (area === "sync" && changes.layout) {
        setLayout(changes.layout.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  return (
    <div className="app">
      <Layout layout={layout} keyLabelMap={{}} />
    </div>
  );
}

export default App;
