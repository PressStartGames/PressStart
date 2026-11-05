import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { loadArea } from './lib/areas';
import {
  ANALYTICS_ENABLED,
  CF_BEACON_TOKEN,
  GROWTHBOOK_API_HOST,
  GROWTHBOOK_CLIENT_KEY,
  ROUTER_BASENAME as basename,
} from './lib/config';
import { initFlags } from './lib/flags';
import { resolveRoute } from './routes';

// `js` is set by the inline script in index.html before paint; `hydrated` marks that React is about
// to take over (set just before hydrateRoot below), which is when scroll reveals are allowed to hide
// their initial state (base.css).

// A prerendered page opened by its file name (/index.html, /beta/privacy/index.html) is the same route.
if (location.pathname.endsWith('/index.html')) {
  const path = location.pathname.slice(0, -'index.html'.length);
  history.replaceState(history.state, '', path + location.search + location.hash);
}

// Load this page's area before hydrating, so the prerendered HTML is adopted without suspending (the
// prerender already modulepreloads the area's chunk). Not a top-level await: an area chunk imports
// shared modules from this entry chunk, which must have finished evaluating.
void loadArea(resolveRoute(location.pathname, basename).area).then(() => {
  document.documentElement.classList.add('hydrated');
  hydrateRoot(
    document.getElementById('root')!,
    <StrictMode>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
});

// Analytics and flags start once the page is interactive, never in the way of the first paint.
const idle: (cb: () => void) => void =
  window.requestIdleCallback?.bind(window) ?? ((cb) => window.setTimeout(cb, 300));
idle(() => {
  if (ANALYTICS_ENABLED || CF_BEACON_TOKEN)
    void import('./lib/analytics').then((m) => m.initAnalytics());
  void initFlags(GROWTHBOOK_CLIENT_KEY, GROWTHBOOK_API_HOST);
});
