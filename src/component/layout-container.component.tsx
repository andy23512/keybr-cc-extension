import { FC } from "react";
import {
  ALT_GRAPH_KEY_LABEL,
  FLAG_SHIFT_KEY_LABEL,
  FN_SHIFT_KEY_LABEL,
  HighlightKeyCombination,
  KeyLabel,
  KeyLabelType,
  KeyboardLayout,
  Layer,
  NUM_SHIFT_KEY_LABEL,
  SHIFT_KEY_LABEL,
  convertKeyboardLayoutToCharacterKeyCodeMap,
  getCharacterActionCodesFromCharacterKeyCode,
  getHighlightKeyCombinationFromKeyCombinations,
  getKeyCombinationsFromActionCodes,
  getModifierKeyPositionCodeMap,
  nonNullable,
} from "tangent-cc-lib";
import { HIGHLIGHT_SETTING } from "../const/highlight-setting.const";
import {
  CC1_DEFAULT_DEVICE_LAYOUT,
  M4G_DEFAULT_DEVICE_LAYOUT,
} from "../data/device-layouts";
import { KEYBOARD_LAYOUTS } from "../data/keyboard-layouts";
import { useSettingsStore } from "../store/settings-store";
import { getHighlightKeyCombinationFromText } from "../util/layout.util";
import LayoutComponent from "./layout.component";

interface LayoutContainerProps {
  nextText: string | null;
}

const LayoutContainerComponent: FC<LayoutContainerProps> = ({ nextText }) => {
  const layout = useSettingsStore.use.layout();
  const customDeviceLayouts = useSettingsStore.use.customDeviceLayouts();
  const selectedKeyboardLayoutId =
    useSettingsStore.use.selectedKeyboardLayoutId();
  const showThumb3Switch = useSettingsStore.use.showThumb3Switch();

  const deviceLayout =
    [
      M4G_DEFAULT_DEVICE_LAYOUT,
      CC1_DEFAULT_DEVICE_LAYOUT,
      ...customDeviceLayouts,
    ].find((deviceLayout) => deviceLayout.id === layout) ||
    CC1_DEFAULT_DEVICE_LAYOUT;
  const selectedKeyboardLayout = KEYBOARD_LAYOUTS.find(
    (k) => k.id === selectedKeyboardLayoutId,
  ) as KeyboardLayout;

  const characterKeyCodeMap = convertKeyboardLayoutToCharacterKeyCodeMap(
    selectedKeyboardLayout,
  );
  const charactersDevicePositionCodes = [...characterKeyCodeMap.keys()]
    .map((c) => {
      const characterKeyCode = characterKeyCodeMap.get(c);
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
          deviceLayout,
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
    let addFlagShiftLabel = false;
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
          if (layer === Layer.Quaternary && !addFlagShiftLabel) {
            addFlagShiftLabel = true;
          }
          if (altGraphKey && !addAltGraphLabel) {
            addAltGraphLabel = true;
          }
        },
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
    if (addFlagShiftLabel) {
      modifierKeyPositionCodeMap.flagShift.forEach((pos) => {
        if (!keyLabelMap[pos]) {
          keyLabelMap[pos] = [FLAG_SHIFT_KEY_LABEL];
        } else {
          keyLabelMap[pos].push(FLAG_SHIFT_KEY_LABEL);
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
          modifierKeyPositionCodeMap,
          HIGHLIGHT_SETTING,
        );
    });
    return highlightCharacterKeyMap;
  })();
  const highlightKeyCombination = getHighlightKeyCombinationFromText(
    nextText,
    highlightCharacterKeyCombinationMap,
  );

  return (
    <div className="bg-(--Keyboard-frame__color) rounded-lg font-(family-name:--default-font-family) h-full outline-8 outline-offset-0 outline-(--Keyboard-frame__color)">
      <LayoutComponent
        showThumb3Switch={showThumb3Switch}
        keyLabelMap={keyLabelMap}
        highlightKeyCombination={highlightKeyCombination}
      />
    </div>
  );
};

export default LayoutContainerComponent;
