export type Layout = "cc1" | "m4g";
export type DirectionMap<T> = Record<"n" | "e" | "s" | "w" | "c", T>;
export type FingerMap<T> = Record<
  | "thumbEnd"
  | "thumbMid"
  | "thumbTip"
  | "index"
  | "middle"
  | "middleMid"
  | "ring"
  | "ringMid"
  | "little",
  T
>;
export type HandMap<T> = Record<"left" | "right", T>;

export type FullLayout<T> = HandMap<FingerMap<DirectionMap<T>>>;
