// `pnpm --filter client build [-- --mode staging|production]` (default production): the client build,
// the SSR bundle and the prerender, all in the same Vite mode so they read the same .env.<mode>.
import { execFileSync } from 'node:child_process';

const i = process.argv.indexOf('--mode');
const mode = i > 0 ? process.argv[i + 1] : 'production';
if (!mode) throw new Error('--mode needs a value (staging or production)');
const env = { ...process.env, PS_MODE: mode };
const run = (args: string[]) =>
  execFileSync('pnpm', ['exec', ...args], { env, stdio: 'inherit', shell: true });

run(['vite', 'build', '--mode', mode]);
run(['vite', 'build', '--ssr', 'src/entry-server.tsx', '--outDir', 'dist-ssr', '--mode', mode]);
run(['tsx', 'scripts/prerender.ts']);
