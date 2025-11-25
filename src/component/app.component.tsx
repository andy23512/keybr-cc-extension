import { Popover } from "@mui/material";
import classNames from "classnames";
import { MouseEvent, useEffect, useRef, useState, WheelEvent } from "react";
import Moveable from "react-moveable";
import { useSettingsStore } from "../store/settings-store";
import { getViewBoxAspectRatio } from "../util/layout-dimension.util";
import "./app.component.css";
import LayoutContainerComponent from "./layout-container.component";

function AppComponent() {
  const containerElement = document.querySelector(
    "#keybr-cc-extension-root"
  ) as HTMLDivElement;
  const mainDivRef = useRef(null);
  const moveableRef = useRef<Moveable>(null);

  const [editMode, setEditMode] = useState(false);
  const [infoPopoverAnchor, setInfoPopoverAnchor] =
    useState<HTMLButtonElement | null>(null);
  const [opacity, setOpacity] = useState<number>(1);
  const [containerWidth, setContainerWidth] = useState<number>(
    containerElement.clientWidth
  );
  const [containerHeight, setContainerHeight] = useState<number>(
    containerElement.clientHeight
  );
  const height = useSettingsStore.use.height();
  const xPosition = useSettingsStore.use.xPosition();
  const yPosition = useSettingsStore.use.yPosition();
  const showThumb3Switch = useSettingsStore.use.showThumb3Switch();
  const width = height * getViewBoxAspectRatio(showThumb3Switch);
  const leftMin = 8;
  const leftMax = containerWidth - 8 - width;
  const left = leftMin + (leftMax - leftMin) * xPosition;
  const topMin = 8;
  const topMax = containerHeight - 8 - height;
  const top = topMin + (topMax - topMin) * yPosition;

  useEffect(() => {
    function handleResize(entries: ResizeObserverEntry[]) {
      const entry = entries[0];
      setContainerWidth(entry.contentRect.width);
      setContainerHeight(entry.contentRect.height);
    }

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerElement);
    return () => {
      observer.unobserve(containerElement);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const preventBodyScroll = (event: Event) => {
      event.preventDefault();
    };

    if (editMode) {
      document.body.addEventListener("wheel", preventBodyScroll, {
        passive: false,
      });
      window.addEventListener("wheel", preventBodyScroll, {
        passive: false,
      });
    } else {
      document.body.removeEventListener("wheel", preventBodyScroll);
      window.removeEventListener("wheel", preventBodyScroll);
    }

    return () => {
      document.body.removeEventListener("wheel", preventBodyScroll);
      window.removeEventListener("wheel", preventBodyScroll);
    };
  }, [editMode]);

  const handleSettingButtonClick = () => {
    setEditMode((prevEditMode) => !prevEditMode);
  };

  const handleInfoButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    setInfoPopoverAnchor((prev) => (!!prev ? null : event.currentTarget));
  };

  const handleInfoPopoverClose = () => {
    setInfoPopoverAnchor(null);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!editMode) {
      return;
    }
    if (event.deltaY === 0) {
      return;
    }
    const delta = event.deltaY < 0 ? 0.1 : -0.1;
    let nextOpacity = opacity + delta;
    if (nextOpacity > 1) {
      nextOpacity = 1;
    }
    if (nextOpacity < 0.2) {
      nextOpacity = 0.2;
    }
    setOpacity(nextOpacity);
  };

  const infoPopoverOpen = Boolean(infoPopoverAnchor);

  return (
    <>
      <div
        ref={mainDivRef}
        className="absolute pointer-events-auto min-h-32"
        style={{ opacity, left: left + "px", top: top + "px", width, height }}
        onWheel={handleWheel}
      >
        <LayoutContainerComponent></LayoutContainerComponent>
        <div className="absolute right-0 top-1/2 -translate-y-5 flex flex-col gap-1">
          <button
            className={classNames("!text-3xl material-icons", {
              "bg-(--KeyboardKey-pointer__color)": editMode,
              "text-white": editMode,
            })}
            onClick={handleSettingButtonClick}
          >
            settings
          </button>
          {editMode && (
            <>
              <button
                className="!text-3xl material-icons"
                onClick={handleInfoButtonClick}
              >
                info
              </button>
            </>
          )}
          <Popover
            open={infoPopoverOpen}
            anchorEl={infoPopoverAnchor}
            onClose={handleInfoPopoverClose}
            anchorOrigin={{ vertical: "center", horizontal: "right" }}
            transformOrigin={{ vertical: "center", horizontal: "left" }}
            disableScrollLock
          >
            <div className="overflow-hidden p-1">
              Drag to move. <br />
              Drag the control points to resize. <br />
              Scroll up or down to adjust the transparency.
            </div>
          </Popover>
        </div>
      </div>
      <Moveable
        className="pointer-events-auto"
        ref={moveableRef}
        padding={{
          left: 8,
          right: 8,
          top: 8,
          bottom: 8,
        }}
        target={editMode ? mainDivRef : null}
        draggable={true}
        onDrag={(e) => {
          e.target.style.transform = e.transform;
        }}
        useResizeObserver={true}
        resizable={true}
        keepRatio={true}
        onResize={(e) => {
          e.target.style.width = `${e.width}px`;
          e.target.style.height = `${e.height}px`;
          e.target.style.transform = e.transform;
        }}
        snappable={true}
        bounds={{ left: 8, top: 8, right: 8, bottom: 8, position: "css" }}
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
