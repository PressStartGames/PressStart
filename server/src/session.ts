// The admin session: WorkOS's access and refresh tokens (plus the user's email, so a test mail can
// be sent without another API call) sealed with AES-GCM under SESSION_SECRET, in one HttpOnly,
// Secure, SameSite=Lax cookie scoped to the API path. Page scripts can never read it.

// Production's name; other environments set SESSION_COOKIE_NAME (staging: ps_session_staging) and no
// COOKIE_DOMAIN, so a session never crosses environments.
export const COOKIE = 'ps_session';
export function cookieName(env: { SESSION_COOKIE_NAME?: string }): string {
  const n = (env.SESSION_COOKIE_NAME ?? '').trim();
  return /^[A-Za-z0-9_-]+$/.test(n) ? n : COOKIE;
}
const MAX_AGE = 7 * 24 * 60 * 60; // the cookie lives a week; the refresh token decides the rest

export interface SessionData {
  a: string; // WorkOS access token (JWT)
  r: string; // WorkOS refresh token
  e: string; // email of the signed-in user
}

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(u8: Uint8Array): string {
  let s = '';
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(s: string): Uint8Array {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

async function aesKey(secret: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(`ps-session:${secret}`));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function seal(secret: string, data: SessionData): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      await aesKey(secret),
      enc.encode(JSON.stringify(data)),
    ),
  );
  return `${b64url(iv)}.${b64url(ct)}`;
}

export async function unseal(secret: string, value: string): Promise<SessionData | null> {
  try {
    const [iv, ct] = value.split('.');
    if (!iv || !ct) return null;
    const pt = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: unb64url(iv) },
      await aesKey(secret),
      unb64url(ct),
    );
    const data = JSON.parse(dec.decode(pt)) as SessionData;
    return typeof data.a === 'string' && typeof data.r === 'string' ? data : null;
  } catch {
    return null;
  }
}

export function readCookie(request: Request, name = COOKIE): string | null {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

// Domain is set only when configured (production: ".pressstartgames.net"); locally the cookie is
// host-only so `wrangler dev` and the tests work on localhost.
export function sessionCookie(value: string, domain?: string, name = COOKIE): string {
  return [
    `${name}=${value}`,
    'Path=/api/v1',
    `Max-Age=${MAX_AGE}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    domain ? `Domain=${domain}` : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function clearCookie(domain?: string, name = COOKIE): string {
  return [
    `${name}=`,
    'Path=/api/v1',
    'Max-Age=0',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    domain ? `Domain=${domain}` : '',
  ]
    .filter(Boolean)
    .join('; ');
}
