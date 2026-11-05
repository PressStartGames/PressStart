import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE ?? '/',
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
    noExternal: mode === 'production' ? [/@fontsource/] : [],
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
}));
