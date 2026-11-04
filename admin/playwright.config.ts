import { defineConfig, devices } from '@playwright/test';

// The app is built against a relative API base and every /api/v1 call is stubbed per test.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4176', trace: 'retain-on-failure' },
  webServer: {
    command:
      'pnpm exec vite build --mode e2e && node node_modules/vite/bin/vite.js preview --port 4176 --strictPort',
    port: 4176,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});
