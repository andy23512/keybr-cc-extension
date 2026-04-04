import { HighlightKeyCombination } from "tangent-cc-lib";

export function getHighlightKeyCombinationFromText(
  text: string | null,
  highlightCharacterKeyCombinationMap: Record<string, HighlightKeyCombination>,
): HighlightKeyCombination | null {
  if (text === null) {
    return null;
  }
  const normalizedText = normalizeText(text);
  const candidates = Object.entries(highlightCharacterKeyCombinationMap).filter(
    ([c]) => normalizedText.startsWith(normalizeText(c)),
  );
  if (candidates.length === 0) {
    return null;
  }
  candidates.sort(([ac], [bc]) => bc.length - ac.length);
  return candidates[0][1] ?? null;
}

export function normalizeText(text: string) {
  return text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
}
