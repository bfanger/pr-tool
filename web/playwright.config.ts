import type { PlaywrightTestConfig } from "@playwright/test";

const CI = !!process.env.CI;

const config: PlaywrightTestConfig = {
  testDir: "./playwright/tests",
  fullyParallel: true,
  forbidOnly: CI,
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    viewport: { width: 550, height: 500 },
  },
  webServer: {
    port: 5173,
    reuseExistingServer: true,
    command: `${
      process.platform === "darwin" ? "npm run build && " : ""
    } npm run preview -- --port 5173`,
  },
};

export default config;
