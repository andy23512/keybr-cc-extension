import React from "react";
import KeyLabel from "./KeyLabel";
import SwitchSector from "./SwitchSector";

interface SwitchProps {
  center: { x: number; y: number };
  rotationDirection: "cw" | "ccw";
  rotation: number;
  keyLabelMap: null; // TODO
  positionCodeMap: null; // TODO
  highlightKeyCombination: null; // TODO
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

const Switch: React.FC<SwitchProps> = ({
  center,
  rotationDirection,
  rotation,
}) => {
  const r = (rotationDirection === "cw" ? 1 : -1) * rotation;
  return (
    <g className="switch">
      {SECTORS.map((sector) => (
        <SwitchSector
          center={center}
          degree={sector.degree + r}
          direction={rotationDirection}
          positionCode={null} // TODO
          keyLabel={[]} // TODO
          highlightKeyCombination={null} // TODO
          strokeWidth={STROKE_WIDTH}
          highlightOpacity={HIGHLIGHT_OPACITY}
          fontSize={FONT_SIZE}
        />
      ))}
      <circle
        className="highlight"
        cx={center.x}
        cy={center.y}
        r="53.68"
        opacity={0} // TODO
      />
      <KeyLabel
        x={center.x}
        y={center.y}
        highlightKeyCombination={null} // TODO
        labels={[]} // TODO
        fontSize={FONT_SIZE}
      />
    </g>
  );
};

export default Switch;
