import React from "react";
import ReactDOM from "react-dom/client";
import AppComponent from "./component/app.component";

const appContainer = document.createElement("div");
appContainer.id = "keybr-cc-extension-root";
appContainer.style.position = "fixed";
appContainer.style.width = "100%";
appContainer.style.height = "100vh";
appContainer.style.zIndex = "1000";
appContainer.style.top = "0px";
appContainer.style.pointerEvents = "none";
document.body.appendChild(appContainer);

const root = ReactDOM.createRoot(appContainer);
root.render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>
);
