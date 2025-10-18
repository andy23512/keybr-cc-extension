import React from "react";
import ReactDOM from "react-dom/client";
import AppComponent from "./component/app.component";

const appContainer = document.createElement("div");
appContainer.id = "keybr-cc-extension-root";
appContainer.style.position = "relative";
appContainer.style.width = "100%";
appContainer.style.height = "0px";
appContainer.style.zIndex = "1";
document.body.appendChild(appContainer);

const root = ReactDOM.createRoot(appContainer);
root.render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>
);
