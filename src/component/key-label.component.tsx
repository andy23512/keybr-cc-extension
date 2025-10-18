import classNames from "classnames";
import React from "react";
import {
  HighlightKeyCombination,
  KeyLabel,
  KeyLabelType,
} from "../model/device-layout.model";
import "./key-label.component.css";

interface KeyLabelComponentProps {
  x: number;
  y: number;
  highlightKeyCombination: HighlightKeyCombination | null;
  labels: KeyLabel[];
  fontSize: number;
}

const KeyLabelComponent: React.FC<KeyLabelComponentProps> = ({
  x,
  y,
  fontSize,
  labels,
  highlightKeyCombination,
}) => {
  function isLabelActive(label: KeyLabel) {
    return (
      highlightKeyCombination &&
      ((label.layer === highlightKeyCombination.layer &&
        label.shiftKey === highlightKeyCombination.shiftKey &&
        label.altGraphKey === highlightKeyCombination.altGraphKey) ||
        label.layer === null)
    );
  }
  function getFontSize({ type, c }: KeyLabel) {
    switch (type) {
      case KeyLabelType.String:
        if (c.length > 2) {
          return fontSize * 0.6;
        }
        if (c.length > 1) {
          return fontSize * 0.8;
        }
        return fontSize;
      case KeyLabelType.ActionCode:
        return fontSize * 0.6;
      case KeyLabelType.Icon:
      case KeyLabelType.Logo:
        return fontSize * 0.8;
      default:
        const _: never = type;
        throw new Error(`Unhandled key label type case: ${type}`);
    }
  }
  return (
    <g className="key-label">
      {labels?.map((label, index) => (
        <text
          className={classNames("fill-current transition-opacity", {
            "material-icons": label.type === KeyLabelType.Icon,
          })}
          key={index}
          x={x}
          y={y}
          dominantBaseline="central"
          textAnchor="middle"
          style={{ fontSize: getFontSize(label) + "px" }}
          opacity={isLabelActive(label) ? 1 : 0}
        >
          {label.c}
        </text>
      ))}
    </g>
  );
};

export default KeyLabelComponent;
