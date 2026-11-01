// Confirmed rows only -> signups-YYYY-MM-DD.csv (PLAN.md §6.4). Runs wrangler against the remote D1.
//   pnpm --filter server export:signups
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const sql =
  'SELECT email, role, consent_text_version, created_at, confirmed_at FROM signups WHERE confirmed_at IS NOT NULL ORDER BY confirmed_at';
const raw = execFileSync(
  'pnpm',
  [
    'exec',
    'wrangler',
    'd1',
    'execute',
    'press-start-signups',
    '--remote',
    '--json',
    '--command',
    sql,
  ],
  { encoding: 'utf8', shell: true },
);
const result = JSON.parse(raw) as Array<{ results: Array<Record<string, string | null>> }>;
const rows = result[0]?.results ?? [];
const cols = ['email', 'role', 'consent_text_version', 'created_at', 'confirmed_at'];
const csv = [
  cols.join(','),
  ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')),
].join('\n');
const file = `signups-${new Date().toISOString().slice(0, 10)}.csv`;
writeFileSync(file, csv + '\n');
console.log(`${rows.length} confirmed row(s) -> ${file}`);
