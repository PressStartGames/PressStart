import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { fillPlaceholders, parseContent, splitLead, splitList } from '../../src/content/parse';
import { CONTENT_SCHEMA } from '../../src/content/schema';

const md = readFileSync(fileURLToPath(new URL('../../../CONTENT.md', import.meta.url)), 'utf8');
const counts = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../data/counts.json', import.meta.url)), 'utf8'),
) as Record<string, unknown>;

describe('CONTENT.md', () => {
  const content = fillPlaceholders(parseContent(md), counts);

  it('has every section and field the schema names', () => {
    for (const [id, keys] of Object.entries(CONTENT_SCHEMA)) {
      expect(content[id], id).toBeDefined();
      for (const k of keys) expect(content[id]?.fields[k], `${id}.${k}`).toBeDefined();
    }
  });

  it('keeps no builder note and no raw placeholder', () => {
    for (const s of Object.values(content)) {
      for (const b of s.blocks) {
        const texts =
          b.type === 'p'
            ? [b.text]
            : b.type === 'ol'
              ? b.items
              : b.type === 'field'
                ? [b.value]
                : [];
        for (const t of texts) {
          expect(t).not.toMatch(/\*\(/);
          expect(t).not.toContain('{{');
        }
      }
    }
  });

  it('fills the counts from counts.json, never by hand', () => {
    const tiles = content['built']?.fields['tiles'] ?? '';
    const catalog = counts['catalog'] as { total: number; built: number };
    expect(tiles).toContain(`${catalog.built} of ${catalog.total} things built`);
  });

  it('refuses an unknown placeholder', () => {
    expect(() => fillPlaceholders(parseContent('## x\n\n{{nope.value}}\n'), counts)).toThrow(
      /unknown placeholder/,
    );
  });

  it('keeps the code sample verbatim, with its engine commit', () => {
    const code = content['build']?.blocks.find((b) => b.type === 'code');
    expect(code?.type).toBe('code');
    if (code?.type === 'code') {
      expect(code.lang).toBe('rust');
      expect(code.text).toContain('fn three_fixed_steps_a_frame_are_thirty_after_ten_frames()');
      expect(code.text).toContain('advance(&mut app, 10);');
    }
    expect(content['build']?.fields['sample-commit']).toMatch(/^[0-9a-f]{40}$/);
  });

  it('never uses the internal line publicly', () => {
    expect(md.toLowerCase()).not.toContain('unity for ai');
  });

  it('parses multi-line fields and wrapped list items', () => {
    const c = parseContent('## s\n\nkey: first\nsecond\n\n1. **A.** one\ntwo\n2. **B.** three\n');
    expect(c['s']?.fields['key']).toBe('first second');
    const ol = c['s']?.blocks.find((b) => b.type === 'ol');
    expect(ol?.type === 'ol' && ol.items).toEqual(['**A.** one two', '**B.** three']);
  });
});

describe('helpers', () => {
  it('splits lists and leads', () => {
    expect(splitList('a · b · c')).toEqual(['a', 'b', 'c']);
    expect(splitList('a | b', '|')).toEqual(['a', 'b']);
    expect(splitLead('**Lead.** rest here')).toEqual({ lead: 'Lead.', rest: 'rest here' });
    expect(splitLead('no lead')).toEqual({ lead: '', rest: 'no lead' });
  });
});
