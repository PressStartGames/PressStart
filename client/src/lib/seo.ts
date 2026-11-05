// Per-route <head> content. Each route in src/routes.tsx names its meta; the prerender script writes it
// into the page and <RouteHead> keeps the title in step on client navigation.
// M4 adds Open Graph, cards, JSON-LD and the sitemap here.
import { field } from '../content';
import { BASE, SITE_URL } from './config';

export interface RouteMeta {
  title: string;
  description: string;
}

const BETA_NAME = field('header', 'wordmark');

// The beta's pages, unchanged from the beta landing page.
export const betaMeta = {
  home: (): RouteMeta => ({
    title: `${BETA_NAME} · ${field('hero', 'headline')}`,
    description:
      'Press Start is a game engine built around Bevy whose first user is an AI agent: scenes, laws and assets as documents, deterministic replay, and every feature measured against a reference tool. Private beta.',
  }),
  privacy: (): RouteMeta => ({
    title: `Privacy · ${BETA_NAME}`,
    description: 'What the beta sign-up stores, why, and for how long.',
  }),
  confirmed: (): RouteMeta => ({
    title: `Confirmed · ${BETA_NAME}`,
    description: 'Your beta sign-up is confirmed.',
  }),
  notFound: (): RouteMeta => ({
    title: `Not found · ${BETA_NAME}`,
    description: 'There is nothing at this address.',
  }),
};

// The main site's pages: `title` and `description` from the page's CONTENT.md section.
export function sectionMeta(id: string): RouteMeta {
  return { title: field(id, 'title'), description: field(id, 'description') };
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

export function headHtml(pathname: string, m: RouteMeta): string {
  const canonical = SITE_URL ? `<link rel="canonical" href="${SITE_URL}${pathname}" />` : '';
  return [
    `<title>${escape(m.title)}</title>`,
    `<meta name="description" content="${escape(m.description)}" />`,
    `<meta name="app-base" content="${BASE}" />`,
    canonical,
  ]
    .filter(Boolean)
    .join('\n    ');
}
