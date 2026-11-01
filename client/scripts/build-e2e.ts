// Builds the site once per sign-up mode into dist-e2e/<mode>, for the Playwright projects.
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const modes: Record<string, Record<string, string>> = {
  stub: { VITE_SIGNUP_ENDPOINT: 'stub', VITE_SIGNUP_FALLBACK_URL: '' },
  none: { VITE_SIGNUP_ENDPOINT: '', VITE_SIGNUP_FALLBACK_URL: '' },
  fallback: { VITE_SIGNUP_ENDPOINT: '', VITE_SIGNUP_FALLBACK_URL: 'https://example.com/form' },
};

rmSync('dist-e2e', { recursive: true, force: true });
for (const [mode, vars] of Object.entries(modes)) {
  const env = {
    ...process.env,
    ...vars,
    VITE_BASE: '/',
    DIST: `dist-e2e/${mode}`,
    SSR_DIST: `dist-e2e/${mode}-ssr`,
  };
  const run = (args: string[]) =>
    execFileSync('pnpm', ['exec', ...args], { env, stdio: 'inherit', shell: true });
  run(['vite', 'build', '--outDir', `dist-e2e/${mode}`]);
  run(['vite', 'build', '--ssr', 'src/entry-server.tsx', '--outDir', `dist-e2e/${mode}-ssr`]);
  run(['tsx', 'scripts/prerender.ts']);
}
