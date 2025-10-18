import React from "react";
import {
  HighlightKeyCombination,
  KeyLabel,
} from "../model/device-layout.model";
import { cos, sin } from "../util/math.util";
import KeyLabelComponent from "./key-label.component";

const OFFSET = 8;
const R1 = 65;
const R2 = 175;

interface SwitchSectorComponentProps {
  center: { x: number; y: number };
  degree: number;
  direction: "cw" | "ccw";
  positionCode: number;
  keyLabel: KeyLabel[];
  highlightKeyCombination: HighlightKeyCombination | null;
  strokeWidth: number;
  highlightOpacity: number;
  fontSize: number;
}

const SwitchSectorComponent: React.FC<SwitchSectorComponentProps> = ({
  center,
  strokeWidth,
  direction,
  degree,
  fontSize,
  highlightKeyCombination,
  keyLabel,
  positionCode,
  highlightOpacity,
}) => {
  const r1 = R1;
  const r2 = R2 - strokeWidth;
  const alpha1 = (Math.asin(((OFFSET / 2) * Math.SQRT2) / r1) / Math.PI) * 180;
  const alpha2 = (Math.asin(((OFFSET / 2) * Math.SQRT2) / r2) / Math.PI) * 180;
  const sectorPath = (() => {
    const d = degree;
    const cx = center.x;
    const cy = center.y;
    const dStart = d - 45;
    const dEnd = d + 45;
    const beta1Start = dStart + alpha1;
    const beta1End = dEnd - alpha1;
    const beta2Start = dStart + alpha2;
    const beta2End = dEnd - alpha2;
    if (direction === "cw") {
      return `
        M ${cx + r1 * cos(beta1Start)} ${cy + r1 * sin(beta1Start)}
        A ${r1} ${r1} 0 0 1 ${cx + r1 * cos(beta1End)} ${
        cy + r1 * sin(beta1End)
      }
        L ${cx + r2 * cos(beta2End)} ${cy + r2 * sin(beta2End)}
        A ${r2} ${r2} 0 0 0 ${cx + r2 * cos(beta2Start)} ${
        cy + r2 * sin(beta2Start)
      }
      `;
    } else {
      return `
        M ${cx + r1 * cos(beta1End)} ${cy + r1 * sin(beta1End)}
        A ${r1} ${r1} 0 0 0 ${cx + r1 * cos(beta1Start)} ${
        cy + r1 * sin(beta1Start)
      }
        L ${cx + r2 * cos(beta2Start)} ${cy + r2 * sin(beta2Start)}
        A ${r2} ${r2} 0 0 1 ${cx + r2 * cos(beta2End)} ${
        cy + r2 * sin(beta2End)
      }
      `;
    }
  })();
  const textRadius = (r1 + r2) / 2;
  const textX = center.x + textRadius * cos(degree);
  const textY = center.y + textRadius * sin(degree);

  return (
    <g>
      <path
        className="fill-(--KeyboardKey-button__color) stroke-(--KeyboardKey-symbol__color)"
        d={sectorPath}
        strokeWidth={strokeWidth}
      ></path>
      <path
        className="fill-(--KeyboardKey-pointer__color)"
        d={sectorPath + " Z"}
        opacity={
          highlightKeyCombination?.positionCodes?.includes(positionCode)
            ? highlightOpacity
            : 0
        }
      ></path>
      <KeyLabelComponent
        x={textX}
        y={textY}
        fontSize={fontSize}
        highlightKeyCombination={highlightKeyCombination}
        labels={keyLabel}
      />
    </g>
  );
};

export default SwitchSectorComponent;
