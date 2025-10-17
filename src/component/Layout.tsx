import React, { useEffect, useState } from "react";
import cc1Layout from "../layout/cc1-layout.svg";
import m4gLayout from "../layout/m4g-layout.svg";
import { Layout } from "../model/layout.model";
import "./Layout.css";

function Layout() {
  const [layout, setLayout] = useState<Layout>("cc1");

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
    <div
      className="layout"
      dangerouslySetInnerHTML={{
        __html: layout === "m4g" ? m4gLayout : cc1Layout,
      }}
    ></div>
  );
}

export default Layout;
