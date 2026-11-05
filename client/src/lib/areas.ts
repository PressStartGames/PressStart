// The site is split into areas, one lazily loaded chunk each: the main site (src/site) and the beta
// (src/beta). An area module exports `pages`, the components its routes render.
//
// Why areas and not one chunk per page: each area imports its global stylesheet last, after its
// components, which is the cascade the beta was built and measured with (module CSS first, base.css
// wins ties). Splitting the beta's pages apart would move base.css into a shared chunk loaded first
// and change how the beta looks.
//
// Prerendering and hydration both load the route's area before rendering (entry-server.tsx, main.tsx),
// so a prerendered page never suspends while hydrating; a client navigation into an area not yet
// loaded suspends under the <Suspense> in App.tsx.
import { createElement, type ComponentType, type ReactElement } from 'react';

export type AreaPages = Record<string, ComponentType<{ id?: string }>>;

const loaders = {
  site: () => import('../site'),
  beta: () => import('../beta'),
} satisfies Record<string, () => Promise<{ pages: AreaPages }>>;

export type AreaName = keyof typeof loaders;

// The area modules as Vite's build manifest names them (scripts/prerender.ts adds their chunks and
// stylesheets to each page's <head>; it fails the build if one is missing).
export const AREA_MODULES: Record<AreaName, string> = {
  site: 'src/site/index.tsx',
  beta: 'src/beta/index.tsx',
};

const loaded: Partial<Record<AreaName, AreaPages>> = {};
const pending: Partial<Record<AreaName, Promise<void>>> = {};

export function loadArea(area: AreaName): Promise<void> {
  pending[area] ??= loaders[area]().then((m) => {
    loaded[area] = m.pages;
  });
  return pending[area];
}

// One page of a loaded area as an element, or undefined while the area has not loaded (AreaPage.tsx
// suspends on loadArea then).
export function pageElement(area: AreaName, page: string, id?: string): ReactElement | undefined {
  const pages = loaded[area];
  if (!pages) return undefined;
  const Page = pages[page];
  if (!Page) throw new Error(`area "${area}" has no page "${page}"`);
  return createElement(Page, { id });
}
