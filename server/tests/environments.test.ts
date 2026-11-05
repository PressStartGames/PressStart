import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendOne } from '../src/broadcast';
import { allowlisted, deliveryFor, mailMode } from '../src/delivery';
import type { Env } from '../src/env';
import worker from '../src/index';
import { clearCookie, cookieName, COOKIE, seal, sessionCookie } from '../src/session';
import { memoryD1 } from './d1';

vi.mock('../src/workos', async (orig) => {
  const real = await orig<typeof import('../src/workos')>();
  return {
    ...real,
    verifyAccessToken: vi.fn(async (_env: unknown, token: string) =>
      JSON.parse(Buffer.from(token, 'base64url').toString()),
    ),
    refresh: vi.fn(async () => {
      throw new real.WorkOSError(400, 'invalid_grant');
    }),
    revokeSession: vi.fn(async () => undefined),
  };
});

const base = (over: Partial<Env> = {}): Env => ({
  DB: memoryD1(),
  ALLOWED_ORIGINS: 'https://staging.pressstartgames.net',
  ADMIN_ORIGINS: 'https://admin-staging.pressstartgames.net',
  SITE_URL: 'https://staging.pressstartgames.net/beta',
  API_URL: 'https://staging.pressstartgames.net',
  MAIL_FROM: 'Press Start <beta@test>',
  CONFIRM_LINK_SECRET: 'link-secret',
  SESSION_SECRET: 'session-secret',
  WORKOS_API_KEY: 'sk_test',
  WORKOS_CLIENT_ID: 'client_test',
  ...over,
});

let resend: Array<{ to: string[] }>;
beforeEach(() => {
  resend = [];
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: RequestInit) => {
      resend.push(JSON.parse(String(init.body)));
      return new Response('{}', { status: 200 });
    }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('mail mode', () => {
  it('defaults to live with a Resend key and to log without one (the old behaviour)', () => {
    expect(mailMode({ RESEND_API_KEY: 're_x' })).toBe('live');
    expect(mailMode({})).toBe('log');
  });

  it('treats an unknown value as log, never live', () => {
    expect(mailMode({ MAIL_MODE: 'liv', RESEND_API_KEY: 're_x' })).toBe('log');
  });

  it('matches allowlist entries by address and by @domain, case-insensitively', () => {
    const env = { MAIL_ALLOWLIST: 'Founder@Example.com, @pressstartgames.net' };
    expect(allowlisted(env, 'founder@example.com')).toBe(true);
    expect(allowlisted(env, 'anyone@pressstartgames.net')).toBe(true);
    expect(allowlisted(env, 'anyone@evilpressstartgames.net')).toBe(false);
    expect(allowlisted(env, 'other@example.com')).toBe(false);
    expect(allowlisted({}, 'a@b.co')).toBe(false);
  });

  it('log never sends; allowlist sends only to the list; live sends', () => {
    const key = { RESEND_API_KEY: 're_x', MAIL_ALLOWLIST: '@pressstartgames.net' };
    expect(deliveryFor({ ...key, MAIL_MODE: 'log' }, 'a@pressstartgames.net')).toBe('log');
    expect(deliveryFor({ ...key, MAIL_MODE: 'allowlist' }, 'a@pressstartgames.net')).toBe('send');
    expect(deliveryFor({ ...key, MAIL_MODE: 'allowlist' }, 'a@gmail.com')).toBe('blocked');
    expect(deliveryFor({ ...key, MAIL_MODE: 'live' }, 'a@gmail.com')).toBe('send');
    expect(deliveryFor({ MAIL_MODE: 'live' }, 'a@gmail.com')).toBe('log'); // no key, nothing to send with
  });

  const signup = (env: Env, email: string) =>
    worker.fetch(
      new Request('https://staging.pressstartgames.net/api/v1/waitlist', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'https://staging.pressstartgames.net',
        },
        body: JSON.stringify({ email, role: 'AI tools', website: '', consentVersion: 'v1' }),
      }),
      env,
    );

  it('staging: a real sign-up address gets no mail, our own address does', async () => {
    const env = base({
      MAIL_MODE: 'allowlist',
      MAIL_ALLOWLIST: '@pressstartgames.net',
      RESEND_API_KEY: 're_x',
    });
    expect((await signup(env, 'stranger@gmail.com')).status).toBe(200);
    expect(resend).toHaveLength(0);
    expect((await signup(env, 'me@pressstartgames.net')).status).toBe(200);
    expect(resend).toHaveLength(1);
    expect(resend[0]?.to).toEqual(['me@pressstartgames.net']);
  });

  it('local: log mode sends nothing even with a key', async () => {
    const env = base({ MAIL_MODE: 'log', RESEND_API_KEY: 're_x' });
    await signup(env, 'me@pressstartgames.net');
    expect(resend).toHaveLength(0);
  });

  it('production: live sends to anyone', async () => {
    const env = base({ MAIL_MODE: 'live', RESEND_API_KEY: 're_x' });
    await signup(env, 'stranger@gmail.com');
    expect(resend).toHaveLength(1);
  });

  it('a test mail from the admin follows the same rule', async () => {
    const env = base({
      MAIL_MODE: 'allowlist',
      MAIL_ALLOWLIST: 'ok@x.test',
      RESEND_API_KEY: 're_x',
    });
    await sendOne(env, { subject: 's', body_md: 'b' }, 'nope@x.test');
    expect(resend).toHaveLength(0);
    await sendOne(env, { subject: 's', body_md: 'b' }, 'ok@x.test');
    expect(resend).toHaveLength(1);
  });
});

describe('session cookie per environment', () => {
  it('production keeps its name and scope', () => {
    expect(cookieName({})).toBe('ps_session');
    expect(sessionCookie('v', '.pressstartgames.net', cookieName({}))).toBe(
      'ps_session=v; Path=/api/v1; Max-Age=604800; HttpOnly; Secure; SameSite=Lax; Domain=.pressstartgames.net',
    );
  });

  it('staging uses its own name and a host-only cookie (no Domain)', () => {
    const name = cookieName({ SESSION_COOKIE_NAME: 'ps_session_staging' });
    expect(name).toBe('ps_session_staging');
    const set = sessionCookie('v', undefined, name);
    expect(set.startsWith('ps_session_staging=v;')).toBe(true);
    expect(set).not.toMatch(/Domain=/);
    expect(clearCookie(undefined, name)).toMatch(/^ps_session_staging=; .*Max-Age=0/);
  });

  it('ignores a malformed cookie name', () => {
    expect(cookieName({ SESSION_COOKIE_NAME: 'bad name;x' })).toBe(COOKIE);
  });

  async function stats(env: Env, cookieHeader: string) {
    return worker.fetch(
      new Request('https://staging.pressstartgames.net/api/v1/admin/stats', {
        headers: { cookie: cookieHeader, origin: 'https://admin-staging.pressstartgames.net' },
      }),
      env,
    );
  }

  it('a production-named session is not accepted by staging, and staging own is', async () => {
    const env = base({ SESSION_COOKIE_NAME: 'ps_session_staging' });
    const access = Buffer.from(
      JSON.stringify({
        sub: 'u',
        sid: 's',
        org_id: 'o',
        role: 'owner',
        permissions: ['signups:read'],
      }),
    ).toString('base64url');
    const v = await seal(env.SESSION_SECRET, { a: access, r: 'r', e: 'f@x.test' });
    expect((await stats(env, `ps_session=${v}`)).status).toBe(401);
    expect((await stats(env, `ps_session_staging=${v}`)).status).toBe(200);
  });
});
