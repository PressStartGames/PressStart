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
export const REPO_URL = 'https://github.com/PressStartGames/PressStart';
// Bumped whenever CONTENT.md's `consent` line changes; the Worker stores it with the row.
export const CONSENT_VERSION = '2026-11-01';
