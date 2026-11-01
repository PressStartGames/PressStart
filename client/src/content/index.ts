import raw from '../../../CONTENT.md?raw';
import counts from '../../data/counts.json';
import replay from '../../data/replay.json';
import { fillPlaceholders, parseContent, type Section } from './parse';

export { counts, replay };

const content = fillPlaceholders(parseContent(raw), counts);

export function section(id: string): Section {
  const s = content[id];
  if (!s) throw new Error(`CONTENT.md has no section "${id}"`);
  return s;
}

export function field(id: string, key: string): string {
  const v = section(id).fields[key];
  if (v === undefined) throw new Error(`CONTENT.md section "${id}" has no field "${key}"`);
  return v;
}

export { splitLead, splitList } from './parse';
