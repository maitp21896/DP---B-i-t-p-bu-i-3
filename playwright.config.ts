import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3000" },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: { executablePath: process.env.CHROMIUM_PATH },
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "webkit",
      use: { browserName: "webkit", viewport: { width: 1024, height: 900 } },
    },
  ],
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
  },
  reporter: "list",
});
