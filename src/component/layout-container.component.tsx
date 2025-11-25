import classNames from "classnames";
import { useEffect, useState } from "react";
import {
  CC1_DEFAULT_DEVICE_LAYOUT,
  M4G_DEFAULT_DEVICE_LAYOUT,
} from "../data/device-layouts";
import {
  ALT_GRAPH_KEY_LABEL,
  FN_SHIFT_KEY_LABEL,
  NUM_SHIFT_KEY_LABEL,
  SHIFT_KEY_LABEL,
} from "../data/key-labels";
import { KEYBOARD_LAYOUTS } from "../data/keyboard-layouts";
import {
  HighlightKeyCombination,
  KeyLabel,
  KeyLabelType,
  Layer,
} from "../model/device-layout.model";
import { KeyBoardLayout } from "../model/keyboard-layout.model";
import { useSettingsStore } from "../store/settings-store";
import {
  convertKeyboardLayoutToCharacterKeyCodeMap,
  getCharacterActionCodesFromCharacterKeyCode,
  getCharacterKeyCodeFromCharacter,
  getHighlightKeyCombinationFromKeyCombinations,
  getHighlightKeyCombinationFromText,
  getKeyCombinationsFromActionCodes,
  getModifierKeyPositionCodeMap,
} from "../util/layout.util";
import { nonNullable } from "../util/non-nullable.util";
import LayoutComponent from "./layout.component";

