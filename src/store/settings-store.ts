import browser, { Storage } from "webextension-polyfill";
import { create, Mutate, StoreApi } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import { DeviceLayout } from "../model/device-layout.model";
import { createSelectors } from "./create-selectors";

interface Settings {
  layout: string;
  customDeviceLayouts: DeviceLayout[];
  showThumb3Switch: boolean;
  selectedKeyboardLayoutId: string;
}

interface SettingsState extends Settings {
  setLayout: (layout: Settings["layout"]) => void;
  setCustomDeviceLayouts: (
    customDeviceLayouts: Settings["customDeviceLayouts"]
  ) => void;
  setShowThumb3Switch: (showThumb3Switch: Settings["showThumb3Switch"]) => void;
  setSelectedKeyboardLayoutId: (
    selectedKeyboardLayoutId: Settings["selectedKeyboardLayoutId"]
  ) => void;
}

const defaultSettings: Settings = {
  layout: "cc1",
  customDeviceLayouts: [],
  showThumb3Switch: true,
  selectedKeyboardLayoutId: "us",
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
      (set) => ({
        ...defaultSettings,
        setLayout: (layout: Settings["layout"]) => set({ layout }),
        setCustomDeviceLayouts: (
          customDeviceLayouts: Settings["customDeviceLayouts"]
        ) => set({ customDeviceLayouts }),
        setShowThumb3Switch: (showThumb3Switch: Settings["showThumb3Switch"]) =>
          set({ showThumb3Switch }),
        setSelectedKeyboardLayoutId: (
          selectedKeyboardLayoutId: Settings["selectedKeyboardLayoutId"]
        ) => set({ selectedKeyboardLayoutId }),
      }),
      {
        name: "settings",
        storage: browserLocalSettingsStorage,
      }
    )
  )
);
withLocalSettingStorageEvents(useSettingsStore);
