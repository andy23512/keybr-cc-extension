import React from "react";
import { cos, sin } from "../util/math.util";
import KeyLabel from "./KeyLabel";

const OFFSET = 8;
const R1 = 65;
const R2 = 175;

interface SwitchSectorProps {
  center: { x: number; y: number };
  degree: number;
  direction: "cw" | "ccw";
  positionCode: null; // TODO
  keyLabel: any[]; // TODO
  highlightKeyCombination: null; // TODO
  strokeWidth: number;
  highlightOpacity: number;
  fontSize: number;
}

const SwitchSector: React.FC<SwitchSectorProps> = ({
  center,
  strokeWidth,
  direction,
  degree,
  fontSize,
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

  // TODO - highlight opacity, highlightKeyCombination, labels
  return (
    <g className="switch-sector">
      <path
        className="switch-sector-button"
        d={sectorPath}
        strokeWidth={strokeWidth}
      ></path>
      <path className="highlight" d={sectorPath + " Z"} opacity={0}></path>
      <KeyLabel
        x={textX}
        y={textY}
        fontSize={fontSize}
        highlightKeyCombination={null}
        labels={[]}
      />
    </g>
  );
};

export default SwitchSector;
