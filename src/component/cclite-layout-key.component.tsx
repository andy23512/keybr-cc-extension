import { HighlightKeyCombination, KeyLabel } from "tangent-cc-lib";
import KeyLabelComponent from "./key-label.component";

interface CCLiteLayoutKeyComponentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  positionCode: number;
  keyLabel: KeyLabel[];
  highlightKeyCombination: HighlightKeyCombination | null;
  highlightOpacity: number;
}

const STROKE_WIDTH = 0.1;
const FONT_SIZE = 8;

const CCLiteLayoutKeyComponent: React.FC<CCLiteLayoutKeyComponentProps> = ({
  x,
  y,
  width,
  height,
  positionCode,
  keyLabel,
  highlightKeyCombination,
  highlightOpacity,
}) => {
  const isHighlighted =
    highlightKeyCombination?.positionCodes.includes(positionCode) ?? false;
  return (
    <>
      <rect
        className="fill-(--KeyboardKey-button__color) stroke-(--KeyboardKey-symbol__color)"
        strokeWidth={STROKE_WIDTH}
        x={x}
        y={y}
        width={width}
        height={height}
        rx="1"
      ></rect>
      <rect
        className="fill-(--KeyboardKey-pointer__color)"
        strokeWidth={STROKE_WIDTH}
        x={x}
        y={y}
        width={width}
        height={height}
        opacity={isHighlighted ? highlightOpacity : 0}
        rx="1"
      ></rect>
      <rect
        className="fill-(--KeyboardKey-symbol__color)"
        x={x + width * 0.365}
        y={y + height * 0.8}
        width={width * 0.27}
        height={height * 0.055}
        rx={height * 0.028}
        opacity={[30, 33].includes(positionCode) ? 0.45 : 0}
      ></rect>
      <KeyLabelComponent
        x={x + width / 2}
        y={y + height / 2}
        fontSize={FONT_SIZE}
        highlightKeyCombination={highlightKeyCombination}
        labels={keyLabel}
      ></KeyLabelComponent>
    </>
  );
};

export default CCLiteLayoutKeyComponent;
