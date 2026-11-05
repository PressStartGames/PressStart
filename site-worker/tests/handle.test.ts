import { describe, expect, it } from 'vitest';
import { handle, wantsHtml, type Env } from '../src/worker';

const assets = (status = 200): Fetcher =>
  ({
    fetch: async () =>
      new Response('<h1>hi</h1>', { status, headers: { 'content-type': 'text/html' } }),
  }) as unknown as Fetcher;

const req = (path = '/', accept = '*/*') =>
  new Request(`https://staging.pressstartgames.net${path}`, { headers: { accept } });

describe('site Worker', () => {
  it('serves the static asset untouched when no experiments are configured', async () => {
    const res = await handle(req(), { ASSETS: assets() } satisfies Env);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('<h1>hi</h1>');
    expect(res.headers.get('x-robots-tag')).toBeNull();
  });

  it('keeps the 404 status of the not-found page', async () => {
    const res = await handle(req('/x'), { ASSETS: assets(404) });
    expect(res.status).toBe(404);
  });

  it('adds noindex on staging only', async () => {
    const res = await handle(req(), { ASSETS: assets(), ROBOTS_NOINDEX: 'true' });
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });

  it('recognises an HTML request', () => {
    expect(wantsHtml(req('/', 'text/html,application/xhtml+xml'))).toBe(true);
    expect(wantsHtml(req('/a.js', '*/*'))).toBe(false);
  });
});
