#!/usr/bin/env node
// Pushes the key file (PressStartWeb/.env.secrets.local, git-ignored) to where each key lives: the API Worker's
// secrets per environment and the GitHub environment secrets. It never prints a value.
//
//   node scripts/sync-secrets.mjs                     # the plan only (default): what would be set where
//   node scripts/sync-secrets.mjs --apply             # set everything that has a value
//   node scripts/sync-secrets.mjs --apply --only staging
//   node scripts/sync-secrets.mjs --apply --rotate-confirm-links   # also CONFIRM_LINK_SECRET (see below)
//   node scripts/sync-secrets.mjs --file C:/path/to/.env.secrets.local
//
// Public values (client ids, GA4 ids, GrowthBook client keys, the beacon token) are not secrets: they live in the
// committed config (server/wrangler.toml, client/.env.*, site-worker/wrangler.jsonc) and are only reported here.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const apply = flag('--apply');
const only = option('--only');
const rotateConfirm = flag('--rotate-confirm-links');
const repo = 'PressStartGames/PressStartWeb';

// The key file lives in the main checkout; worktrees point at it with --file.
const file = resolve(option('--file') ?? join(root, '.env.secrets.local'));
if (!existsSync(file)) {
  console.error(`No key file at ${file} (pass --file).`);
  process.exit(1);
}
const values = Object.fromEntries(
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
);

// variable in the key file -> [kind, secret name, environment]
const PLAN = [
  ['WORKOS_API_KEY_STAGING', 'worker', 'WORKOS_API_KEY', 'staging'],
  ['WORKOS_API_KEY_PRODUCTION', 'worker', 'WORKOS_API_KEY', 'production'],
  ['SESSION_SECRET_STAGING', 'worker', 'SESSION_SECRET', 'staging'],
  ['SESSION_SECRET_PRODUCTION', 'worker', 'SESSION_SECRET', 'production'],
  ['RESEND_API_KEY_STAGING', 'worker', 'RESEND_API_KEY', 'staging'],
  ['RESEND_API_KEY_PRODUCTION', 'worker', 'RESEND_API_KEY', 'production'],
  // Signs the confirm and unsubscribe links: a new value breaks every link in mails already sent.
  ['CONFIRM_LINK_SECRET_STAGING', 'worker', 'CONFIRM_LINK_SECRET', 'staging', 'confirm'],
  ['CONFIRM_LINK_SECRET_PRODUCTION', 'worker', 'CONFIRM_LINK_SECRET', 'production', 'confirm'],
  ['CLOUDFLARE_API_TOKEN', 'github', 'CLOUDFLARE_API_TOKEN', 'staging'],
  ['CLOUDFLARE_API_TOKEN', 'github', 'CLOUDFLARE_API_TOKEN', 'production'],
  ['CLOUDFLARE_ACCOUNT_ID', 'github', 'CLOUDFLARE_ACCOUNT_ID', 'staging'],
  ['CLOUDFLARE_ACCOUNT_ID', 'github', 'CLOUDFLARE_ACCOUNT_ID', 'production'],
];
const PUBLIC = [
  'WORKOS_CLIENT_ID_STAGING',
  'WORKOS_CLIENT_ID_PRODUCTION',
  'GA4_MEASUREMENT_ID_STAGING',
  'GA4_MEASUREMENT_ID_PRODUCTION',
  'CF_BEACON_TOKEN_STAGING',
  'GROWTHBOOK_CLIENT_KEY_STAGING',
  'GROWTHBOOK_CLIENT_KEY_PRODUCTION',
];

function put(kind, name, env, value) {
  const command =
    kind === 'worker'
      ? ['npx', ['wrangler', 'secret', 'put', name, '--env', env], join(root, 'server')]
      : ['gh', ['secret', 'set', name, '--env', env, '-R', repo], root];
  const [cmd, cmdArgs, cwd] = command;
  const r = spawnSync(cmd, cmdArgs, { cwd, input: value, encoding: 'utf8', shell: true });
  return r.status === 0 ? 'set' : `FAILED (${(r.stderr || r.stdout).trim().split('\n').pop()})`;
}

let failures = 0;
console.log(`${apply ? 'Applying' : 'Plan (nothing changes; add --apply)'} from ${file}\n`);
for (const [variable, kind, name, env, guard] of PLAN) {
  if (only && env !== only) continue;
  const where = `${kind === 'worker' ? 'Worker secret' : 'GitHub secret'} ${name} (${env})`;
  const value = values[variable];
  let outcome;
  if (!value) outcome = 'skipped: empty in the key file';
  else if (guard === 'confirm' && !rotateConfirm)
    outcome = 'skipped: breaks links in sent mails (add --rotate-confirm-links)';
  else if (!apply) outcome = 'would set';
  else outcome = put(kind, name, env, value);
  if (outcome.startsWith('FAILED')) failures += 1;
  console.log(`${variable.padEnd(32)} -> ${where.padEnd(48)} ${outcome}`);
}
console.log('\nPublic values (committed config, not pushed by this script):');
for (const variable of PUBLIC)
  console.log(`  ${variable.padEnd(32)} ${values[variable] ? 'present' : 'empty'}`);
process.exit(failures ? 1 : 0);
