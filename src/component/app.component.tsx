import { Popover } from "@mui/material";
import classNames from "classnames";
import { MouseEvent, useEffect, useRef, useState, WheelEvent } from "react";
import Moveable from "react-moveable";
import { useNextText } from "../hook/use-next-text";
import { useSettingsStore } from "../store/settings-store";
import { getViewBoxAspectRatio } from "../util/layout-dimension.util";
import "./app.component.css";
import LayoutContainerComponent from "./layout-container.component";

function AppComponent() {
  const containerElement = document.querySelector(
    "#keybr-cc-extension-root"
  ) as HTMLDivElement;
  const mainDivRef = useRef(null);
  const infoButtonRef = useRef(null);

  const [editMode, setEditMode] = useState(false);
  const [infoPopoverOpen, setInfoPopoverOpen] = useState<boolean>(false);
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
  const opacity = useSettingsStore.use.opacity();
  const width = height * getViewBoxAspectRatio(showThumb3Switch);
  const leftMin = 8;
  const leftMax = containerWidth - 8 - width;
  const left = leftMin + (leftMax - leftMin) * xPosition;
  const topMin = 8;
  const topMax = containerHeight - 8 - height;
  const top = topMin + (topMax - topMin) * yPosition;
  const setSettings = useSettingsStore.use.set();
  const resetLayoutDisplay = useSettingsStore.use.resetLayoutDisplay();

  useEffect(() => {
    function handleResize(entries: ResizeObserverEntry[]) {
      const entry = entries[0];
      setEditMode(false);
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
    setInfoPopoverOpen((prev) => !prev);
  };

  const handleInfoPopoverClose = () => {
    setInfoPopoverOpen(false);
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
    setSettings("opacity", nextOpacity);
  };

  const handleResetButtonClick = () => {
    resetLayoutDisplay();
    setEditMode(false);
  };

  const nextText = useNextText();

  return (
    <>
      <div
        ref={mainDivRef}
        className={classNames("absolute min-h-32", {
          invisible: !nextText,
          "pointer-events-auto": editMode,
          "pointer-events-none": !editMode,
        })}
        style={{ opacity, left: left + "px", top: top + "px", width, height }}
        onWheel={handleWheel}
      >
        <LayoutContainerComponent nextText={nextText} />
        {editMode && (
          <button
            className="absolute pointer-events-auto cursor-pointer left-0 top-1/2 -translate-y-5 material-icons !text-3xl"
            onClick={handleResetButtonClick}
          >
            replay
          </button>
        )}
        <div className="absolute right-0 top-1/2 -translate-y-5 flex flex-col gap-1">
          <button
            className={classNames(
              "pointer-events-auto cursor-pointer !text-3xl material-icons",
              {
                "bg-(--KeyboardKey-pointer__color)": editMode,
                "text-white": editMode,
                "opacity-100": editMode,
                "opacity-50": !editMode,
              }
            )}
            onClick={handleSettingButtonClick}
          >
            settings
          </button>
          {editMode && (
            <>
              <button
                ref={infoButtonRef}
                className="pointer-events-auto cursor-pointer !text-3xl material-icons"
                onClick={handleInfoButtonClick}
              >
                info
              </button>
            </>
          )}
          <Popover
            open={infoPopoverOpen}
            anchorEl={infoButtonRef.current}
            onClose={handleInfoPopoverClose}
            anchorOrigin={{ vertical: "center", horizontal: "right" }}
            transformOrigin={{ vertical: "center", horizontal: "left" }}
            disableScrollLock
          >
            <div className="overflow-hidden p-1">
              Drag to move. Drag the control points to resize. <br />
              Scroll up or down to adjust the transparency. <br />
              Click the reset button on the left to reset to default. <br />
            </div>
          </Popover>
        </div>
      </div>
      <Moveable
        className={classNames("pointer-events-auto", {
          "!invisible": !nextText,
        })}
        padding={{
          left: 8,
          right: 8,
          top: 8,
          bottom: 8,
        }}
        target={editMode ? mainDivRef : null}
        draggable={true}
        onDrag={(e) => {
          e.target.style.left = e.left + "px";
          e.target.style.top = e.top + "px";
        }}
        onDragEnd={(e) => {
          const box = e.target.getBoundingClientRect();
          const nextLeftMax = containerWidth - 8 - box.width;
          const nextXPosition = Math.max(
            Math.min((box.left - leftMin) / (nextLeftMax - leftMin), 1),
            0
          );
          const nextTopMax = containerHeight - 8 - box.height;
          const nextYPosition = Math.max(
            Math.min((box.top - topMin) / (nextTopMax - topMin), 1),
            0
          );
          const nextHeight = box.height;
          setSettings("xPosition", nextXPosition);
          setSettings("yPosition", nextYPosition);
          setSettings("height", nextHeight);
        }}
        useResizeObserver={true}
        resizable={true}
        keepRatio={true}
        onResize={(e) => {
          e.target.style.width = `${e.width}px`;
          e.target.style.height = `${e.height}px`;
          e.target.style.left = e.drag.left + "px";
          e.target.style.top = e.drag.top + "px";
        }}
        onResizeEnd={(e) => {
          const box = e.target.getBoundingClientRect();
          const nextLeftMax = containerWidth - 8 - box.width;
          const nextXPosition = Math.max(
            Math.min((box.left - leftMin) / (nextLeftMax - leftMin), 1),
            0
          );
          const nextTopMax = containerHeight - 8 - box.height;
          const nextYPosition = Math.max(
            Math.min((box.top - topMin) / (nextTopMax - topMin), 1),
            0
          );
          const nextHeight = box.height;
          setSettings("xPosition", nextXPosition);
          setSettings("yPosition", nextYPosition);
          setSettings("height", nextHeight);
        }}
        snappable={true}
        bounds={{ left: 8, top: 8, right: 8, bottom: 8, position: "css" }}
        verticalGuidelines={[document.body.clientWidth / 2]}
        horizontalGuidelines={[document.body.clientHeight / 2]}
        snapDirections={{
          center: true,
          middle: true,
        }}
      ></Moveable>
    </>
  );
}

export default AppComponent;
