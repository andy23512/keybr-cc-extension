import {
  CELL_SIZE,
  GAP,
  VIEW_BOX_WIDTH,
} from "../const/layout-dimension.const";

export function getViewBoxHeight(showThumb3Switch: boolean) {
  const gridRows = showThumb3Switch ? 5 : 4;
  return CELL_SIZE * gridRows + GAP * (gridRows - 1);
}

export function getViewBoxAspectRatio(showThumb3Switch: boolean) {
  return VIEW_BOX_WIDTH / getViewBoxHeight(showThumb3Switch);
}
