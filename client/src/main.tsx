import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { ROUTER_BASENAME as basename } from './lib/config';
import './styles/base.css';

// `js` is set by the inline script in index.html before paint; `hydrated` marks that React is about
// to take over, which is when scroll reveals are allowed to hide their initial state (base.css).
document.documentElement.classList.add('hydrated');

// A prerendered page opened by its file name (/index.html, /privacy/index.html) is the same route.
if (location.pathname.endsWith('/index.html')) {
  const path = location.pathname.slice(0, -'index.html'.length);
  history.replaceState(history.state, '', path + location.search + location.hash);
}

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
