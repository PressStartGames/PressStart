// Per-route <head> content. M4 adds Open Graph, cards, JSON-LD and the sitemap here.
import { field } from '../content';
import { SITE_URL } from './config';

const SITE_NAME = field('header', 'wordmark');

export interface RouteMeta {
  title: string;
  description: string;
}

export function routeMeta(pathname: string): RouteMeta {
  switch (pathname) {
    case '/':
      return {
        title: `${SITE_NAME} · ${field('hero', 'headline')}`,
        description:
          'Press Start is a game engine built around Bevy whose first user is an AI agent: scenes, laws and assets as documents, deterministic replay, and every feature measured against a reference tool. Private beta.',
      };
    case '/privacy':
      return {
        title: `Privacy · ${SITE_NAME}`,
        description: 'What the beta sign-up stores, why, and for how long.',
      };
    case '/confirmed':
      return { title: `Confirmed · ${SITE_NAME}`, description: 'Your beta sign-up is confirmed.' };
    default:
      return {
        title: `Not found · ${SITE_NAME}`,
        description: 'There is nothing at this address.',
      };
  }
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

export function headHtml(pathname: string): string {
  const m = routeMeta(pathname);
  const canonical = SITE_URL
    ? `<link rel="canonical" href="${SITE_URL}${pathname === '/' ? '/' : pathname}" />`
    : '';
  return [
    `<title>${escape(m.title)}</title>`,
    `<meta name="description" content="${escape(m.description)}" />`,
    canonical,
  ]
    .filter(Boolean)
    .join('\n    ');
}
