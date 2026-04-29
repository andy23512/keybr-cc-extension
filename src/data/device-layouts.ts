import {
  CC1_CC2_LEFT_HAND_ONLY_DEVICE_LAYOUT,
  CC1_CC2_RIGHT_HAND_ONLY_DEVICE_LAYOUT,
  DEFAULT_DEVICE_LAYOUT as CC1_DEFAULT_DEVICE_LAYOUT_FROM_LIB,
  DeviceLayout,
  M4G_DEFAULT_DEVICE_LAYOUT as M4G_DEFAULT_DEVICE_LAYOUT_FROM_LIB,
} from "tangent-cc-lib";

export const CC1_DEFAULT_DEVICE_LAYOUT: DeviceLayout = {
  ...CC1_DEFAULT_DEVICE_LAYOUT_FROM_LIB,
  id: "cc1",
  name: "CC1/CC2/CCU Default",
};

export const M4G_DEFAULT_DEVICE_LAYOUT: DeviceLayout = {
  ...M4G_DEFAULT_DEVICE_LAYOUT_FROM_LIB,
  id: "m4g",
  name: "M4G Default",
};

export const CC1_LEFT_HAND_ONLY_DEVICE_LAYOUT: DeviceLayout = {
  ...CC1_CC2_LEFT_HAND_ONLY_DEVICE_LAYOUT,
  id: "cc1-left-hand-only",
  name: "CC1/CC2/CCU Left Hand Only",
};

export const CC1_RIGHT_HAND_ONLY_DEVICE_LAYOUT: DeviceLayout = {
  ...CC1_CC2_RIGHT_HAND_ONLY_DEVICE_LAYOUT,
  id: "cc1-right-hand-only",
  name: "CC1/CC2/CCU Right Hand Only",
};
