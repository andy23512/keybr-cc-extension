import { useRef } from "react";
import Moveable from "react-moveable";
import "./app.component.css";
import LayoutContainerComponent from "./layout-container.component";

function AppComponent() {
  const mainDivRef = useRef(null);
  return (
    <>
      <div
        ref={mainDivRef}
        className="absolute bottom-0 left-1/2 w-100 h-68"
        style={{ transform: "translateX(-50%)" }}
      >
        <LayoutContainerComponent></LayoutContainerComponent>
      </div>
      <Moveable
        target={mainDivRef}
        draggable={true}
        throttleDrag={0}
        onDrag={(e) => {
          e.target.style.transform = e.transform;
        }}
        resizable={true}
        keepRatio={false}
        onResize={(e) => {
          e.target.style.width = `${e.width}px`;
          e.target.style.height = `${e.height}px`;
          e.target.style.transform = e.transform;
        }}
        snappable={true}
        bounds={{ left: 0, top: 0, right: 0, bottom: 0, position: "css" }}
        verticalGuidelines={[document.body.clientWidth / 2]}
        horizontalGuidelines={[document.body.clientHeight / 2]}
        snapDirections={{
          top: true,
          left: true,
          center: true,
          right: true,
          bottom: true,
          middle: true,
        }}
      ></Moveable>
    </>
  );
}

export default AppComponent;
