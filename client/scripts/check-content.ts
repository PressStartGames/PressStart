// CI gate: CONTENT.md and src/content/schema.ts agree (every section the code renders exists with its
// fields, and every section in CONTENT.md is rendered), every placeholder resolves against
// data/counts.json, and no builder note or raw placeholder survives into the copy.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fillPlaceholders, parseContent } from '../src/content/parse.ts';
import { CONTENT_SCHEMA } from '../src/content/schema.ts';

const md = readFileSync(fileURLToPath(new URL('../../CONTENT.md', import.meta.url)), 'utf8');
const counts = JSON.parse(
  readFileSync(fileURLToPath(new URL('../data/counts.json', import.meta.url)), 'utf8'),
) as unknown;

const errors: string[] = [];
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
  }
}

if (errors.length) {
  for (const e of errors) console.error('✗ ' + e);
  process.exit(1);
}
console.log(`✓ CONTENT.md: ${Object.keys(content).length} sections, all placeholders resolved`);
