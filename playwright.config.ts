import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  webServer: {
    command: "npx vite preview apps/spinlab --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: false,
  },
  use: { baseURL: "http://localhost:4173" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