function LayoutContainerComponent() {
  const layout = useSettingsStore.use.layout();
  const customDeviceLayouts = useSettingsStore.use.customDeviceLayouts();
  const selectedKeyboardLayoutId =
    useSettingsStore.use.selectedKeyboardLayoutId();
  const showThumb3Switch = useSettingsStore.use.showThumb3Switch();

  const [nextText, setNextText] = useState<string | null>(null);

  useEffect(() => {
    function getCurrentText() {
      const currentCharacterElement = document.querySelector(
        'div[dir="ltr"] span[class]'
      );
      const nextTextElement = document.querySelector(
        'div[dir="ltr"] span[class] ~ span'
      );
      let nextText = currentCharacterElement
        ? currentCharacterElement.textContent
        : null;
      if (nextText && nextTextElement) {
        nextText += nextTextElement.textContent;
      }
      if (nextText === "") {
        nextText = " ";
      }
      setNextText(nextText);
    }
    setInterval(getCurrentText, 100);
  });

  const deviceLayout =
    [
      M4G_DEFAULT_DEVICE_LAYOUT,
      CC1_DEFAULT_DEVICE_LAYOUT,
      ...customDeviceLayouts,
    ].find((deviceLayout) => deviceLayout.id === layout) ||
    CC1_DEFAULT_DEVICE_LAYOUT;
  const selectedKeyboardLayout = KEYBOARD_LAYOUTS.find(
    (k) => k.id === selectedKeyboardLayoutId
  ) as KeyBoardLayout;
  selectedKeyboardLayout.layout.Space = { unmodified: " " };
  const characterKeyCodeMap = convertKeyboardLayoutToCharacterKeyCodeMap(
    selectedKeyboardLayout
  );
  const charactersDevicePositionCodes = [...characterKeyCodeMap.keys()]
    .map((c) => {
      const characterKeyCode = getCharacterKeyCodeFromCharacter(
        c,
        characterKeyCodeMap
      );
      if (!characterKeyCode) {
        return null;
      }
      const actionCodes =
        getCharacterActionCodesFromCharacterKeyCode(characterKeyCode);
      if (actionCodes.length === 0) {
        return null;
      }
      return {
        c,
        characterDeviceKeys: getKeyCombinationsFromActionCodes(
          actionCodes,
          deviceLayout
        ),
      };
    })
    .filter(nonNullable);
  const modifierKeyPositionCodeMap =
    getModifierKeyPositionCodeMap(deviceLayout);
  const keyLabelMap = (() => {
    const keyLabelMap: Record<number, KeyLabel[]> = {};
    let addShiftLabel = false;
    let addNumShiftLabel = false;
    let addFnShiftLabel = false;
    let addAltGraphLabel = false;
    charactersDevicePositionCodes.forEach((v) => {
      v?.characterDeviceKeys?.forEach(
        ({ characterKeyPositionCode, layer, shiftKey, altGraphKey }) => {
          const d =
            v.c === " "
              ? {
                  type: KeyLabelType.Icon as const,
                  c: "space_bar" as const,
                  title: "Space",
                  layer,
                  shiftKey,
                  altGraphKey,
                }
              : {
                  type: KeyLabelType.String as const,
                  c: v.c,
                  title: `Character: ${v.c}`,
                  layer,
                  shiftKey,
                  altGraphKey,
                };
          if (!keyLabelMap[characterKeyPositionCode]) {
            keyLabelMap[characterKeyPositionCode] = [d];
          } else {
            keyLabelMap[characterKeyPositionCode].push(d);
          }
          if (shiftKey && !addShiftLabel) {
            addShiftLabel = true;
          }
          if (layer === Layer.Secondary && !addNumShiftLabel) {
            addNumShiftLabel = true;
          }
          if (layer === Layer.Tertiary && !addFnShiftLabel) {
            addFnShiftLabel = true;
          }
          if (altGraphKey && !addAltGraphLabel) {
            addAltGraphLabel = true;
          }
        }
      );
    });
    if (addShiftLabel) {
      modifierKeyPositionCodeMap.shift.forEach((pos) => {
        if (!keyLabelMap[pos]) {
          keyLabelMap[pos] = [SHIFT_KEY_LABEL];
        } else {
          keyLabelMap[pos].push(SHIFT_KEY_LABEL);
        }
      });
    }
    if (addNumShiftLabel) {
      modifierKeyPositionCodeMap.numShift.forEach((pos) => {
        if (!keyLabelMap[pos]) {
          keyLabelMap[pos] = [NUM_SHIFT_KEY_LABEL];
        } else {
          keyLabelMap[pos].push(NUM_SHIFT_KEY_LABEL);
        }
      });
    }
    if (addFnShiftLabel) {
      modifierKeyPositionCodeMap.fnShift.forEach((pos) => {
        if (!keyLabelMap[pos]) {
          keyLabelMap[pos] = [FN_SHIFT_KEY_LABEL];
        } else {
          keyLabelMap[pos].push(FN_SHIFT_KEY_LABEL);
        }
      });
    }
    if (addAltGraphLabel) {
      modifierKeyPositionCodeMap.altGraph.forEach((pos) => {
        if (!keyLabelMap[pos]) {
          keyLabelMap[pos] = [ALT_GRAPH_KEY_LABEL];
        } else {
          keyLabelMap[pos].push(ALT_GRAPH_KEY_LABEL);
        }
      });
    }
    return keyLabelMap;
  })();

  const highlightCharacterKeyCombinationMap = (() => {
    const highlightCharacterKeyMap: Record<string, HighlightKeyCombination> =
      {};
    charactersDevicePositionCodes.forEach((k) => {
      if (!k?.characterDeviceKeys || !modifierKeyPositionCodeMap) {
        return;
      }
      highlightCharacterKeyMap[k.c] =
        getHighlightKeyCombinationFromKeyCombinations(
          k.characterDeviceKeys,
          modifierKeyPositionCodeMap
        );
    });
    return highlightCharacterKeyMap;
  })();
  const highlightKeyCombination = getHighlightKeyCombinationFromText(
    nextText,
    highlightCharacterKeyCombinationMap
  );

  return (
    <div
      className={classNames(
        "p-2 bg-(--Keyboard-frame__color) rounded-lg font-(family-name:--default-font-family) h-full",
        {
          invisible: !nextText,
        }
      )}
    >
      <LayoutComponent
        showThumb3Switch={showThumb3Switch}
        keyLabelMap={keyLabelMap}
        highlightKeyCombination={highlightKeyCombination}
      />
    </div>
  );
}

export default LayoutContainerComponent;
