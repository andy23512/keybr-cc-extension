import { HighlightSetting } from "tangent-cc-lib";

export const HIGHLIGHT_SETTING: HighlightSetting = {
  shiftLayer: {
    preferSides: "both" as const,
    preferShiftSide: "left" as const,
  },
  numShiftLayer: {
    preferSides: "both" as const,
    preferNumShiftSide: "left" as const,
  },
  shiftAndNumShiftLayer: {
    preferShiftSide: "right" as const,
    preferCharacterKeySide: "right" as const,
  },
  fnShiftLayer: {
    preferSides: "both" as const,
    preferFnShiftSide: "left" as const,
  },
  shiftAndFnShiftLayer: {
    preferShiftSide: "right" as const,
    preferCharacterKeySide: "right" as const,
  },
  flagShiftLayer: {
    preferSides: "both" as const,
    preferFlagShiftSide: "left" as const,
  },
  shiftAndFlagShiftLayer: {
    preferShiftSide: "right" as const,
    preferCharacterKeySide: "right" as const,
  },
};
