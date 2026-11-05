// Small readers over the content layer for the main site: list items of a section, and items whose
// parts are separated by " | " in CONTENT.md.
import { section } from '../../content';

// The items of a section's first numbered list.
export function items(id: string): string[] {
  for (const b of section(id).blocks) if (b.type === 'ol') return b.items;
  return [];
}

// The section's paragraphs, in order.
export function paragraphs(id: string): string[] {
  return section(id).blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []));
}

// "a | b | c" items -> [["a", "b", "c"], ...]
export function rows(id: string): string[][] {
  return items(id).map((item) => item.split('|').map((s) => s.trim()));
}
