import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WORKER_FIRST_ROUTES } from '../config';
import { handleHtml, resetFeatureCache } from '../experiments';

const env = { GROWTHBOOK_CLIENT_KEY: 'sdk-test', GROWTHBOOK_API_HOST: 'https://gb.test' };

function features(weights: [number, number]) {
  return {
    features: {
      'home-headline': {
        defaultValue: 'control',
        rules: [
          {
            key: 'home-headline',
            variations: ['control', 'variant-b'],
            weights,
            coverage: 1,
            hashAttribute: 'id',
          },
        ],
      },
    },
  };
}

// A static-assets stand-in: serves the control page at "/" and the variant page under /_variants/.
const asset = {
  fetch: vi.fn(async (r: Request): Promise<Response> => {
    const p = new URL(r.url).pathname;
    if (p === '/')
      return new Response('<h1>control</h1>', { headers: { 'content-type': 'text/html' } });
    if (p === '/_variants/home-headline/variant-b/') return new Response('<h1>variant</h1>');
    if (p === '/app.js') return new Response('js');
    return new Response('nope', { status: 404 });
  }),
};

let gbFetch: ReturnType<typeof vi.fn>;
beforeEach(() => {
  resetFeatureCache();
  asset.fetch.mockClear();
  gbFetch = vi.fn(async () => new Response(JSON.stringify(features([0, 1]))));
  vi.stubGlobal('fetch', gbFetch);
});
afterEach(() => vi.unstubAllGlobals());

const req = (path: string, cookie?: string, init: RequestInit = {}) =>
  new Request(`https://site.test${path}`, { ...init, headers: cookie ? { cookie } : {} });

describe('handleHtml', () => {
  it('without the consent signal serves the control, sets no cookie and never calls GrowthBook', async () => {
    const res = await handleHtml(req('/'), env, asset);
    expect(await res.text()).toBe('<h1>control</h1>');
    expect(res.headers.get('set-cookie')).toBeNull();
    expect(res.headers.get('vary')).toContain('Cookie');
    expect(gbFetch).not.toHaveBeenCalled();
  });

  it('a consent cookie that is not "granted" is treated as no consent', async () => {
    const res = await handleHtml(req('/', 'ps_consent=denied'), env, asset);
    expect(await res.text()).toBe('<h1>control</h1>');
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('with consent assigns, serves the variant page and persists the assignment', async () => {
    const res = await handleHtml(req('/', 'ps_consent=granted'), env, asset);
    expect(await res.text()).toBe('<h1>variant</h1>');
    const set = res.headers.getSetCookie();
    expect(set.some((c) => c.startsWith('ps_exp=home-headline%3Avariant-b'))).toBe(true);
    expect(set.some((c) => c.startsWith('ps_vid='))).toBe(true);
    expect(set.every((c) => c.includes('SameSite=Lax') && c.includes('Secure'))).toBe(true);
  });

  it('a stored assignment wins and needs no GrowthBook call', async () => {
    const res = await handleHtml(
      req('/', 'ps_consent=granted; ps_exp=home-headline%3Avariant-b'),
      env,
      asset,
    );
    expect(await res.text()).toBe('<h1>variant</h1>');
    expect(gbFetch).not.toHaveBeenCalled();
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('an assignment to control is stored and serves the control page', async () => {
    gbFetch.mockImplementation(async () => new Response(JSON.stringify(features([1, 0]))));
    const res = await handleHtml(req('/', 'ps_consent=granted'), env, asset);
    expect(await res.text()).toBe('<h1>control</h1>');
    expect(res.headers.getSetCookie().some((c) => c.includes('home-headline%3Acontrol'))).toBe(
      true,
    );
  });

  it('fails open to the control, with no cookie, when GrowthBook is down or the key is unset', async () => {
    gbFetch.mockImplementation(async () => new Response('x', { status: 500 }));
    let res = await handleHtml(req('/', 'ps_consent=granted'), env, asset);
    expect(await res.text()).toBe('<h1>control</h1>');
    expect(res.headers.get('set-cookie')).toBeNull();
    resetFeatureCache();
    res = await handleHtml(req('/', 'ps_consent=granted'), {}, asset);
    expect(await res.text()).toBe('<h1>control</h1>');
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('falls back to the control when the variant page is missing from the assets', async () => {
    asset.fetch.mockImplementationOnce(async () => new Response('x', { status: 404 }));
    const res = await handleHtml(
      req('/', 'ps_consent=granted; ps_exp=home-headline%3Avariant-b'),
      env,
      asset,
    );
    expect(await res.text()).toBe('<h1>control</h1>');
  });

  it('caches the features between requests', async () => {
    await handleHtml(req('/', 'ps_consent=granted'), env, asset);
    await handleHtml(req('/', 'ps_consent=granted'), env, asset);
    expect(gbFetch).toHaveBeenCalledTimes(1);
  });

  it('passes every other route and method straight through', async () => {
    const res = await handleHtml(req('/app.js', 'ps_consent=granted'), env, asset);
    expect(await res.text()).toBe('js');
    expect(res.headers.get('vary')).toBeNull();
    await handleHtml(req('/', 'ps_consent=granted', { method: 'POST', body: 'x' }), env, asset);
    expect(gbFetch).not.toHaveBeenCalled();
  });

  it('exports the worker-first route patterns', () => {
    expect(WORKER_FIRST_ROUTES).toEqual(['/']);
  });
});
