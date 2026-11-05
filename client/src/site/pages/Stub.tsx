import { SITE_PAGE_IDS, type SitePageId } from '../../content/schema';
import { Engine } from './Engine';
import { News } from './News';
import { Parallel } from './Parallel';
import { Placeholder } from './Placeholder';
import { Roadmap } from './Roadmap';

const isPage = (id: string): id is SitePageId => (SITE_PAGE_IDS as readonly string[]).includes(id);

// Every main-site page by its id (routes.tsx renders `stub` for each): the designed ones, and the
// placeholder for the rest.
export function Stub({ id = '' }: { id?: string }) {
  switch (id) {
    case 'engine':
      return <Engine />;
    case 'engine-parallel':
      return <Parallel />;
    case 'roadmap':
      return <Roadmap />;
    case 'news':
      return <News />;
    default:
      return isPage(id) ? <Placeholder id={id} /> : null;
  }
}
