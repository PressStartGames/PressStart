// Reads a local checkout of the engine repository (read-only: no file is written there, no cargo runs) and
// writes client/data/counts.json. The derivations mirror the press-start-website skill's table.
//   pnpm --filter client sync-facts -- C:/Yanivs/GameDev/PressStart
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const engine = process.argv[2];
if (!engine) {
  console.error('usage: sync-engine-facts <path to the engine checkout>');
  process.exit(2);
}
const root = resolve(engine);

const STATES = ['BUILT', 'PARTIAL', 'SKIP', 'CRATE-EXISTS-UNJUDGED', 'UNDETERMINED'] as const;
type State = (typeof STATES)[number];

function catalogStates(): Record<State, number> {
  const dir = join(root, 'docs', 'catalog');
  const counts = Object.fromEntries(STATES.map((s) => [s, 0])) as Record<State, number>;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      const m = /^- state:\s*([A-Z-]+)/.exec(line);
      if (!m) continue;
      const state = m[1] as State;
      if (state in counts) counts[state] += 1;
    }
  }
  return counts;
}

function walkPngs(dir: string, out: { accepted: number; candidates: number }) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'target' || entry === 'node_modules' || entry.startsWith('.')) continue;
      walkPngs(p, out);
    } else if (entry.endsWith('.png') && p.includes('goldens')) {
      if (entry.endsWith('.candidate.png')) out.candidates += 1;
      else out.accepted += 1;
    }
  }
}

const states = catalogStates();
const crates = readdirSync(join(root, 'crates')).filter((n) => n.includes('press_start')).length;
const oracles = readdirSync(join(root, 'oracles')).filter((n) =>
  statSync(join(root, 'oracles', n)).isDirectory(),
).length;
const goldens = { accepted: 0, candidates: 0 };
walkPngs(join(root, 'crates'), goldens);
const git = (...args: string[]) =>
  execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
const engineCommit = git('rev-parse', 'HEAD');
const engineBranch = git('branch', '--show-current');

const total = STATES.reduce((n, s) => n + states[s], 0);
const counts = {
  syncedAt: new Date().toISOString().slice(0, 10),
  engineCommit,
  engineBranch,
  catalog: {
    total,
    built: states.BUILT,
    partial: states.PARTIAL,
    skip: states.SKIP,
    unjudged: states['CRATE-EXISTS-UNJUDGED'],
    undetermined: states.UNDETERMINED,
  },
  crates,
  oracles,
  goldens,
};

const out = resolve(fileURLToPath(new URL('../data/counts.json', import.meta.url)));
writeFileSync(out, JSON.stringify(counts, null, 2) + '\n');
console.log(`wrote ${out} from ${engineBranch}@${engineCommit.slice(0, 7)}`);
console.log(JSON.stringify(counts, null, 2));
