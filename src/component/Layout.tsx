import React from "react";
import cc1Layout from "../layout/cc1-layout.svg";
import "./Layout.css";

function Layout() {
  return (
    <div
      className="layout"
      dangerouslySetInnerHTML={{ __html: cc1Layout }}
    ></div>
  );
}

export default Layout;
