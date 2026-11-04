// WorkOS User Management over its REST API (no SDK: plain fetch runs on Workers). Our own screens
// collect the email, password or code; WorkOS holds the users, password hashes and roles.
// Reference: https://workos.com/docs/reference/authkit/authentication
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

export interface WorkOSEnv {
  WORKOS_API_KEY: string;
  WORKOS_CLIENT_ID: string;
}

export interface AuthResult {
  user: { id: string; email: string; first_name?: string | null; last_name?: string | null };
  organization_id?: string;
  access_token: string;
  refresh_token: string;
}

export interface AccessClaims extends JWTPayload {
  sid?: string;
  org_id?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
}

const API = 'https://api.workos.com';

export class WorkOSError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(`workos ${status} ${code}`);
  }
}

async function call<T>(env: WorkOSEnv, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env.WORKOS_API_KEY}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new WorkOSError(res.status, String(body.code ?? body.error ?? 'error'));
  return body as T;
}

function authenticate(env: WorkOSEnv, body: Record<string, string>): Promise<AuthResult> {
  return call<AuthResult>(env, '/user_management/authenticate', {
    method: 'POST',
    body: JSON.stringify({
      client_id: env.WORKOS_CLIENT_ID,
      client_secret: env.WORKOS_API_KEY,
      ...body,
    }),
  });
}

export const signInWithPassword = (env: WorkOSEnv, email: string, password: string) =>
  authenticate(env, { grant_type: 'password', email, password });

export const signInWithCode = (env: WorkOSEnv, email: string, code: string) =>
  authenticate(env, { grant_type: 'urn:workos:oauth:grant-type:magic-auth:code', email, code });

export const refresh = (env: WorkOSEnv, refreshToken: string) =>
  authenticate(env, { grant_type: 'refresh_token', refresh_token: refreshToken });

// Only existing users get a code: the endpoint never creates accounts, and its reply is the same
// either way (no enumeration).
export async function sendCode(env: WorkOSEnv, email: string): Promise<void> {
  const users = await call<{ data: unknown[] }>(
    env,
    `/user_management/users?email=${encodeURIComponent(email)}&limit=1`,
  );
  if (!users.data.length) return;
  await call(env, '/user_management/magic_auth', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function revokeSession(env: WorkOSEnv, sessionId: string): Promise<void> {
  await call(env, '/user_management/sessions/revoke', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  });
}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export async function verifyAccessToken(env: WorkOSEnv, token: string): Promise<AccessClaims> {
  let jwks = jwksCache.get(env.WORKOS_CLIENT_ID);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${API}/sso/jwks/${env.WORKOS_CLIENT_ID}`));
    jwksCache.set(env.WORKOS_CLIENT_ID, jwks);
  }
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `${API}/user_management/${env.WORKOS_CLIENT_ID}`,
  });
  return payload as AccessClaims;
}
