const KEY_SIZE = 10;
const GAP = 1;
const KEYBOARD_WIDTH = 163;
const KEYBOARD_HEIGHT = 5 * KEY_SIZE + 4 * GAP;
export const LITE_ASPECT_RATIO = KEYBOARD_WIDTH / KEYBOARD_HEIGHT;
const ROW3_EQUAL_KEY_WIDTH = 128 / 13;

// CCLite switch matrix (row 0 = top, row 4 = bottom)
const CCLITE_SWITCH_MATRIX: number[][] = [
  [53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66], // row 0 (top, number row)
  [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52], // row 1 (QWERTY row)
  [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38], // row 2 (home row)
  [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], // row 3 (ZXCV row)
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // row 4 (bottom, space row)
];

// keyboardWidth = 163 (all rows sum to 163 including gaps)
// verified per row:
//   row 0: 13×10 + 12×1 + 21          = 163
//   row 1: 18 + 12×1 + 12×10 + 12     = 163
//   row 2: 19 + 12×1 + 11×10 + 22     = 163
//   row 3: 22 + 13×1 + 13×(128/13)    = 163
//   row 4: 9×10 + 11 + 24 + 27 + 11×1 = 163
const CCLITE_KEY_WIDTH_MAP: Partial<Record<number, number>> = {
  66: 21, // Backspace
  39: 18, // Tab
  52: 12, // Backslash
  26: 19, // CapsLock
  38: 22, // Enter
  12: 22, // ShiftLeft (wider)
  13: ROW3_EQUAL_KEY_WIDTH,
  14: ROW3_EQUAL_KEY_WIDTH,
  15: ROW3_EQUAL_KEY_WIDTH,
  16: ROW3_EQUAL_KEY_WIDTH,
  17: ROW3_EQUAL_KEY_WIDTH,
  18: ROW3_EQUAL_KEY_WIDTH,
  19: ROW3_EQUAL_KEY_WIDTH,
  20: ROW3_EQUAL_KEY_WIDTH,
  21: ROW3_EQUAL_KEY_WIDTH,
  22: ROW3_EQUAL_KEY_WIDTH,
  23: ROW3_EQUAL_KEY_WIDTH,
  24: ROW3_EQUAL_KEY_WIDTH,
  25: ROW3_EQUAL_KEY_WIDTH,
  3: 24, // Space 1 (left thumb cluster)
  6: 27, // Space 2 (right thumb cluster)
  11: 11, // ControlRight
};

function getAlignedRowWidths(row: number[]): number[] {
  if (row.length === 0) {
    return [];
  }

  const widths = row.map((positionCode) => {
    return CCLITE_KEY_WIDTH_MAP[positionCode] ?? KEY_SIZE;
  });
  const totalGap = (row.length - 1) * GAP;
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  const delta = KEYBOARD_WIDTH - (totalWidth + totalGap);

  // Apply residual width to the last key so every row ends at KEYBOARD_WIDTH.
  widths[widths.length - 1] += delta;
  return widths;
}

export function generateCCLiteKeyboard() {
  const keys: Array<{
    positionCode: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }> = [];

  let y = 0;
  for (const row of CCLITE_SWITCH_MATRIX) {
    const rowWidths = getAlignedRowWidths(row);
    let x = 0;
    row.forEach((positionCode, index) => {
      const width = rowWidths[index];
      keys.push({ positionCode, x, y, width, height: KEY_SIZE });
      x += width + GAP;
    });
    y += KEY_SIZE + GAP;
  }

  return { width: KEYBOARD_WIDTH, height: KEYBOARD_HEIGHT, keys };
}
