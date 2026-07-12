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

export const useSettingsStore = createSelectors(
  create(
    persist<SettingsState>(
      (set, get) => ({
        ...defaultSettings,
        set: <K extends keyof Settings>(key: K, value: Settings[K]) =>
          set({ [key]: value }),
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
withLocalSettingStorageEvents(useSettingsStore);
