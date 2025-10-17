import React from "react";
import "./KeyLabel.css";

interface KeyLabelProps {
  x: number;
  y: number;
  highlightKeyCombination: null; // TODO
  labels: any[]; // TODO
  fontSize: number;
}

const KeyLabel: React.FC<KeyLabelProps> = ({ x, y, fontSize, labels }) => {
  function isLabelActive(label: any) {
    return false; // TODO
  }
  function getFontSize(label: any) {
    return fontSize; // TODO
  }
  // TODO - opacity
  return (
    <g className="key-label">
      {labels.map((label) => (
        <text
          x={x}
          y={y}
          dominantBaseline="central"
          textAnchor="middle"
          style={{ fontSize: getFontSize(label) + "px" }}
          className="transition-opacity"
          opacity={0}
        >
          {label.c}
        </text>
      ))}
    </g>
  );
};

export default KeyLabel;
