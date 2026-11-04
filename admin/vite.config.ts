import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  plugins: [react()],
  // The Markdown renderer is shared with the Worker (server/src/markdown.ts), so the preview is
  // exactly what is sent.
  server: { fs: { allow: [repoRoot] } },
  build: { target: 'es2022', sourcemap: false },
});
