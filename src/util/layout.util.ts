import {
  ACTIONS,
  ALT_GRAPH_ACTION_CODE,
  FN_SHIFT_ACTION_CODES,
  NUM_SHIFT_ACTION_CODES,
  SHIFT_ACTION_CODES,
} from "../data/actions";
import { ActionType } from "../model/action.model";
import {
  DeviceLayout,
  HighlightKeyCombination,
  KeyCombination,
  Layer,
} from "../model/device-layout.model";
import { WSKCode } from "../model/key-code.model";
import {
  CharacterActionCode,
  CharacterKeyCode,
  CharacterKeyCodeMap,
  KeyBoardLayout,
  KeyboardLayoutKey,
} from "../model/keyboard-layout.model";
import { nonNullable } from "./non-nullable.util";

export function convertKeyboardLayoutToCharacterKeyCodeMap(
  keyboardLayout: KeyBoardLayout | null
): CharacterKeyCodeMap {
  if (!keyboardLayout) {
    return new Map();
  }
  return new Map(
    (
      Object.entries(keyboardLayout.layout) as [
        WSKCode,
        Partial<KeyboardLayoutKey>
      ][]
    )
      .map(([keyCode, keyboardLayoutKey]) =>
        keyboardLayoutKey
          ? (
              Object.entries(keyboardLayoutKey) as [
                keyof KeyboardLayoutKey,
                string
              ][]
            ).map(
              ([modifier, character]) =>
                [
                  character,
                  {
                    keyCode,
                    shiftKey:
                      modifier === "withShift" ||
                      modifier === "withShiftAltGraph",
                    altGraphKey:
                      modifier === "withAltGraph" ||
                      modifier === "withShiftAltGraph",
                  },
                ] as const
            )
          : []
      )
      .flat()
  );
}

export function getCharacterKeyCodeFromCharacter(
  character: string,
  characterKeyCodeMap: CharacterKeyCodeMap
) {
  return characterKeyCodeMap.get(character);
}

export function getCharacterActionCodesFromCharacterKeyCode({
  keyCode,
  shiftKey,
  altGraphKey,
}: CharacterKeyCode): CharacterActionCode[] {
  const characterActionCodes: CharacterActionCode[] = [];
  const action = ACTIONS.find(
    (a) =>
      (a.type === ActionType.WSK ||
        (a.type === ActionType.NonWSK &&
          a.keyCode === "Space" &&
          a.codeId === 544)) &&
      a.keyCode === keyCode &&
      !a.withShift
  );
  if (action) {
    characterActionCodes.push({
      actionCode: action.codeId,
      shiftKey,
      altGraphKey,
    });
  }
  if (shiftKey) {
    const holdShiftKeyAction = ACTIONS.find(
      (a) => a.type === ActionType.WSK && a.keyCode === keyCode && a.withShift
    );
    if (holdShiftKeyAction) {
      characterActionCodes.push({
        actionCode: holdShiftKeyAction.codeId,
        shiftKey: false,
        altGraphKey,
      });
    }
  }
  return characterActionCodes;
}

export function getKeyCombinationsFromActionCodes(
  characterActionCodes: CharacterActionCode[],
  deviceLayout: DeviceLayout | null
): KeyCombination[] | null {
  if (!deviceLayout) {
    return null;
  }
  return characterActionCodes
    .map(({ actionCode, shiftKey, altGraphKey }) =>
      deviceLayout.layout.map((layer, layerIndex) => {
        const positionCodesList = layer
          .map((ac, index) => (ac === actionCode ? index : -1))
          .filter((pos) => pos !== -1)
          .map((pos) => {
            let layer = Layer.Primary;
            if (layerIndex === 1) {
              layer = Layer.Secondary;
            } else if (layerIndex === 2) {
              layer = Layer.Tertiary;
            }
            return {
              characterKeyPositionCode: pos,
              layer,
              shiftKey,
              altGraphKey,
            };
          });
        if (positionCodesList.length === 0) {
          return null;
        }
        return positionCodesList;
      })
    )
    .flat()
    .flat()
    .filter(nonNullable);
}

export function getNumShiftKeyPositionCodes(
  deviceLayout: DeviceLayout
): number[] {
  const [primaryLayer, secondaryLayer] = deviceLayout.layout;
  return primaryLayer
    .map((ac, index) => (NUM_SHIFT_ACTION_CODES.includes(ac) ? index : -1))
    .filter((pos) => pos !== -1 && primaryLayer[pos] === secondaryLayer[pos]);
}

export function getModifierKeyPositionCodeMap(deviceLayout: DeviceLayout) {
  return {
    shift: SHIFT_ACTION_CODES.map((actionCode) =>
      getKeyCombinationsFromActionCodes(
        [{ actionCode, shiftKey: false, altGraphKey: false }],
        deviceLayout
      )?.map((k) => k.characterKeyPositionCode)
    )
      .filter(nonNullable)
      .flat(),
    numShift: getNumShiftKeyPositionCodes(deviceLayout),
    fnShift: FN_SHIFT_ACTION_CODES.map((actionCode) =>
      getKeyCombinationsFromActionCodes(
        [{ actionCode, shiftKey: false, altGraphKey: false }],
        deviceLayout
      )?.map((k) => k.characterKeyPositionCode)
    )
      .filter(nonNullable)
      .flat(),
    altGraph: [ALT_GRAPH_ACTION_CODE]
      .map((actionCode) =>
        getKeyCombinationsFromActionCodes(
          [{ actionCode, shiftKey: false, altGraphKey: false }],
          deviceLayout
        )?.map((k) => k.characterKeyPositionCode)
      )
      .filter(nonNullable)
      .flat(),
  };
}

