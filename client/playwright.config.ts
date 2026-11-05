import { defineConfig, devices } from '@playwright/test';

// Three builds of the site, one per sign-up mode (scripts/build-e2e.ts), each served by `vite preview`.
// E2E_PORT_BASE lets several worktrees run the suite at once without sharing a server.
const base = Number(process.env.E2E_PORT_BASE ?? 4173);
const servers = [
  { name: 'stub', port: base },
  { name: 'none', port: base + 1 },
  { name: 'fallback', port: base + 2 },
];

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { trace: 'retain-on-failure' },
  webServer: servers.map((s) => ({
    command: `pnpm exec vite preview --outDir dist-e2e/${s.name} --port ${s.port} --strictPort`,
    port: s.port,
    reuseExistingServer: false,
    timeout: 60_000,
  })),
  projects: [
    {
      name: 'stub',
      testMatch: /(home|signup-stub|motion|site|analytics)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${base}` },
    },
    {
      name: 'stub-mobile-reduced-motion',
      testMatch: /(home|signup-stub|site)\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
        baseURL: `http://localhost:${base}`,
        contextOptions: { reducedMotion: 'reduce' },
      },
    },
    {
      name: 'mobile-pixel',
      testMatch: /mobile.spec.ts/,
      use: { ...devices['Pixel 7'], baseURL: `http://localhost:${base}` },
    },
    {
      name: 'mobile-iphone',
      testMatch: /mobile.spec.ts/,
      use: {
        ...devices['iPhone 14'],
        browserName: 'chromium',
        baseURL: `http://localhost:${base}`,
      },
    },
    {
      name: 'none',
      testMatch: /signup-none\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${base + 1}` },
    },
    {
      name: 'fallback',
      testMatch: /signup-fallback\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${base + 2}` },
    },
  ],
});
