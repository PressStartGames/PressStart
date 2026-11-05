import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { loadArea } from './lib/areas';
import { ROUTER_BASENAME as basename } from './lib/config';
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
