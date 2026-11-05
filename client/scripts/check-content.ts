// CI gate: CONTENT.md and src/content/schema.ts agree (every section the code renders exists with its
// fields, and every section in CONTENT.md is rendered), every placeholder resolves against
// data/counts.json, and no builder note or raw placeholder survives into the copy.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fillPlaceholders, parseContent } from '../src/content/parse.ts';
import { CONTENT_SCHEMA } from '../src/content/schema.ts';

const md = readFileSync(fileURLToPath(new URL('../../CONTENT.md', import.meta.url)), 'utf8');
const counts = JSON.parse(
  readFileSync(fileURLToPath(new URL('../data/counts.json', import.meta.url)), 'utf8'),
) as unknown;

const errors: string[] = [];
const BANNED = /bevy|honest/i;
const INTERNAL =
  /licen[cs]e (wave|work|rewrite)|\bwaves?\b|rewrit|transcrib|restricted|repo(sitory)? split|\bLW-\d/i;
let content;
try {
  content = fillPlaceholders(parseContent(md), counts);
} catch (e) {
  console.error(String(e));
  process.exit(1);
}

for (const [id, keys] of Object.entries(CONTENT_SCHEMA)) {
  const s = content[id];
  if (!s) {
    errors.push(`CONTENT.md is missing section "${id}"`);
    continue;
  }
  for (const k of keys) {
    if (!(k in s.fields)) errors.push(`section "${id}" is missing field "${k}"`);
  }
}
for (const id of Object.keys(content)) {
  if (!(id in CONTENT_SCHEMA))
    errors.push(`section "${id}" is in CONTENT.md but no code renders it`);
}
for (const s of Object.values(content)) {
  for (const b of s.blocks) {
    const texts =
      b.type === 'p' ? [b.text] : b.type === 'ol' ? b.items : b.type === 'field' ? [b.value] : [];
    for (const t of texts) {
      if (t.includes('{{')) errors.push(`section "${s.id}" keeps a raw placeholder: ${t}`);
      if (/\*\(/.test(t)) errors.push(`section "${s.id}" keeps a builder note: ${t}`);
      if (/unity for ai/i.test(t)) errors.push(`section "${s.id}" uses the internal line`);
    }
    // Founder, 2026-11-05: the site never names Bevy and never says "honest"/"honestly".
    const words = BANNED.exec(JSON.stringify(b));
    if (words) errors.push(`section "${s.id}" uses the banned word "${words[0]}"`);
    // Founder, 2026-11-05: the road is direction only (now beta, next version 1, then 1.x). Internal work in
    // progress (the licence work, waves, the repository split, rewrites) is never on the site.
    const internal = INTERNAL.exec(JSON.stringify(b));
    if (internal) errors.push(`section "${s.id}" names internal work: "${internal[0]}"`);
  }
}

// The same rule for words that live in code (meta, alt text, aria labels): comments are skipped.
const srcDir = fileURLToPath(new URL('../src', import.meta.url));
for (const entry of readdirSync(srcDir, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !/\.(tsx?|css|html)$/.test(entry.name)) continue;
  const file = join(entry.parentPath, entry.name);
  // renders.ts strips the engine-internal crate suffix, so it must spell it.
  if (file.replace(/\\/g, '/').endsWith('lib/renders.ts')) continue;
  const code = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  const hit = BANNED.exec(code);
  if (hit) errors.push(`${file} uses the banned word "${hit[0]}"`);
}

if (errors.length) {
  for (const e of errors) console.error('✗ ' + e);
  process.exit(1);
}
console.log(`✓ CONTENT.md: ${Object.keys(content).length} sections, all placeholders resolved`);
