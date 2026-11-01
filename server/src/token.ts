// HMAC-SHA256 signed link tokens (WebCrypto): base64url(payload).base64url(signature).
export interface TokenPayload {
  e: string; // email
  p: 'confirm' | 'unsubscribe';
  t?: number; // issued at (ms)
}

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(s: string): Uint8Array | null {
  try {
    const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
    return Uint8Array.from(b, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function signToken(secret: string, payload: TokenPayload): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify({ ...payload, t: payload.t ?? Date.now() })));
  const sig = await crypto.subtle.sign('HMAC', await key(secret), enc.encode(body));
  return `${body}.${b64url(sig)}`;
}

export async function verifyToken(secret: string, token: string): Promise<TokenPayload | null> {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const sigBytes = unb64url(sig);
  if (!sigBytes) return null;
  const ok = await crypto.subtle.verify('HMAC', await key(secret), sigBytes, enc.encode(body));
  if (!ok) return null;
  const raw = unb64url(body);
  if (!raw) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(raw)) as TokenPayload;
    if (typeof payload.e !== 'string' || (payload.p !== 'confirm' && payload.p !== 'unsubscribe'))
      return null;
    return payload;
  } catch {
    return null;
  }
}
