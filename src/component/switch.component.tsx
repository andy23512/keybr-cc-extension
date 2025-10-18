import React from "react";
import {
  HighlightKeyCombination,
  KeyLabelMap,
} from "../model/device-layout.model";
import { DirectionMap } from "../model/layout.model";
import KeyLabelComponent from "./key-label.component";
import SwitchSectorComponent from "./switch-sector.component";

interface SwitchComponentProps {
  center: { x: number; y: number };
  rotationDirection: "cw" | "ccw";
  rotation: number;
  keyLabelMap: KeyLabelMap;
  positionCodeMap: DirectionMap<number>;
  highlightKeyCombination: HighlightKeyCombination | null;
}

const FONT_SIZE = 90;
const HIGHLIGHT_OPACITY = 0.5;
const STROKE_WIDTH = 1;
const SECTORS: { direction: "n" | "e" | "s" | "w"; degree: number }[] = [
  { direction: "n", degree: 270 },
  { direction: "e", degree: 0 },
  { direction: "s", degree: 90 },
  { direction: "w", degree: 180 },
];

const SwitchComponent: React.FC<SwitchComponentProps> = ({
  center,
  rotationDirection,
  rotation,
  positionCodeMap,
  keyLabelMap,
  highlightKeyCombination,
}) => {
  const r = (rotationDirection === "cw" ? 1 : -1) * rotation;
  return (
    <g>
      {SECTORS.map((sector) => (
        <SwitchSectorComponent
          key={sector.direction}
          center={center}
          degree={sector.degree + r}
          direction={rotationDirection}
          positionCode={positionCodeMap[sector.direction]}
          keyLabel={keyLabelMap[positionCodeMap[sector.direction]]}
          highlightKeyCombination={highlightKeyCombination}
          strokeWidth={STROKE_WIDTH}
          highlightOpacity={HIGHLIGHT_OPACITY}
          fontSize={FONT_SIZE}
        />
      ))}
      <circle
        className="fill-(--KeyboardKey-pointer__color)"
        cx={center.x}
        cy={center.y}
        r="53.68"
        opacity={
          highlightKeyCombination?.positionCodes?.includes(positionCodeMap.c)
            ? HIGHLIGHT_OPACITY
            : 0
        }
      />
      <KeyLabelComponent
        x={center.x}
        y={center.y}
        highlightKeyCombination={highlightKeyCombination}
        labels={keyLabelMap[positionCodeMap.c]}
        fontSize={FONT_SIZE}
      />
    </g>
  );
};

export default SwitchComponent;
