/**
 * Captures the live site into e2e/snapshot/ so the hermetic suite has a real,
 * deterministic page to replay.
 *
 * Re-run this when the canary suite starts failing — that is the signal the
 * site's markup moved and the snapshot has gone stale.
 *
 *   yarn e2e:record
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { SITE_URL, SNAPSHOT } from "./harness.mjs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(SITE_URL, { waitUntil: "networkidle", timeout: 60000 });
const html = await page.content();
await browser.close();

fs.mkdirSync(path.dirname(SNAPSHOT), { recursive: true });
fs.writeFileSync(SNAPSHOT, html);
console.log(`Recorded ${html.length} bytes of ${SITE_URL} to ${SNAPSHOT}`);
