import { Tuple } from "./tuple.type";

/**
 * Shape of CharaChorder 3D device layout data. 90 keys x 3 layers = 180 action codes
 */
export interface DeviceLayout {
  id: string;
  name: string;
  layout: Tuple<Tuple<number, 90>, 3>;
}

export enum Layer {
  Primary = "A1",
  Secondary = "A2" /* Numeric */,
  Tertiary = "A3" /* Functional */,
}

/*
 * A key combination on CharaChorder 3D input devices
 */
export interface KeyCombination {
  characterKeyPositionCode: number;
  layer: Layer;
  shiftKey: boolean;
  altGraphKey: boolean;
}

/*
 * A key combination on CharaChorder 3D input devices with position codes of all used keys and priority score
 */
export interface HighlightKeyCombination extends KeyCombination {
  positionCodes: number[];
  score: number;
}

export type RawKeyLabel = {
  type: KeyLabelType.String;
  c: string;
  title: string;
};

/*
 * Label of a physical key, which records the corresponding character when the key is triggered under certain layer and modifiers
 */
export type KeyLabel = RawKeyLabel & {
  layer: Layer | null;
  shiftKey: boolean | null;
  altGraphKey: boolean | null;
};

export enum KeyLabelType {
  String = "string",
  Icon = "icon",
  Logo = "logo",
  ActionCode = "action-code",
}
