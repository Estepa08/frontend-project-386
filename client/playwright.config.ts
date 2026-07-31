import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "npx tsx src/index.ts",
      port: 3001,
      reuseExistingServer: true,
      cwd: "../server",
      timeout: 60_000,
    },
    {
      command: "vite build && vite preview --port 4173",
      port: 4173,
      reuseExistingServer: true,
      cwd: ".",
      timeout: 120_000,
    },
  ],
});
