import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WORKER_FIRST_ROUTES } from '../../edge/config';
import { handle, type Env } from '../src/worker';

const assets = (status = 200): Fetcher =>
  ({
    fetch: async (r: Request) =>
      new Response(`<h1>${new URL(r.url).pathname}</h1>`, {
        status,
        headers: { 'content-type': 'text/html' },
      }),
  }) as unknown as Fetcher;

const req = (path = '/', cookie?: string) =>
  new Request(`https://staging.pressstartgames.net${path}`, {
    headers: { accept: '*/*', ...(cookie ? { cookie } : {}) },
  });

describe('site Worker', () => {
  it('serves the static control page at / without a consent cookie', async () => {
    const res = await handle(req(), { ASSETS: assets() } satisfies Env);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('<h1>/</h1>');
    expect(res.headers.get('set-cookie')).toBeNull();
    expect(res.headers.get('x-robots-tag')).toBeNull();
  });

  it('serves the control page with consent but no GrowthBook key (fail open, no cookie)', async () => {
    const res = await handle(req('/', 'ps_consent=granted'), {
      ASSETS: assets(),
      GROWTHBOOK_CLIENT_KEY: '',
      GROWTHBOOK_API_HOST: '',
    });
    expect(await res.text()).toBe('<h1>/</h1>');
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('serves the stored variant page from the assets when the visitor has consented', async () => {
    const res = await handle(req('/', 'ps_consent=granted; ps_exp=home-headline:variant-b'), {
      ASSETS: assets(),
    });
    expect(await res.text()).toBe('<h1>/_variants/home-headline/variant-b/</h1>');
  });

  it('passes every other path straight to the assets and keeps the 404 status', async () => {
    const res = await handle(req('/beta/x', 'ps_consent=granted'), { ASSETS: assets(404) });
    expect(res.status).toBe(404);
    expect(await res.text()).toBe('<h1>/beta/x</h1>');
  });

  it('adds noindex on staging only', async () => {
    const res = await handle(req(), { ASSETS: assets(), ROBOTS_NOINDEX: 'true' });
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
});

describe('wrangler.jsonc', () => {
  const text = readFileSync(join(__dirname, '../wrangler.jsonc'), 'utf8');
  // Strip // comments (not inside strings: none of our values contain "//" except URLs, which are quoted
  // after a colon-space and are not present in this file's assets config).
  const cfg = JSON.parse(text.replace(/^\s*\/\/.*$/gm, '').replace(/,(\s*[}\]])/g, '$1')) as {
    assets: { run_worker_first: unknown };
    env: Record<string, { assets: { run_worker_first: unknown }; vars?: Record<string, string> }>;
  };

  it('wakes the Worker for the edge routes locally and in production', () => {
    expect(cfg.assets.run_worker_first).toEqual([...WORKER_FIRST_ROUTES]);
    expect(cfg.env.production?.assets.run_worker_first).toEqual([...WORKER_FIRST_ROUTES]);
  });

  it('runs the Worker for everything on staging (a superset, for the noindex header)', () => {
    expect(cfg.env.staging?.assets.run_worker_first).toBe(true);
  });

  it('declares the GrowthBook vars, empty until the founder supplies them', () => {
    for (const e of ['staging', 'production']) {
      expect(cfg.env[e]?.vars).toMatchObject({
        GROWTHBOOK_CLIENT_KEY: '',
        GROWTHBOOK_API_HOST: '',
      });
    }
  });
});
