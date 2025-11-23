import { KeyBoardLayout } from "../model/keyboard-layout.model";
import { KEYBOARD_LAYOUTS_FROM_KBDLAYOUT } from "./keyboard-layouts-from-kbdlayout";
import { KEYBOARD_LAYOUTS_FROM_XKEYBOARD } from "./keyboard-layouts-from-xkeyboard";

export const KEYBOARD_LAYOUTS: KeyBoardLayout[] = [
  ...KEYBOARD_LAYOUTS_FROM_KBDLAYOUT,
  ...KEYBOARD_LAYOUTS_FROM_XKEYBOARD,
];
