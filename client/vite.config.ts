import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { imagetools } from 'vite-imagetools';
import { assertClientEnv } from './scripts/env-check';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  // .env.<mode> + .env.<mode>.local + the process environment. A missing public value fails the build
  // here (strict in staging and production, lenient in development and e2e): scripts/env-check.ts.
  const env = loadEnv(mode, root, 'VITE_');
  assertClientEnv(mode, env);
  return {
    base: env.VITE_BASE || '/',
    plugins: [react(), imagetools()],
    server: {
      fs: { allow: [repoRoot] },
    },
    css: {
      modules: { localsConvention: 'camelCaseOnly' },
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      // scripts/prerender.ts reads it to link each page's area chunk (and deletes it afterwards).
      manifest: true,
    },
    ssr: {
      noExternal: mode !== 'development' ? [/@fontsource/] : [],
    },
    test: {
      include: ['tests/unit/**/*.test.ts'],
      environment: 'node',
    },
  };
});
