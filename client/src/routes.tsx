// The route table: one app, two areas (plans/main-site.md phase 1).
//   /          the main site: src/site (MainLayout + its pages; phase 2 replaces this area)
//   /beta/*    the beta landing page: src/beta (its layout + home, privacy, confirmed, not-found)
// Each route names its <head> meta; PRERENDER lists every page written to static HTML at build.
import { matchRoutes, type RouteObject } from 'react-router';
import { SITE_PAGE_IDS, type SitePageId } from './content/schema';
import { AreaPage } from './lib/AreaPage';
import type { AreaName } from './lib/areas';
import { betaMeta, sectionMeta, type RouteMeta } from './lib/seo';

interface Handle {
  area?: AreaName;
  meta?: () => RouteMeta;
}

function page(area: AreaName, name: string, meta: () => RouteMeta, id?: string) {
  return { element: <AreaPage area={area} page={name} id={id} />, handle: { meta } };
}

// engine-determinism -> /engine/determinism
export function sitePagePath(id: SitePageId): string {
  return `/${id.replace(/-/g, '/')}`;
}

export const routes: RouteObject[] = [
  {
    path: '/beta',
    element: <AreaPage area="beta" page="layout" />,
    handle: { area: 'beta' } satisfies Handle,
    children: [
      { index: true, ...page('beta', 'home', betaMeta.home) },
      { path: 'privacy', ...page('beta', 'privacy', betaMeta.privacy) },
      { path: 'confirmed', ...page('beta', 'confirmed', betaMeta.confirmed) },
      { path: '*', ...page('beta', 'notFound', betaMeta.notFound) },
    ],
  },
  {
    path: '/',
    element: <AreaPage area="site" page="layout" />,
    handle: { area: 'site' } satisfies Handle,
    children: [
      { index: true, ...page('site', 'home', () => sectionMeta('site-home')) },
      ...SITE_PAGE_IDS.map((id) => ({
        path: sitePagePath(id).slice(1),
        ...page('site', 'stub', () => sectionMeta(`page-${id}`), id),
      })),
      { path: '*', ...page('site', 'notFound', () => sectionMeta('site-not-found')) },
    ],
  },
];

// Every prerendered page: its URL (relative to the base) and its file in dist/. Static hosts serve
// <route>/index.html for the route and the nearest 404.html for anything else.
export const PRERENDER: Array<{ url: string; file: string }> = [
  { url: '/', file: 'index.html' },
  ...SITE_PAGE_IDS.map((id) => ({
    url: sitePagePath(id),
    file: `${sitePagePath(id).slice(1)}/index.html`,
  })),
  { url: '/this-route-does-not-exist', file: '404.html' },
  { url: '/beta/', file: 'beta/index.html' },
  { url: '/beta/privacy', file: 'beta/privacy/index.html' },
  { url: '/beta/confirmed', file: 'beta/confirmed/index.html' },
  { url: '/beta/this-route-does-not-exist', file: 'beta/404.html' },
];

// The area and the meta of a path (pass the basename when the path still carries it).
export function resolveRoute(
  pathname: string,
  basename?: string,
): { area: AreaName; meta: RouteMeta } {
  const matches = matchRoutes(routes, pathname, basename) ?? [];
  const handles = matches.map((m) => (m.route.handle ?? {}) as Handle);
  const area = handles.find((h) => h.area)?.area ?? 'site';
  const meta =
    [...handles].reverse().find((h) => h.meta)?.meta ?? (() => sectionMeta('site-not-found'));
  return { area, meta: meta() };
}
