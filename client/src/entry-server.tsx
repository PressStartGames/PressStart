import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';
import { ROUTER_BASENAME as basename } from './lib/config';
import { headHtml } from './lib/seo';
import './styles/base.css';

// Called by scripts/prerender.ts for every route after the client build.
export function render(url: string): { html: string; head: string } {
  const location = basename === '/' ? url : `${basename}${url}`;
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={location} basename={basename}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  return { html, head: headHtml(url) };
}
