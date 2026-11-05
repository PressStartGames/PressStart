import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { assertAdminEnv } from './env-check';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const root = fileURLToPath(new URL('.', import.meta.url));

// public/_headers carries the production API origin in its CSP connect-src; a staging build swaps in
// its own API origin so each environment's console may talk to its own API only.
function cspApiOrigin(apiBase: string | undefined): Plugin {
  return {
    name: 'csp-api-origin',
    apply: 'build',
    closeBundle() {
      if (!apiBase || apiBase.startsWith('/')) return;
      const file = fileURLToPath(new URL('./dist/_headers', import.meta.url));
      try {
        const text = readFileSync(file, 'utf8');
        writeFileSync(file, text.replace('https://pressstartgames.net', new URL(apiBase).origin));
      } catch {
        // an out-of-tree outDir (e2e) has no _headers to rewrite
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  // .env.<mode> + process env; a missing value fails the build (strict in staging and production).
  const env = loadEnv(mode, root, 'VITE_');
  assertAdminEnv(mode, env);
  return {
    plugins: [react(), cspApiOrigin(env.VITE_API_BASE)],
    // The Markdown renderer is shared with the Worker (server/src/markdown.ts), so the preview is
    // exactly what is sent.
    server: { fs: { allow: [repoRoot] } },
    build: { target: 'es2022', sourcemap: false },
  };
});
