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
