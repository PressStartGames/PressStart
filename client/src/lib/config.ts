// Build-time configuration (CLAUDE.md "The client works with the server absent").
export type SignupMode =
  | { kind: 'endpoint'; url: string }
  | { kind: 'stub' }
  | { kind: 'fallback'; url: string }
  | { kind: 'none' };

function env(name: string): string {
  const v = (import.meta.env as Record<string, string | undefined>)[name];
  return (v ?? '').trim();
}

export function signupMode(): SignupMode {
  const endpoint = env('VITE_SIGNUP_ENDPOINT');
  if (endpoint === 'stub') return { kind: 'stub' };
  if (endpoint) return { kind: 'endpoint', url: endpoint.replace(/\/$/, '') };
  const fallback = env('VITE_SIGNUP_FALLBACK_URL');
  if (fallback) return { kind: 'fallback', url: fallback };
  return { kind: 'none' };
}

export const SITE_URL = env('VITE_SITE_URL').replace(/\/$/, '');
export const TURNSTILE_SITE_KEY = env('VITE_TURNSTILE_SITE_KEY');
export const BASE = import.meta.env.BASE_URL;
// React Router's basename follows Vite's base ("/" or "/<repo>/").
export const ROUTER_BASENAME = BASE.replace(/\/$/, '') || '/';
export const REPO_URL = 'https://github.com/PressStartGames/PressStartWeb';
// Bumped whenever CONTENT.md's `consent` line changes; the Worker stores it with the row.
export const CONSENT_VERSION = '2026-11-01';
// Analytics and flags (plans/main-site.md phases 4-5). All public build-time values, all optional: unset means off.
export const GA_MEASUREMENT_ID = env('VITE_GA_MEASUREMENT_ID');
export const ANALYTICS_ENABLED = GA_MEASUREMENT_ID !== '';
export const CF_BEACON_TOKEN = env('VITE_CF_BEACON_TOKEN');
export const GROWTHBOOK_CLIENT_KEY = env('VITE_GROWTHBOOK_CLIENT_KEY');
export const GROWTHBOOK_API_HOST = env('VITE_GROWTHBOOK_API_HOST') || 'https://cdn.growthbook.io';
// Feature flags: the flag layer (lib/flags.ts) backs FLAGS.joinBeta with GrowthBook, falling back to
// VITE_FLAG_JOIN_BETA. Components should prefer the useJoinBeta() hook; FLAGS.joinBeta keeps working.
export { FLAGS } from './flags';
