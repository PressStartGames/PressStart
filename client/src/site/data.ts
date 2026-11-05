// The main site's reading of CONTENT.md list fields. Copy stays in CONTENT.md; this only splits it.
//   "a = b = c | d = e = f"  ->  [["a", "b", "c"], ["d", "e", "f"]]
import { field, splitList } from '../content';
import { SITE_PAGE_IDS, type SitePageId } from '../content/schema';
import { sitePagePath } from '../routes';

export function rows(id: string, key: string): string[][] {
  return splitList(field(id, key), '|').map((entry) => entry.split(' = ').map((s) => s.trim()));
}

export function list(id: string, key: string): string[] {
  return splitList(field(id, key), '|');
}

const PAGE_IDS = new Set<string>(SITE_PAGE_IDS);

// A page id from CONTENT.md, checked against the route table (an unknown id fails the build).
export function pageId(id: string): SitePageId {
  if (!PAGE_IDS.has(id)) throw new Error(`CONTENT.md names an unknown page "${id}"`);
  return id as SitePageId;
}

export function href(id: string): string {
  return sitePagePath(pageId(id));
}

export interface NavEntry {
  id: SitePageId;
  label: string;
  note: string;
}

export function navEntries(key: string): NavEntry[] {
  return rows('site-nav', key).map(([id = '', label = '', note = '']) => ({
    id: pageId(id),
    label,
    note,
  }));
}

export type Move = 'build' | 'prove' | 'own';
export const MOVES: readonly Move[] = ['build', 'prove', 'own'];

// The Engine panel's three columns, one per move, and the other two groups.
export function navModel() {
  const moves = list('site-nav', 'moves');
  const notes = list('site-nav', 'move-notes');
  const [overview] = navEntries('overview');
  if (!overview) throw new Error('site-nav has no overview');
  return {
    overview,
    columns: MOVES.map((move, i) => ({
      move,
      label: moves[i] ?? move,
      note: notes[i] ?? '',
      entries: navEntries(`engine-${move}`),
    })),
    resources: navEntries('resources'),
    company: navEntries('company'),
  };
}

// The one accepted golden the main site shows (a row in assets/renders/manifest.json).
export const GOLDEN_FILE = 'world-terrain-splat-valley.png';

// The nav's label and note for a page (the first group that lists it).
export function navEntry(id: string): NavEntry {
  const m = navModel();
  const all = [m.overview, ...m.columns.flatMap((c) => c.entries), ...m.resources, ...m.company];
  const e = all.find((x) => x.id === id);
  if (!e) throw new Error(`site-nav does not list page "${id}"`);
  return e;
}

// Which move a page belongs to (its tint, chip and breadcrumb).
export function moveOf(id: string): Move | undefined {
  return navModel().columns.find((c) => c.entries.some((e) => e.id === id))?.move;
}

// Breadcrumbs above a page in the Engine group: the engine overview, then the page's move.
export function crumbsFor(id: string): Array<{ label: string; to: string }> {
  const move = moveOf(id);
  if (!move || id === 'engine') return [];
  const m = navModel();
  const col = m.columns.find((c) => c.move === move);
  return [
    { label: m.overview.label, to: sitePagePath(m.overview.id) },
    { label: col?.label ?? move, to: `${sitePagePath(m.overview.id)}#${move}` },
  ];
}
