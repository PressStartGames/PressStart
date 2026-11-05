// /api/v1/auth/*: our own sign-in screens talk to these; these talk to WorkOS. The session is a
// sealed HttpOnly cookie (session.ts). Every state-changing request must come from an admin origin.
import { abilityFor, type AppAbility } from './ability';
import { hashKey, json, type Env } from './env';
import { normaliseEmail, validEmail } from './email';
import {
  clearCookie,
  cookieName,
  readCookie,
  seal,
  sessionCookie,
  unseal,
  type SessionData,
} from './session';
import {
  refresh,
  revokeSession,
  sendCode,
  signInWithCode,
  signInWithPassword,
  verifyAccessToken,
  WorkOSError,
  type AccessClaims,
  type AuthResult,
} from './workos';

export interface Session {
  claims: AccessClaims;
  email: string;
  ability: AppAbility;
  setCookie?: string; // set when the access token was refreshed during this request
}

export function adminOrigins(env: Env): string[] {
  return env.ADMIN_ORIGINS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function adminCors(env: Env, origin: string | null): Record<string, string> {
  if (!origin || !adminOrigins(env).includes(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '600',
    vary: 'origin',
  };
}

// CSRF: the cookie is SameSite=Lax, and on top of that a state-changing request must carry an
// Origin header from the admin app.
export function originAllowed(env: Env, request: Request): boolean {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS')
    return true;
  const origin = request.headers.get('origin');
  return Boolean(origin && adminOrigins(env).includes(origin));
}

export async function getSession(env: Env, request: Request): Promise<Session | null> {
  const raw = readCookie(request, cookieName(env));
  if (!raw) return null;
  const data = await unseal(env.SESSION_SECRET, raw);
  if (!data) return null;
  try {
    const claims = await verifyAccessToken(env, data.a);
    return { claims, email: data.e, ability: abilityFor(claims.permissions) };
  } catch {
    // Expired (5 min) or otherwise invalid: one refresh attempt.
    try {
      const fresh = await refresh(env, data.r);
      const claims = await verifyAccessToken(env, fresh.access_token);
      const sealed = await seal(env.SESSION_SECRET, {
        a: fresh.access_token,
        r: fresh.refresh_token,
        e: fresh.user?.email ?? data.e,
      });
      return {
        claims,
        email: fresh.user?.email ?? data.e,
        ability: abilityFor(claims.permissions),
        setCookie: sessionCookie(sealed, env.COOKIE_DOMAIN, cookieName(env)),
      };
    } catch {
      return null;
    }
  }
}

export function sessionView(s: Session) {
  return {
    user: { id: s.claims.sub, email: s.email },
    organizationId: s.claims.org_id ?? null,
    role: s.claims.role ?? null,
    permissions: s.claims.permissions ?? [],
  };
}

async function limited(env: Env, request: Request, email: string): Promise<boolean> {
  if (!env.AUTH_LIMITER) return false;
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const [a, b] = await Promise.all([
    env.AUTH_LIMITER.limit({ key: `ip:${await hashKey(ip)}` }),
    env.AUTH_LIMITER.limit({ key: `em:${await hashKey(email)}` }),
  ]);
  return !a.success || !b.success;
}

async function startSession(env: Env, result: AuthResult, cors: Record<string, string>) {
  const data: SessionData = {
    a: result.access_token,
    r: result.refresh_token,
    e: result.user.email,
  };
  const claims = await verifyAccessToken(env, result.access_token);
  const sealed = await seal(env.SESSION_SECRET, data);
  return json(
    200,
    sessionView({ claims, email: result.user.email, ability: abilityFor(claims.permissions) }),
    { ...cors, 'set-cookie': sessionCookie(sealed, env.COOKIE_DOMAIN, cookieName(env)) },
  );
}

async function body(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

// One answer for every failed sign-in, so the reply never tells which part was wrong.
const denied = (cors: Record<string, string>) => json(401, { error: 'invalid-credentials' }, cors);

export async function handleAuth(
  path: string,
  request: Request,
  env: Env,
  ctx?: ExecutionContext,
): Promise<Response> {
  const cors = adminCors(env, request.headers.get('origin'));
  if (!originAllowed(env, request)) return json(403, { error: 'origin' }, cors);

  if (path === '/auth/me' && request.method === 'GET') {
    const s = await getSession(env, request);
    if (!s) return json(401, { error: 'unauthenticated' }, cors);
    return json(200, sessionView(s), {
      ...cors,
      ...(s.setCookie ? { 'set-cookie': s.setCookie } : {}),
    });
  }

  if (path === '/auth/password' && request.method === 'POST') {
    const b = await body(request);
    const email = normaliseEmail(str(b.email));
    const password = str(b.password);
    if (!validEmail(email) || !password) return denied(cors);
    if (await limited(env, request, email)) return json(429, { error: 'rate-limited' }, cors);
    try {
      return await startSession(env, await signInWithPassword(env, email, password), cors);
    } catch (e) {
      if (e instanceof WorkOSError) return denied(cors);
      throw e;
    }
  }

  if (path === '/auth/code/send' && request.method === 'POST') {
    const b = await body(request);
    const email = normaliseEmail(str(b.email));
    if (!validEmail(email)) return json(400, { error: 'invalid-email' }, cors);
    if (await limited(env, request, email)) return json(429, { error: 'rate-limited' }, cors);
    const work = sendCode(env, email).catch((e) => console.error('send code', String(e)));
    if (ctx) ctx.waitUntil(work);
    else await work;
    return json(200, { ok: true }, cors); // same answer whether or not the address exists
  }

  if (path === '/auth/code/verify' && request.method === 'POST') {
    const b = await body(request);
    const email = normaliseEmail(str(b.email));
    const code = str(b.code).replace(/\s+/g, '');
    if (!validEmail(email) || !/^\d{6}$/.test(code)) return denied(cors);
    if (await limited(env, request, email)) return json(429, { error: 'rate-limited' }, cors);
    try {
      return await startSession(env, await signInWithCode(env, email, code), cors);
    } catch (e) {
      if (e instanceof WorkOSError) return denied(cors);
      throw e;
    }
  }

  if (path === '/auth/logout' && request.method === 'POST') {
    const s = await getSession(env, request);
    if (s?.claims.sid) await revokeSession(env, s.claims.sid).catch(() => undefined);
    return json(
      200,
      { ok: true },
      { ...cors, 'set-cookie': clearCookie(env.COOKIE_DOMAIN, cookieName(env)) },
    );
  }

  return json(404, { error: 'not-found' }, cors);
}
