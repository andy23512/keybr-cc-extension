import { ICONS } from "cc-extension-core";
import { subset } from "@web-alchemy/fonttools";
import type { Font } from "fontkit";
import { openSync as fontkitOpenSync } from "fontkit";
import { readFileSync, writeFileSync } from "fs";

const SOURCE_FONT = "./src/asset/material-symbols-rounded-latin-full-normal.woff2";
const OUTPUT_FONT = "./public/material-symbols-rounded-latin-full-normal.min.woff2";

(async () => {
  const font = fontkitOpenSync(SOURCE_FONT) as Font;

  // a-z and 0-9, so ligature lookup still works for the icon names themselves.
  const glyphs = ["5f-7a", "30-39"];

  for (const icon of ICONS) {
    const iconGlyphs = font.layout(icon).glyphs;
    if (iconGlyphs.length === 0) {
      console.error(`${icon} not found in font.`);
      process.exit(-1);
    }
    const codePoints = iconGlyphs
      .flatMap((it) => font.stringsForGlyph(it.id))
      .flatMap((it) => [...it])
      .map((it) => it.codePointAt(0)?.toString(16) as string);

    glyphs.push(...codePoints);
  }

  glyphs.sort();

  const inputFileBuffer = readFileSync(SOURCE_FONT);
  const outputFileBuffer = await subset(inputFileBuffer, {
    unicodes: glyphs.join(","),
    "no-layout-closure": true,
    flavor: "woff2",
  });
  writeFileSync(OUTPUT_FONT, outputFileBuffer);
  console.log(`Subset ${ICONS.length} icons into ${OUTPUT_FONT}.`);
})();
