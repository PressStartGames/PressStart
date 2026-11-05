// Small readers for the list-shaped fields the main site keeps in CONTENT.md.
import { field, section, splitList } from '../content';
import type { Block } from '../content/parse';

export interface Pair {
  key: string;
  value: string;
}

// "Physics = Jolt · PhysX | Text = HarfBuzz" -> [{ key: 'Physics', value: 'Jolt · PhysX' }, ...]
export function pairs(id: string, key: string): Pair[] {
  return splitList(field(id, key), '|').map((item) => {
    const at = item.indexOf(' = ');
    return at < 0
      ? { key: item, value: '' }
      : { key: item.slice(0, at).trim(), value: item.slice(at + 3).trim() };
  });
}

export function list(id: string, key: string): string[] {
  return splitList(field(id, key), '|');
}

// The section's body paragraphs (fields and builder notes excluded).
export function paragraphs(id: string): string[] {
  return section(id)
    .blocks.filter((b): b is Extract<Block, { type: 'p' }> => b.type === 'p')
    .map((b) => b.text);
}

export const pad = (n: number, width = 2) => String(n).padStart(width, '0');
