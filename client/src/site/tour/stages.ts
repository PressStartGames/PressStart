import type { PixelName } from '../ui/pixels';

// The home page's tour, in page order: each stage's anchor, its number on the map, its phosphor colour,
// its pixel icon and its CONTENT.md section (kicker, teaser, headline and body live there).
export interface Stage {
  id: string;
  no: string;
  color: string;
  icon: PixelName;
  section: string;
}

export const STAGES: readonly Stage[] = [
  {
    id: 'documents',
    no: '1-1',
    color: 'var(--st-green)',
    icon: 'doc',
    section: 'site-stage-documents',
  },
  {
    id: 'determinism',
    no: '1-2',
    color: 'var(--st-amber)',
    icon: 'die',
    section: 'site-stage-determinism',
  },
  {
    id: 'parallel',
    no: '1-3',
    color: 'var(--st-cyan)',
    icon: 'chip',
    section: 'site-stage-parallel',
  },
  {
    id: 'goldens',
    no: '1-4',
    color: 'var(--st-pink)',
    icon: 'frame',
    section: 'site-stage-goldens',
  },
  {
    id: 'oracles',
    no: '1-5',
    color: 'var(--st-blue)',
    icon: 'scale',
    section: 'site-stage-oracles',
  },
  { id: 'ai', no: '1-6', color: 'var(--st-orange)', icon: 'prompt', section: 'site-stage-ai' },
  {
    id: 'ownership',
    no: '1-7',
    color: 'var(--st-violet)',
    icon: 'key',
    section: 'site-stage-ownership',
  },
  { id: 'built', no: '1-8', color: 'var(--st-lime)', icon: 'bars', section: 'site-built' },
  { id: 'road', no: '1-9', color: 'var(--st-gold)', icon: 'flag', section: 'site-road' },
];

export function stage(id: string): Stage {
  const s = STAGES.find((x) => x.id === id);
  if (!s) throw new Error(`no stage "${id}"`);
  return s;
}

// "a = b | c = d" -> [["a", "b"], ["c", "d"]]  (CONTENT.md's mapped lists)
export function pairs(value: string): Array<[string, string]> {
  return value
    .split('|')
    .map((part) => {
      const i = part.indexOf('=');
      return [part.slice(0, i).trim(), part.slice(i + 1).trim()] as [string, string];
    })
    .filter(([k]) => k.length > 0);
}

// "{x} and {y}" with {x: 1, y: 2} -> "1 and 2"  (CONTENT.md's console lines)
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ''));
}
