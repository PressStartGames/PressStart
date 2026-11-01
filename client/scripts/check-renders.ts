// CI gate: every image under assets/renders/ has a provenance row in manifest.json, and every row's
// file exists. Only accepted engine goldens or booth captures may be published (the skill's rules).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface Row {
  file: string;
  engineCommit: string;
  crate: string;
  test: string;
  sourcePath: string;
  kind: 'golden' | 'booth';
}

const dir = fileURLToPath(new URL('../assets/renders/', import.meta.url));
const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')) as { images: Row[] };
const errors: string[] = [];

const files = readdirSync(dir).filter((f) => /\.(png|webp|avif|jpg)$/i.test(f));
const rows = new Map(manifest.images.map((r) => [r.file, r]));

for (const f of files) {
  const r = rows.get(f);
  if (!r) {
    errors.push(`${f} has no manifest row`);
    continue;
  }
  for (const k of ['engineCommit', 'crate', 'test', 'sourcePath', 'kind'] as const) {
    if (!r[k]) errors.push(`${f}: manifest row lacks "${k}"`);
  }
  if (r.kind !== 'golden' && r.kind !== 'booth') errors.push(`${f}: kind must be golden or booth`);
  if (/\.candidate\./.test(r.sourcePath))
    errors.push(`${f}: a candidate golden may not be published`);
}
for (const r of manifest.images) {
  if (!existsSync(join(dir, r.file))) errors.push(`manifest row for missing file ${r.file}`);
}

if (errors.length) {
  for (const e of errors) console.error('✗ ' + e);
  process.exit(1);
}
console.log(`✓ renders: ${files.length} image(s), every one with a provenance row`);
