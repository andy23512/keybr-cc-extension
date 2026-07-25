import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.mjs$/,
  // Each suite drives a headed browser through one shared persistent context,
  // so they cannot run in parallel with each other.
  workers: 1,
  fullyParallel: false,
  reporter: [["list"]],
  timeout: 60000,
});
