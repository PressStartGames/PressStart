// Prerenders every route in src/routes.tsx's PRERENDER list to static HTML after `vite build` (client)
// and `vite build --ssr` (server bundle): dist/index.html, dist/<page>/index.html, dist/404.html,
// dist/beta/index.html, dist/beta/{privacy,confirmed}/index.html, dist/beta/404.html.
// Static hosts serve each route directly and the nearest 404.html for anything else. The page paints and
// reads with JavaScript off; React hydrates on top.
//
// Each page's area (src/lib/areas.tsx) is a lazy chunk: its stylesheets are linked and its scripts
// modulepreloaded in the page's <head>, read from Vite's build manifest, so the page is styled with
// JavaScript off and hydrates without a request waterfall.
//   DIST and SSR_DIST override the directories (scripts/build-e2e.ts uses them).
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';
import { EXPERIMENTS, variantFile } from '../../edge/config.ts';

const dist = resolve(process.env.DIST ?? 'dist');
const ssrDist = resolve(process.env.SSR_DIST ?? 'dist-ssr');
// Same env files as the build (PS_MODE is set by build.ts / build-e2e.ts; process.env still wins).
const base = loadEnv(process.env.PS_MODE ?? 'production', process.cwd(), 'VITE_').VITE_BASE || '/';

interface ManifestChunk {
  file: string;
  isEntry?: boolean;
  imports?: string[];
  css?: string[];
}

const template = readFileSync(join(dist, 'index.html'), 'utf8');
const manifestPath = join(dist, '.vite', 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, ManifestChunk>;
const { render, PRERENDER, AREA_MODULES } = (await import(
  pathToFileURL(join(ssrDist, 'entry-server.js')).href
)) as {
  render: (
    url: string,
    variants?: Record<string, string>,
  ) => Promise<{ html: string; head: string; area: string }>;
  PRERENDER: Array<{ url: string; file: string }>;
  AREA_MODULES: Record<string, string>;
};

// A chunk and everything it imports statically, dependencies first (the order Vite loads their CSS in).
function closure(key: string, seen = new Set<string>(), out = new Set<string>()): Set<string> {
  if (seen.has(key)) return out;
  seen.add(key);
  for (const k of manifest[key]?.imports ?? []) closure(k, seen, out);
  out.add(key);
  return out;
}
// What the entry already loads (index.html carries its script, modulepreloads and stylesheet).
const entryKey = Object.keys(manifest).find((k) => manifest[k]?.isEntry);
if (!entryKey) throw new Error('the build manifest has no entry');
const fromEntry = closure(entryKey);

// The tags an area adds to <head>: its stylesheets (in chunk order) and its scripts as modulepreloads.
function areaTags(area: string): string {
  const key = AREA_MODULES[area];
  if (!key || !manifest[key]) throw new Error(`the build manifest has no chunk for area "${area}"`);
  const keys = [...closure(key)].filter((k) => !fromEntry.has(k));
  const css = keys.flatMap((k) => manifest[k]?.css ?? []);
  const js = keys.map((k) => manifest[k]?.file).filter((f): f is string => Boolean(f));
  return [
    ...css.map((f) => `<link rel="stylesheet" crossorigin href="${base}${f}">`),
    ...js.map((f) => `<link rel="modulepreload" crossorigin href="${base}${f}">`),
  ].join('\n    ');
}

// Preload the display face (content-hashed by the client build) so the headline paints in it.
const assets = readdirSync(join(dist, 'assets'));
const faces = assets.filter((f) => /^instrument-serif-latin-400-(normal|italic).*\.woff2$/.test(f));
const preload = faces
  .map(
    (f) =>
      `<link rel="preload" as="font" type="font/woff2" crossorigin href="${base}assets/${f}" />`,
  )
  .join('\n    ');
// The main site (src/site) also preloads the two faces its hero sets above the fold, so the first paint
// already has their metrics and nothing below them moves when they arrive (CLS). The beta is unchanged.
const siteFaces = assets
  .filter((f) => /^(space-grotesk-latin-wght|press-start-2p-latin-400)-normal.*\.woff2$/.test(f))
  .map(
    (f) =>
      `<link rel="preload" as="font" type="font/woff2" crossorigin href="${base}assets/${f}" />`,
  )
  .join('\n    ');

// PRERENDER_INLINE_CSS=1 inlines the area's stylesheets. Measured on 2026-11-01 (Lighthouse mobile):
// the external file wins (LCP 2.4 s vs 2.6 s), so it is off by default and kept as an experiment.
const inlineCss = process.env.PRERENDER_INLINE_CSS === '1';

for (const r of PRERENDER) {
  const { html, head, area } = await render(r.url);
  let tags = areaTags(area);
  if (inlineCss) {
    tags = tags.replace(
      /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
      (_, href: string) =>
        `<style>${readFileSync(join(dist, href.slice(base.length)), 'utf8')}</style>`,
    );
  }
  const page = template
    .replace(
      '<!--app-head-->',
      [head, preload, area === 'site' ? siteFaces : '', tags].filter(Boolean).join('\n    '),
    )
    .replace('<!--app-html-->', html);
  // CLAUDE.md: the site never names Bevy and never says "honest"/"honestly", wherever the words come from.
  const banned = /bevy|honest/i.exec(page);
  if (banned) throw new Error(`${r.file} contains the banned word "${banned[0]}"`);
  const out = join(dist, r.file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page);
  console.log(`prerendered ${r.url} -> ${r.file} (${area})`);
}

// One extra page per experiment variant (edge/config.ts): the same route rendered as that variant, written under
// _variants/<experiment>/<variant>/ for the edge Worker to serve (edge/experiments.ts). The page says which variant
// it is (read at hydration so React adopts it unchanged) and is kept out of search results.
for (const exp of EXPERIMENTS) {
  for (const variant of exp.variants.filter((v) => v !== exp.control)) {
    const { html, head, area } = await render(exp.route, { [exp.id]: variant });
    const marks = [
      `<meta name="ps-variant" content="${exp.id}:${variant}" />`,
      '<meta name="robots" content="noindex" />',
    ];
    const page = template
      .replace(
        '<!--app-head-->',
        [head, ...marks, preload, area === 'site' ? siteFaces : '', areaTags(area)]
          .filter(Boolean)
          .join('\n    '),
      )
      .replace('<!--app-html-->', html);
    const banned = /bevy|honest/i.exec(page);
    if (banned) {
      throw new Error(`${variantFile(exp, variant)} contains the banned word "${banned[0]}"`);
    }
    const out = join(dist, variantFile(exp, variant));
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, page);
    console.log(`prerendered variant ${exp.id}:${variant} -> ${variantFile(exp, variant)}`);
  }
}

// The manifest is a build input, not part of the site.
rmSync(join(dist, '.vite'), { recursive: true, force: true });
rmSync(ssrDist, { recursive: true, force: true });
