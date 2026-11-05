/* eslint-disable react-refresh/only-export-components -- the prerender's server entry, never hot-reloaded */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';
import { AREA_MODULES, loadArea, type AreaName } from './lib/areas';
import { ROUTER_BASENAME as basename } from './lib/config';
import { setRenderVariants } from './lib/flags';
import { headHtml } from './lib/seo';
import { PRERENDER, resolveRoute } from './routes';

export { AREA_MODULES, PRERENDER };

// Called by scripts/prerender.ts for every route in PRERENDER after the client build.
// `variants` renders an experiment's variant page (scripts/prerender.ts writes one per variant): { 'home-headline': 'variant-b' }.
export async function render(
  url: string,
  variants: Record<string, string> = {},
): Promise<{ html: string; head: string; area: AreaName }> {
  setRenderVariants(variants);
  const { area, meta } = resolveRoute(url);
  await loadArea(area);
  const location = basename === '/' ? url : `${basename}${url}`;
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={location} basename={basename}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  return { html, head: headHtml(url, meta), area };
}
