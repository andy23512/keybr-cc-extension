import classNames from "classnames";
import { useEffect, useState } from "react";
import Draggable from "react-draggable";
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
import { US_QWERTY_LAYOUT } from "../data/keyboard-layouts";
import {
  HighlightKeyCombination,
  KeyLabel,
  KeyLabelType,
  Layer,
} from "../model/device-layout.model";
import { Layout } from "../model/layout.model";
import {
  convertKeyboardLayoutToCharacterKeyCodeMap,
  getCharacterActionCodesFromCharacterKeyCode,
  getCharacterKeyCodeFromCharacter,
  getHighlightKeyCombinationFromKeyCombinations,
  getKeyCombinationsFromActionCodes,
  getModifierKeyPositionCodeMap,
} from "../util/layout.util";
import { nonNullable } from "../util/non-nullable.util";
import "./app.component.css";
import LayoutComponent from "./layout.component";

const CHARACTER_KEY_CODE_MAP =
  convertKeyboardLayoutToCharacterKeyCodeMap(US_QWERTY_LAYOUT);

function AppComponent() {
  const [layout, setLayout] = useState<Layout>("cc1");
  const [currentCharacter, setCurrentCharacter] = useState<string | null>(null);

  useEffect(() => {
    function getCurrentText() {
      const text = document.querySelector('div[dir="ltr"] span[class]');
      let nextCurrentCharacter = text ? text.textContent : null;
      if (nextCurrentCharacter === "") {
        nextCurrentCharacter = " ";
      }
      setCurrentCharacter(nextCurrentCharacter);
    }
    setInterval(getCurrentText, 100);
  });

  useEffect(() => {
    // Load initial value from storage
    chrome.storage.sync.get({ layout: "cc1" }, (items) => {
      setLayout(items.layout);
    });

    // Listen for changes in storage from other parts of the extension
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: chrome.storage.AreaName
    ) => {
      if (area === "sync" && changes.layout) {
        setLayout(changes.layout.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const deviceLayout =
    layout === "m4g" ? M4G_DEFAULT_DEVICE_LAYOUT : CC1_DEFAULT_DEVICE_LAYOUT;
  const charactersDevicePositionCodes = [...CHARACTER_KEY_CODE_MAP.keys()]
    .map((c) => {
      const characterKeyCode = getCharacterKeyCodeFromCharacter(
        c,
        CHARACTER_KEY_CODE_MAP
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
  const highlightKeyCombination = currentCharacter
    ? highlightCharacterKeyCombinationMap[currentCharacter]
    : null;

  return (
    <Draggable>
      <div
        className={classNames(
          "p-2 bg-(--Keyboard-frame__color) rounded-lg font-(family-name:--default-font-family) absolute bottom-[100px] left-1/2 -translate-x-1/2 cursor-move",
          {
            invisible: !currentCharacter,
          }
        )}
      >
        <LayoutComponent
          layout={layout}
          keyLabelMap={keyLabelMap}
          highlightKeyCombination={highlightKeyCombination}
        />
      </div>
    </Draggable>
  );
}

export default AppComponent;
