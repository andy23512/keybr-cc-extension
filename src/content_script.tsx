import React from "react";
import ReactDOM from "react-dom/client";
import AppComponent from "./component/app.component";

const appContainer = document.createElement("div");
appContainer.id = "keybr-cc-extension-root";
appContainer.style.position = "absolute";
appContainer.style.top = "calc(100vh - 16rem + 3rem)";
appContainer.style.left = "50%";
appContainer.style.transform = "translateX(-50%)";
appContainer.style.zIndex = "1";
document.body.appendChild(appContainer);

const root = ReactDOM.createRoot(appContainer);
root.render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>
);
