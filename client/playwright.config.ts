import { defineConfig, devices } from '@playwright/test';

// Three builds of the site, one per sign-up mode (scripts/build-e2e.ts), each served by `vite preview`.
const servers = [
  { name: 'stub', port: 4173 },
  { name: 'none', port: 4174 },
  { name: 'fallback', port: 4175 },
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
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  })),
  projects: [
    {
      name: 'stub',
      testMatch: /(home|signup-stub)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4173' },
    },
    {
      name: 'stub-mobile-reduced-motion',
      testMatch: /(home|signup-stub)\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
        baseURL: 'http://localhost:4173',
        contextOptions: { reducedMotion: 'reduce' },
      },
    },
    {
      name: 'none',
      testMatch: /signup-none\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4174' },
    },
    {
      name: 'fallback',
      testMatch: /signup-fallback\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4175' },
    },
  ],
});
