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
  getLayerShiftPositionCodeMap,
  getModifierKeyPositionCodeMap,
  nonNullable,
} from "tangent-cc-lib";
import { HIGHLIGHT_SETTING } from "../const/highlight-setting.const";
import {
  CC1_DEFAULT_DEVICE_LAYOUT,
  PRESET_DEVICE_LAYOUTS,
} from "../data/device-layouts";
import { KEYBOARD_LAYOUTS } from "../data/keyboard-layouts";
import { useSettingsStore } from "../store/settings-store";
import { getHighlightKeyCombinationFromText } from "../util/layout.util";
import CCLiteLayoutComponent from "./cclite-layout.component";
import LayoutComponent from "./layout.component";

interface LayoutContainerProps {
  nextText: string | null;
}

const LayoutContainerComponent: FC<LayoutContainerProps> = ({ nextText }) => {
  const layoutType = useSettingsStore.use.layoutType();
  const isLiteLayoutType = layoutType === "lite";
  const layout = isLiteLayoutType
    ? useSettingsStore.use.liteLayout()
    : useSettingsStore.use.layout();
  const customDeviceLayouts = isLiteLayoutType
    ? useSettingsStore.use.liteCustomDeviceLayouts()
    : useSettingsStore.use.customDeviceLayouts();
  const selectedKeyboardLayoutId =
    useSettingsStore.use.selectedKeyboardLayoutId();
  const showThumb3Switch = useSettingsStore.use.showThumb3Switch();
  const highlightKeysEnabled = useSettingsStore.use.highlightKeysEnabled();

  const deviceLayout =
    [...PRESET_DEVICE_LAYOUTS, ...customDeviceLayouts].find(
      (deviceLayout) => deviceLayout.id === layout,
    ) || CC1_DEFAULT_DEVICE_LAYOUT;
  const selectedKeyboardLayout = KEYBOARD_LAYOUTS.find(
    (k) => k.id === selectedKeyboardLayoutId,
  ) as KeyboardLayout;

  const characterKeyCodeMap = convertKeyboardLayoutToCharacterKeyCodeMap(
    selectedKeyboardLayout,
  );
  const charactersDevicePositionCodes = [...characterKeyCodeMap.keys()]
    .map((c) => {
      const characterKeyCodes = characterKeyCodeMap.get(c);
      if (!characterKeyCodes || characterKeyCodes.length === 0) {
        return null;
      }
      for (const characterKeyCode of characterKeyCodes) {
        const actionCodes =
          getCharacterActionCodesFromCharacterKeyCode(characterKeyCode);
        if (actionCodes.length === 0) {
          continue;
        }
        const keyCombinations = getKeyCombinationsFromActionCodes(
          actionCodes,
          deviceLayout,
        );
        if (!keyCombinations || keyCombinations.length === 0) {
          continue;
        }
        return {
          c,
          characterDeviceKeys: keyCombinations,
        };
      }
      return null;
    })
    .filter(nonNullable);
  const modifierKeyPositionCodeMap =
    getModifierKeyPositionCodeMap(deviceLayout);
  const layerShiftKeyPositionCodeMap =
    getLayerShiftPositionCodeMap(deviceLayout);
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
      Object.entries(modifierKeyPositionCodeMap.shift).forEach(
        ([layer, positions]) => {
          const keyLabel = {
            ...SHIFT_KEY_LABEL,
            layer: layer as Layer,
            shiftKey: null,
            altGraphKey: null,
          };
          positions.forEach((pos) => {
            if (!keyLabelMap[pos]) {
              keyLabelMap[pos] = [keyLabel];
            } else {
              keyLabelMap[pos].push(keyLabel);
            }
          });
        },
      );
    }
    if (addNumShiftLabel) {
      layerShiftKeyPositionCodeMap.numShift.forEach((pos) => {
        if (!keyLabelMap[pos]) {
          keyLabelMap[pos] = [NUM_SHIFT_KEY_LABEL];
        } else {
          keyLabelMap[pos].push(NUM_SHIFT_KEY_LABEL);
        }
      });
    }
    if (addFnShiftLabel) {
      layerShiftKeyPositionCodeMap.fnShift.forEach((pos) => {
        if (!keyLabelMap[pos]) {
          keyLabelMap[pos] = [FN_SHIFT_KEY_LABEL];
        } else {
          keyLabelMap[pos].push(FN_SHIFT_KEY_LABEL);
        }
      });
    }
    if (addFlagShiftLabel) {
      layerShiftKeyPositionCodeMap.flagShift.forEach((pos) => {
        if (!keyLabelMap[pos]) {
          keyLabelMap[pos] = [FLAG_SHIFT_KEY_LABEL];
        } else {
          keyLabelMap[pos].push(FLAG_SHIFT_KEY_LABEL);
        }
      });
    }
    if (addAltGraphLabel) {
      Object.entries(modifierKeyPositionCodeMap.altGraph).forEach(
        ([layer, positions]) => {
          const keyLabel = {
            ...ALT_GRAPH_KEY_LABEL,
            layer: layer as Layer,
            shiftKey: null,
            altGraphKey: null,
          };
          positions.forEach((pos) => {
            if (!keyLabelMap[pos]) {
              keyLabelMap[pos] = [keyLabel];
            } else {
              keyLabelMap[pos].push(keyLabel);
            }
          });
        },
      );
    }
    return keyLabelMap;
  })();

  const highlightCharacterKeyCombinationMap = (() => {
    const highlightCharacterKeyMap: Record<string, HighlightKeyCombination> =
      {};
    charactersDevicePositionCodes.forEach((k) => {
      if (
        !k?.characterDeviceKeys ||
        !modifierKeyPositionCodeMap ||
        !layerShiftKeyPositionCodeMap
      ) {
        return;
      }
      highlightCharacterKeyMap[k.c] =
        getHighlightKeyCombinationFromKeyCombinations(
          k.characterDeviceKeys,
          layerShiftKeyPositionCodeMap,
          modifierKeyPositionCodeMap,
          HIGHLIGHT_SETTING,
          layoutType,
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
      {isLiteLayoutType ? (
        <CCLiteLayoutComponent
          keyLabelMap={keyLabelMap}
          highlightKeyCombination={highlightKeyCombination}
          highlightOpacity={highlightKeysEnabled ? 0.5 : 0}
        />
      ) : (
        <LayoutComponent
          showThumb3Switch={showThumb3Switch}
          keyLabelMap={keyLabelMap}
          highlightKeyCombination={highlightKeyCombination}
          highlightOpacity={highlightKeysEnabled ? 0.5 : 0}
        />
      )}
    </div>
  );
};

export default LayoutContainerComponent;
