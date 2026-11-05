// Prerenders every route to static HTML after `vite build` (client) and `vite build --ssr` (server bundle):
//   dist/index.html, dist/privacy/index.html, dist/confirmed/index.html, dist/404.html.
// GitHub Pages serves each route directly and 404.html for anything else. The page paints and reads with
// JavaScript off; React hydrates on top.
//   DIST and SSR_DIST override the directories (scripts/build-e2e.ts uses them).
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = resolve(process.env.DIST ?? 'dist');
const ssrDist = resolve(process.env.SSR_DIST ?? 'dist-ssr');
const base = process.env.VITE_BASE ?? '/';

const template = readFileSync(join(dist, 'index.html'), 'utf8');
const { render } = (await import(pathToFileURL(join(ssrDist, 'entry-server.js')).href)) as {
  render: (url: string) => { html: string; head: string };
};

// Preload the display face (content-hashed by the client build) so the headline paints in it.
const assets = readdirSync(join(dist, 'assets'));
const faces = assets.filter((f) => /^instrument-serif-latin-400-(normal|italic).*\.woff2$/.test(f));
const preload = faces
  .map(
    (f) =>
      `<link rel="preload" as="font" type="font/woff2" crossorigin href="${base}assets/${f}" />`,
  )
  .join('\n    ');

const routes: Array<{ url: string; file: string }> = [
  { url: '/', file: 'index.html' },
  { url: '/privacy', file: join('privacy', 'index.html') },
  { url: '/confirmed', file: join('confirmed', 'index.html') },
  { url: '/this-route-does-not-exist', file: '404.html' },
];

// PRERENDER_INLINE_CSS=1 inlines the stylesheet. Measured on 2026-11-01 (Lighthouse mobile): the
// external file wins (LCP 2.4 s vs 2.6 s), so it is off by default and kept as an experiment.
const cssLink = /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/.exec(template);
const cssFile = cssLink?.[1] ? join(dist, cssLink[1].replace(base, '')) : null;
const inlineCss =
  cssFile && process.env.PRERENDER_INLINE_CSS === '1'
    ? `<style>${readFileSync(cssFile, 'utf8')}</style>`
    : null;

for (const r of routes) {
  const { html, head } = render(r.url);
  let page = template
    .replace('<!--app-head-->', `${head}\n    ${preload}`)
    .replace('<!--app-html-->', html);
  if (inlineCss && cssLink) page = page.replace(cssLink[0], inlineCss);
  // CLAUDE.md: the site never names Bevy and never says "honest"/"honestly", wherever the words come from.
  const banned = /bevy|honest/i.exec(page);
  if (banned) throw new Error(`${r.file} contains the banned word "${banned[0]}"`);
  const out = join(dist, r.file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page);
  console.log(`prerendered ${r.url} -> ${r.file}`);
}

rmSync(ssrDist, { recursive: true, force: true });
