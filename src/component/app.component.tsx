import { useRef } from "react";
import "./app.component.css";
import LayoutContainerComponent from "./layout-container.component";

function AppComponent() {
  const mainDivRef = useRef(null);
  return (
    <>
      <div
        ref={mainDivRef}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-68"
      >
        <LayoutContainerComponent></LayoutContainerComponent>
      </div>
    </>
  );
}

export default AppComponent;
