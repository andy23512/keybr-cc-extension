import React from "react";
import { KeyLabelType, Layer } from "../model/device-layout.model";
import "./layout.component.css";
import SwitchComponent from "./switch.component";

interface LogoComponentProps {
  size: number;
  showText: boolean;
  className: string;
}

const LogoComponent: React.FC<LogoComponentProps> = ({
  size,
  showText,
  className,
}) => {
  return (
    <svg
      className={className}
      style={{ width: size + "px", height: size + "px" }}
      viewBox={[0, 0, 350, 350].join(" ")}
    >
      <SwitchComponent
        center={{ x: 175, y: 175 }}
        rotationDirection={"cw"}
        rotation={0}
        keyLabelMap={
          showText
            ? {
                "0": [
                  {
                    type: KeyLabelType.String,
                    c: "CC",
                    title: "CC",
                    layer: null,
                    shiftKey: null,
                    altGraphKey: null,
                  },
                ],
                "2": [
                  {
                    type: KeyLabelType.String,
                    c: "Keybr",
                    title: "Keybr",
                    layer: null,
                    shiftKey: null,
                    altGraphKey: null,
                  },
                ],
                "4": [
                  {
                    type: KeyLabelType.String,
                    c: "ext.",
                    title: "ext.",
                    layer: null,
                    shiftKey: null,
                    altGraphKey: null,
                  },
                ],
              }
            : {}
        }
        positionCodeMap={{ c: 0, e: 1, n: 2, w: 3, s: 4 }}
        highlightKeyCombination={{
          characterKeyPositionCode: 0,
          layer: Layer.Primary,
          shiftKey: false,
          altGraphKey: false,
          positionCodes: [2, 3, 4],
          score: 0,
        }}
      />
    </svg>
  );
};

export default LogoComponent;
