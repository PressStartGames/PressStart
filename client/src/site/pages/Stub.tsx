import { SITE_PAGE_IDS, type SitePageId } from '../../content/schema';
import { Determinism } from './Determinism';
import { Engine } from './Engine';
import { Placeholder } from './Placeholder';

const isPage = (id: string): id is SitePageId => (SITE_PAGE_IDS as readonly string[]).includes(id);

// Every main-site page outside the home (routes.tsx renders them all as "stub" with their id): the
// designed pages by id, every other page as a styled placeholder from its CONTENT.md section.
export function Stub({ id = '' }: { id?: string }) {
  if (id === 'engine') return <Engine />;
  if (id === 'engine-determinism') return <Determinism />;
  return isPage(id) ? <Placeholder id={id} /> : null;
}
