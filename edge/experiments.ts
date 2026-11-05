// The edge handler for HTML routes with a live experiment (plans/main-site.md phase 5). Pure: a Request in,
// a Response out, the static assets passed in, no Cloudflare-only imports, so it unit-tests under Node.
//
//   no consent signal (ps_consent=granted)  -> the control page, no cookie, no GrowthBook call
//   consent, a stored assignment            -> that variant's prerendered page
//   consent, none stored                    -> evaluate GrowthBook (features cached 60 s), serve the variant,
//                                              store the assignment (ps_exp) and a random visitor id (ps_vid)
//   anything else (other routes, errors)    -> straight through to the assets
import { GrowthBook, type FeatureDefinition } from '@growthbook/growthbook';
import {
  CONSENT_COOKIE,
  CONSENT_GRANTED,
  EXPERIMENTS,
  EXPERIMENT_COOKIE,
  VISITOR_COOKIE,
  formatAssignments,
  parseAssignments,
  variantPath,
  type ExperimentDef,
} from './config';

export interface EdgeEnv {
  /** The GrowthBook SDK connection's client key (public). Unset -> no experiment is live. */
  GROWTHBOOK_CLIENT_KEY?: string;
  /** Defaults to https://cdn.growthbook.io */
  GROWTHBOOK_API_HOST?: string;
}

export interface Assets {
  fetch(request: Request): Promise<Response>;
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;
const FEATURES_TTL_MS = 60_000;
const FEATURES_TIMEOUT_MS = 1_500;

type Features = Record<string, FeatureDefinition>;
let cache: { key: string; at: number; features: Features } | undefined;
let inflight: Promise<Features | undefined> | undefined;

export function resetFeatureCache(): void {
  cache = undefined;
  inflight = undefined;
}

async function loadFeatures(env: EdgeEnv): Promise<Features | undefined> {
  const key = env.GROWTHBOOK_CLIENT_KEY;
  if (!key) return undefined;
  const now = Date.now();
  if (cache && cache.key === key && now - cache.at < FEATURES_TTL_MS) return cache.features;
  inflight ??= (async () => {
    try {
      const host = (env.GROWTHBOOK_API_HOST ?? 'https://cdn.growthbook.io').replace(/\/$/, '');
      const res = await fetch(`${host}/api/features/${key}`, {
        signal: AbortSignal.timeout(FEATURES_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`GrowthBook answered ${res.status}`);
      const body = (await res.json()) as { features?: Features };
      const features = body.features ?? {};
      cache = { key, at: Date.now(), features };
      return features;
    } catch {
      return cache?.key === key ? cache.features : undefined; // fail open: the last good payload, or none
    } finally {
      inflight = undefined;
    }
  })();
  return inflight;
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function cookie(name: string, value: string, secure: boolean): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function experimentFor(pathname: string): ExperimentDef | undefined {
  const p = pathname.replace(/index\.html$/, '');
  return EXPERIMENTS.find((e) => e.route === p);
}

// A response that depends on the Cookie header must not be shared between visitors by any cache.
function varied(res: Response, setCookies: string[] = []): Response {
  const out = new Response(res.body, res);
  out.headers.append('Vary', 'Cookie');
  out.headers.set('Cache-Control', 'private, no-cache');
  for (const c of setCookies) out.headers.append('Set-Cookie', c);
  return out;
}

async function serveVariant(
  request: Request,
  assets: Assets,
  exp: ExperimentDef,
  variant: string,
): Promise<Response | undefined> {
  if (variant === exp.control) return undefined;
  const url = new URL(request.url);
  url.pathname = variantPath(exp, variant);
  url.search = '';
  const res = await assets.fetch(new Request(url, request));
  return res.ok ? res : undefined;
}

export async function handleHtml(
  request: Request,
  env: EdgeEnv,
  assets: Assets,
): Promise<Response> {
  const url = new URL(request.url);
  const exp = experimentFor(url.pathname);
  if (!exp || (request.method !== 'GET' && request.method !== 'HEAD')) return assets.fetch(request);

  const cookies = parseCookies(request.headers.get('cookie'));
  if (cookies[CONSENT_COOKIE] !== CONSENT_GRANTED) return varied(await assets.fetch(request));

  const secure = url.protocol === 'https:';
  const stored = parseAssignments(cookies[EXPERIMENT_COOKIE]);
  let variant = stored[exp.id];
  const setCookies: string[] = [];

  if (!variant || !exp.variants.includes(variant)) {
    const features = await loadFeatures(env);
    variant = exp.control;
    if (features?.[exp.id]) {
      const visitor = cookies[VISITOR_COOKIE] || crypto.randomUUID();
      const gb = new GrowthBook({ features, attributes: { id: visitor } });
      const result = gb.evalFeature<string>(exp.id);
      gb.destroy();
      const value = String(result.value);
      if (result.source === 'experiment' && exp.variants.includes(value)) {
        variant = value;
        setCookies.push(
          cookie(EXPERIMENT_COOKIE, formatAssignments({ ...stored, [exp.id]: variant }), secure),
          cookie(VISITOR_COOKIE, visitor, secure),
        );
      } else if (result.source === 'force' && exp.variants.includes(value)) {
        variant = value; // a forced value is served but not stored: it is not an assignment
      }
    }
  }

  const served = await serveVariant(request, assets, exp, variant);
  if (!served) return varied(await assets.fetch(request), setCookies);
  return varied(served, setCookies);
}
