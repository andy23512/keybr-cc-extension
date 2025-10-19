import React from "react";
import { POSITION_CODE_LAYOUT } from "../data/layouts";
import {
  HighlightKeyCombination,
  KeyLabelMap,
} from "../model/device-layout.model";
import { FingerMap, HandMap } from "../model/layout.model";
import "./layout.component.css";
import SwitchComponent from "./switch.component";

interface LayoutComponentProps {
  keyLabelMap: KeyLabelMap;
  highlightKeyCombination: HighlightKeyCombination | null;
  showThumb3Switch: boolean;
}

const CELL_SIZE = 350;
const GAP = 35;
const GRID_COLUMNS = 10;
const THUMB_ROTATION_ANGLE = 10;

const LayoutComponent: React.FC<LayoutComponentProps> = ({
  keyLabelMap,
  highlightKeyCombination,
  showThumb3Switch,
}) => {
  const gridRows = showThumb3Switch ? 5 : 4;
  const viewBoxWidth = CELL_SIZE * GRID_COLUMNS + GAP * (GRID_COLUMNS - 1);
  const viewBoxHeight = CELL_SIZE * gridRows + GAP * (gridRows - 1);
  const switches = [
    ...(showThumb3Switch ? (["thumbEnd"] as const) : []),
    "thumbMid",
    "thumbTip",
    "index",
    "middle",
    "middleMid",
    "ring",
    "ringMid",
    "little",
  ] as const;
  const sides = ["left", "right"] as const;

  function gridY(rowIndex: number): number {
    return rowIndex * (CELL_SIZE + GAP) + CELL_SIZE / 2;
  }

  function gridX(columnIndex: number): number {
    return columnIndex * (CELL_SIZE + GAP) + CELL_SIZE / 2;
  }

  function switchCenter(
    sw: keyof FingerMap<any>,
    side: keyof HandMap<any>
  ): { x: number; y: number } {
    let position: { x: number; y: number };
    switch (sw) {
      case "little":
        position = { x: gridX(0), y: gridY(0.5) };
        break;
      case "ring":
        position = { x: gridX(1), y: gridY(0) };
        break;
      case "ringMid":
        position = { x: gridX(1), y: gridY(1) };
        break;
      case "middle":
        position = { x: gridX(2), y: gridY(0) };
        break;
      case "middleMid":
        position = { x: gridX(2), y: gridY(1) };
        break;
      case "index":
        position = { x: gridX(3), y: gridY(0.5) };
        break;
      case "thumbTip":
        position = { x: gridX(4) - CELL_SIZE / 4, y: gridY(2) };
        break;
      case "thumbMid":
        position = { x: gridX(4) - CELL_SIZE / 2, y: gridY(3) };
        break;
      case "thumbEnd":
        position = {
          x: gridX(4) - (CELL_SIZE * 3) / 4,
          y: gridY(4),
        };
        break;
    }
    if (side === "right") {
      position.x = viewBoxWidth - position.x;
    }
    return position;
  }

  return (
    <svg
      className="layout h-64"
      viewBox={[0, 0, viewBoxWidth, viewBoxHeight].join(" ")}
      style={{ aspectRatio: viewBoxWidth + " / " + viewBoxHeight }}
    >
      {sides.map((side) => (
        <React.Fragment key={side}>
          {switches.map((sw) => (
            <SwitchComponent
              key={sw}
              center={switchCenter(sw, side)}
              rotationDirection={side === "left" ? "cw" : "ccw"}
              rotation={sw.startsWith("thumb") ? THUMB_ROTATION_ANGLE : 0}
              keyLabelMap={keyLabelMap}
              positionCodeMap={POSITION_CODE_LAYOUT[side][sw]}
              highlightKeyCombination={highlightKeyCombination}
            />
          ))}
        </React.Fragment>
      ))}
    </svg>
  );
};

export default LayoutComponent;
