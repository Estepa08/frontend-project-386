import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: 2,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "VITE_USE_MOCK=true vite dev --port 4173",
    port: 4173,
    reuseExistingServer: false,
    cwd: ".",
  },
});
