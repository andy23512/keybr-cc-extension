import { DeviceLayout, LayoutType } from "tangent-cc-lib";
import browser, { Storage } from "webextension-polyfill";
import { create, Mutate, StoreApi } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import { createSelectors } from "./create-selectors";

interface Settings {
  layoutType: LayoutType;
  layout: string;
  customDeviceLayouts: DeviceLayout[];
  showThumb3Switch: boolean;
  selectedKeyboardLayoutId: string;
  height: number;
  xPosition: number;
  yPosition: number;
  opacity: number;
  highlightKeysEnabled: boolean;

  liteLayout: string;
  liteCustomDeviceLayouts: DeviceLayout[];
  liteHeight: number;
  liteXPosition: number;
  liteYPosition: number;
  liteOpacity: number;
}

interface SettingsState extends Settings {
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetLayoutDisplay: () => void;
}

type LayoutDependentSettingKey = keyof typeof liteSettingKeyMap;

const defaultSettings: Settings = {
  layoutType: "3d",
  layout: "cc1",
  customDeviceLayouts: [],
  showThumb3Switch: true,
  selectedKeyboardLayoutId: "us",
  height: 250,
  xPosition: 0.5,
  yPosition: 1,
  opacity: 1,
  highlightKeysEnabled: true,
  liteLayout: "cclite",
  liteCustomDeviceLayouts: [],
  liteHeight: 250,
  liteXPosition: 0.5,
  liteYPosition: 1,
  liteOpacity: 1,
};

const liteSettingKeyMap: Partial<Record<keyof Settings, keyof Settings>> = {
  layout: "liteLayout",
  customDeviceLayouts: "liteCustomDeviceLayouts",
  height: "liteHeight",
  xPosition: "liteXPosition",
  yPosition: "liteYPosition",
  opacity: "liteOpacity",
};

const browserLocalSettingsStorage: PersistStorage<SettingsState> = {
  getItem: async (_: string): Promise<StorageValue<SettingsState>> => {
    const value = await browser.storage.local.get({
      ...defaultSettings,
    });
    return { version: 0, state: value as unknown as SettingsState };
  },
  setItem: async (_: string, value: StorageValue<Settings>): Promise<void> =>
    browser.storage.local.set({ ...value.state }),
  removeItem: async (name: string): Promise<void> =>
    browser.storage.local.remove(name),
};

type StoreWithPersist = Mutate<
  StoreApi<SettingsState>,
  [["zustand/persist", SettingsState]]
>;

const withLocalSettingStorageEvents = (store: StoreWithPersist) => {
  const listener = (_: Record<string, Storage.StorageChange>, area: string) => {
    if (area === "local") {
      store.persist.rehydrate();
    }
  };
  browser.storage.onChanged.addListener(listener);
  return () => {
    browser.storage.onChanged.removeListener(listener);
  };
};

const selectLayoutDependentSetting =
  <K extends LayoutDependentSettingKey>(key: K) =>
  (state: SettingsState): Settings[K] => {
    const liteKey = liteSettingKeyMap[key];
    if (state.layoutType === "lite" && liteKey) {
      return state[liteKey] as unknown as Settings[K];
    }
    return state[key];
  };

const baseSettingsStore = createSelectors(
  create(
    persist<SettingsState>(
      (set, get) => ({
        ...defaultSettings,
        set: <K extends keyof Settings>(key: K, value: Settings[K]) =>
          set((state) => {
            if (state.layoutType === "lite") {
              const liteKey = liteSettingKeyMap[key];
              if (liteKey) {
                return { [liteKey]: value } as Partial<SettingsState>;
              }
            }
            return { [key]: value } as Pick<Settings, K>;
          }),
        resetLayoutDisplay: () =>
          set(
            get().layoutType === "3d"
              ? {
                  height: defaultSettings.height,
                  xPosition: defaultSettings.xPosition,
                  yPosition: defaultSettings.yPosition,
                  opacity: defaultSettings.opacity,
                }
              : {
                  liteHeight: defaultSettings.liteHeight,
                  liteXPosition: defaultSettings.liteXPosition,
                  liteYPosition: defaultSettings.liteYPosition,
                  liteOpacity: defaultSettings.liteOpacity,
                },
          ),
      }),
      {
        name: "settings",
        storage: browserLocalSettingsStorage,
        partialize: (state) =>
          Object.fromEntries(
            Object.entries(state).filter(
              ([_, value]) => typeof value !== "function",
            ),
          ) as SettingsState,
      },
    ),
  ),
);

export const useSettingsStore = Object.assign(baseSettingsStore, {
  use: {
    ...baseSettingsStore.use,
    currentLayout: () =>
      baseSettingsStore(selectLayoutDependentSetting("layout")),
    currentCustomDeviceLayouts: () =>
      baseSettingsStore(selectLayoutDependentSetting("customDeviceLayouts")),
    currentHeight: () =>
      baseSettingsStore(selectLayoutDependentSetting("height")),
    currentXPosition: () =>
      baseSettingsStore(selectLayoutDependentSetting("xPosition")),
    currentYPosition: () =>
      baseSettingsStore(selectLayoutDependentSetting("yPosition")),
    currentOpacity: () =>
      baseSettingsStore(selectLayoutDependentSetting("opacity")),
  },
});

withLocalSettingStorageEvents(useSettingsStore);