export function getPositionSide(positionCode: number) {
  return positionCode < 45 ? "left" : "right";
}

export function isPositionAtSide(positionCode: number, side: "left" | "right") {
  return getPositionSide(positionCode) === side;
}

export function meetPreferSides(
  positionCode1: number,
  positionCode2: number,
  preferSides: "both" | "same"
) {
  if (preferSides === "both") {
    return getPositionSide(positionCode1) !== getPositionSide(positionCode2);
  } else {
    return getPositionSide(positionCode1) === getPositionSide(positionCode2);
  }
}

export function getHighlightKeyCombinationFromKeyCombinations(
  keyCombinations: KeyCombination[],
  modifierKeyPositionCodeMap: {
    shift: number[];
    numShift: number[];
    fnShift: number[];
    altGraph: number[];
  }
) {
  const highlightSetting = {
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
  };
  return keyCombinations
    .map((k) => {
      const result: HighlightKeyCombination[] = [];
      if (k.shiftKey) {
        if (k.layer === Layer.Secondary) {
          const { preferCharacterKeySide, preferShiftSide } =
            highlightSetting.shiftAndNumShiftLayer;
          for (const shiftPositionCode of modifierKeyPositionCodeMap.shift) {
            for (const numShiftPositionCode of modifierKeyPositionCodeMap.numShift) {
              let score = 0;
              if (
                isPositionAtSide(
                  k.characterKeyPositionCode,
                  preferCharacterKeySide
                )
              ) {
                score += 1;
              }
              if (isPositionAtSide(shiftPositionCode, preferShiftSide)) {
                score += 1;
              }
              if (!isPositionAtSide(numShiftPositionCode, preferShiftSide)) {
                score += 1;
              }
              result.push({
                ...k,
                positionCodes: [
                  k.characterKeyPositionCode,
                  shiftPositionCode,
                  numShiftPositionCode,
                ],
                score,
              });
            }
          }
        } else if (k.layer === Layer.Tertiary) {
          const { preferCharacterKeySide, preferShiftSide } =
            highlightSetting.shiftAndFnShiftLayer;
          for (const shiftPositionCode of modifierKeyPositionCodeMap.shift) {
            for (const fnShiftPositionCode of modifierKeyPositionCodeMap.fnShift) {
              let score = 0;
              if (
                isPositionAtSide(
                  k.characterKeyPositionCode,
                  preferCharacterKeySide
                )
              ) {
                score += 1;
              }
              if (isPositionAtSide(shiftPositionCode, preferShiftSide)) {
                score += 1;
              }
              if (!isPositionAtSide(fnShiftPositionCode, preferShiftSide)) {
                score += 1;
              }
              result.push({
                ...k,
                positionCodes: [
                  k.characterKeyPositionCode,
                  shiftPositionCode,
                  fnShiftPositionCode,
                ],
                score,
              });
            }
          }
        } else {
          const { preferShiftSide, preferSides } = highlightSetting.shiftLayer;
          for (const shiftPositionCode of modifierKeyPositionCodeMap.shift) {
            let score = 0;
            if (
              meetPreferSides(
                k.characterKeyPositionCode,
                shiftPositionCode,
                preferSides
              )
            ) {
              score += 2;
            }
            if (isPositionAtSide(shiftPositionCode, preferShiftSide)) {
              score += 1;
            }
            result.push({
              ...k,
              positionCodes: [k.characterKeyPositionCode, shiftPositionCode],
              score,
            });
          }
        }
      } else {
        if (k.layer === Layer.Secondary) {
          const { preferNumShiftSide, preferSides } =
            highlightSetting.numShiftLayer;
          for (const numShiftPositionCode of modifierKeyPositionCodeMap.numShift) {
            let score = 0;
            if (
              meetPreferSides(
                k.characterKeyPositionCode,
                numShiftPositionCode,
                preferSides
              )
            ) {
              score += 2;
            }
            if (isPositionAtSide(numShiftPositionCode, preferNumShiftSide)) {
              score += 1;
            }
            result.push({
              ...k,
              positionCodes: [k.characterKeyPositionCode, numShiftPositionCode],
              score,
            });
          }
        } else if (k.layer === Layer.Tertiary) {
          const { preferFnShiftSide, preferSides } =
            highlightSetting.fnShiftLayer;
          for (const fnShiftPositionCode of modifierKeyPositionCodeMap.fnShift) {
            let score = 0;
            if (
              meetPreferSides(
                k.characterKeyPositionCode,
                fnShiftPositionCode,
                preferSides
              )
            ) {
              score += 2;
            }
            if (isPositionAtSide(fnShiftPositionCode, preferFnShiftSide)) {
              score += 1;
            }
            result.push({
              ...k,
              positionCodes: [k.characterKeyPositionCode, fnShiftPositionCode],
              score,
            });
          }
        } else {
          result.push({
            ...k,
            positionCodes: [k.characterKeyPositionCode],
            score: 0,
          });
        }
      }
      return k.altGraphKey
        ? result.map((r) => ({
            ...r,
            positionCodes: [
              ...r.positionCodes,
              ...modifierKeyPositionCodeMap.altGraph,
            ],
          }))
        : result;
    })
    .flat()
    .sort((a, b) => {
      if (a.positionCodes.length !== b.positionCodes.length) {
        return a.positionCodes.length - b.positionCodes.length;
      }
      if (a.layer !== b.layer) {
        return a.layer.localeCompare(b.layer);
      }
      return b.score - a.score;
    })[0];
}
