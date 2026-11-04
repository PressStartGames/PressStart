import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { processBroadcast, renderMail } from '../src/broadcast';
import type { Env } from '../src/env';
import worker from '../src/index';
import { markdownToHtml } from '../src/markdown';
import { COOKIE, seal } from '../src/session';
import { memoryD1 } from './d1';

// Access tokens in these tests are base64 JSON claims; verification is stubbed to decode them, so
// the routes see exactly the role and permissions a WorkOS token would carry.
vi.mock('../src/workos', async (orig) => {
  const real = await orig<typeof import('../src/workos')>();
  return {
    ...real,
    verifyAccessToken: vi.fn(async (_env: unknown, token: string) => {
      if (token === 'expired') throw new Error('expired');
      return JSON.parse(Buffer.from(token, 'base64url').toString());
    }),
    refresh: vi.fn(async () => {
      throw new real.WorkOSError(400, 'invalid_grant');
    }),
    revokeSession: vi.fn(async () => undefined),
  };
});

const ADMIN = 'https://admin.pressstartgames.net';
const OWNER = [
  'signups:read',
  'signups:export',
  'signups:delete',
  'broadcasts:read',
  'broadcasts:send',
  'users:manage',
];
const STAFF = ['signups:read', 'broadcasts:read'];

let env: Env;
let sent: Array<{ url: string; key: string | null; body: unknown }>;

function token(permissions: string[], role = 'owner') {
  return Buffer.from(
    JSON.stringify({ sub: 'user_1', sid: 'session_1', org_id: 'org_1', role, permissions }),
  ).toString('base64url');
}

async function cookie(permissions: string[] | null, role?: string) {
  if (!permissions) return '';
  const v = await seal(env.SESSION_SECRET, {
    a: token(permissions, role),
    r: 'refresh',
    e: 'founder@example.com',
  });
  return `${COOKIE}=${v}`;
}

async function call(
  method: string,
  path: string,
  opts: { perms?: string[] | null; origin?: string | null; body?: unknown } = {},
) {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  const c = await cookie(opts.perms === undefined ? OWNER : opts.perms);
  if (c) headers.cookie = c;
  const origin = opts.origin === undefined ? ADMIN : opts.origin;
  if (origin) headers.origin = origin;
  return worker.fetch(
    new Request(`https://pressstartgames.net/api/v1${path}`, {
      method,
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    }),
    env,
  );
}

async function addSignup(email: string, confirmed: boolean) {
  await env.DB.prepare(
    'INSERT INTO signups (email, role, consent_text_version, created_at, confirmed_at) VALUES (?, NULL, ?, ?, ?)',
  )
    .bind(email, 'v1', new Date().toISOString(), confirmed ? new Date().toISOString() : null)
    .run();
}

beforeEach(() => {
  env = {
    DB: memoryD1(),
    ALLOWED_ORIGINS: 'https://beta.pressstartgames.net',
    ADMIN_ORIGINS: ADMIN,
    SITE_URL: 'https://beta.pressstartgames.net',
    API_URL: 'https://api.test',
    MAIL_FROM: 'Press Start <beta@test>',
    CONFIRM_LINK_SECRET: 'link-secret',
    SESSION_SECRET: 'session-secret',
    WORKOS_API_KEY: 'sk_test',
    WORKOS_CLIENT_ID: 'client_test',
    RESEND_API_KEY: 're_test',
    DAILY_SEND_CAP: '1000',
  };
  sent = [];
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      const headers = new Headers(init.headers);
      sent.push({ url, key: headers.get('idempotency-key'), body: JSON.parse(String(init.body)) });
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const ADMIN_ROUTES: Array<[string, string, unknown?]> = [
  ['GET', '/admin/stats'],
  ['GET', '/admin/signups'],
  ['GET', '/admin/signups.csv'],
  ['DELETE', '/admin/signups/a%40b.co'],
  ['GET', '/admin/broadcasts'],
  ['GET', '/admin/broadcasts/x'],
  ['POST', '/admin/broadcasts', { subject: 's', body: 'b' }],
  ['POST', '/admin/broadcasts/x/test'],
  ['POST', '/admin/broadcasts/x/send', { confirmCount: 0 }],
];

describe('auth on every admin route', () => {
  it.each(ADMIN_ROUTES)('%s %s answers 401 without a session', async (m, p, b) => {
    expect((await call(m, p, { perms: null, body: b })).status).toBe(401);
  });

  it('answers 401 when the token is expired and the refresh fails', async () => {
    const v = await seal(env.SESSION_SECRET, { a: 'expired', r: 'used', e: 'x@y.z' });
    const res = await worker.fetch(
      new Request('https://pressstartgames.net/api/v1/admin/stats', {
        headers: { cookie: `${COOKIE}=${v}` },
      }),
      env,
    );
    expect(res.status).toBe(401);
  });

  it('refuses a tampered cookie', async () => {
    const res = await worker.fetch(
      new Request('https://pressstartgames.net/api/v1/admin/stats', {
        headers: { cookie: `${COOKIE}=abc.def` },
      }),
      env,
    );
    expect(res.status).toBe(401);
  });
});

describe('permissions (CASL)', () => {
  it('staff can read sign-ups and broadcasts', async () => {
    expect((await call('GET', '/admin/signups', { perms: STAFF })).status).toBe(200);
    expect((await call('GET', '/admin/broadcasts', { perms: STAFF })).status).toBe(200);
  });

  it.each([
    ['GET', '/admin/signups.csv', undefined],
    ['DELETE', '/admin/signups/a%40b.co', undefined],
    ['POST', '/admin/broadcasts', { subject: 's', body: 'b' }],
    ['POST', '/admin/broadcasts/x/send', { confirmCount: 1 }],
  ] as const)('staff gets 403 on %s %s', async (m, p, b) => {
    expect((await call(m, p, { perms: STAFF, body: b })).status).toBe(403);
  });

  it('a signed-in user with no permissions gets 403 everywhere', async () => {
    expect((await call('GET', '/admin/stats', { perms: [] })).status).toBe(403);
  });

  it('/auth/me returns the role and permissions from the token', async () => {
    const res = await call('GET', '/auth/me', { perms: STAFF });
    expect(await res.json()).toMatchObject({
      role: 'owner',
      permissions: STAFF,
      user: { email: 'founder@example.com' },
    });
  });
});

describe('CSRF and CORS', () => {
  it('refuses a state-changing request without an admin Origin', async () => {
    expect(
      (await call('POST', '/admin/broadcasts', { origin: null, body: { subject: 's', body: 'b' } }))
        .status,
    ).toBe(403);
    expect(
      (
        await call('POST', '/admin/broadcasts', {
          origin: 'https://evil.test',
          body: { subject: 's', body: 'b' },
        })
      ).status,
    ).toBe(403);
    expect(
      (await call('DELETE', '/admin/signups/a%40b.co', { origin: 'https://evil.test' })).status,
    ).toBe(403);
    expect(
      (
        await call('POST', '/auth/password', {
          origin: 'https://evil.test',
          body: { email: 'a@b.co', password: 'x' },
        })
      ).status,
    ).toBe(403);
  });

  it('gives credentialed CORS to the admin origin only', async () => {
    const ok = await call('GET', '/admin/stats');
    expect(ok.headers.get('access-control-allow-origin')).toBe(ADMIN);
    expect(ok.headers.get('access-control-allow-credentials')).toBe('true');
    const evil = await call('GET', '/admin/stats', { origin: 'https://evil.test' });
    expect(evil.headers.get('access-control-allow-origin')).toBeNull();
  });
});

describe('sign-ups', () => {
  it('lists, filters, counts and exports', async () => {
    await addSignup('a@example.com', true);
    await addSignup('b@example.com', false);
    expect(await (await call('GET', '/admin/stats')).json()).toMatchObject({
      total: 2,
      confirmed: 1,
      pending: 1,
    });
    const confirmed = (await (await call('GET', '/admin/signups?status=confirmed')).json()) as {
      rows: Array<{ email: string }>;
    };
    expect(confirmed.rows.map((r) => r.email)).toEqual(['a@example.com']);
    const search = (await (await call('GET', '/admin/signups?q=b%40')).json()) as { total: number };
    expect(search.total).toBe(1);
    const csv = await (await call('GET', '/admin/signups.csv')).text();
    expect(csv.split('\n')[0]).toBe('email,role,consent_text_version,created_at,confirmed_at');
    expect(csv).toContain('"a@example.com"');
  });

  it('deletes a row', async () => {
    await addSignup('gone@example.com', true);
    expect((await call('DELETE', '/admin/signups/gone%40example.com')).status).toBe(200);
    expect((await (await call('GET', '/admin/stats')).json()) as { total: number }).toMatchObject({
      total: 0,
    });
  });
});

describe('broadcasts', () => {
  async function draft() {
    const res = await call('POST', '/admin/broadcasts', {
      body: { subject: 'Version 1 is out', body: '# Hello\n\nIt is **ready**.' },
    });
    return ((await res.json()) as { id: string }).id;
  }

  it('sends to confirmed addresses only, after the typed count matches', async () => {
    await addSignup('c1@example.com', true);
    await addSignup('c2@example.com', true);
    await addSignup('p1@example.com', false);
    const id = await draft();
    expect(
      (await call('POST', `/admin/broadcasts/${id}/send`, { body: { confirmCount: 3 } })).status,
    ).toBe(409);
    expect(
      (await call('POST', `/admin/broadcasts/${id}/send`, { body: { confirmCount: 2 } })).status,
    ).toBe(202);
    const batches = sent.filter((s) => s.url.endsWith('/emails/batch'));
    const to = batches.flatMap((b) => (b.body as Array<{ to: string[] }>).map((m) => m.to[0]));
    expect(to.sort()).toEqual(['c1@example.com', 'c2@example.com']);
    const b = (await (await call('GET', `/admin/broadcasts/${id}`)).json()) as {
      status: string;
      progress: { sent: number };
    };
    expect(b).toMatchObject({ status: 'sent', progress: { sent: 2 } });
  });

  it('never sends twice: a second start is refused and a re-run sends nothing', async () => {
    await addSignup('c1@example.com', true);
    const id = await draft();
    await call('POST', `/admin/broadcasts/${id}/send`, { body: { confirmCount: 1 } });
    expect(
      (await call('POST', `/admin/broadcasts/${id}/send`, { body: { confirmCount: 1 } })).status,
    ).toBe(409);
    const before = sent.length;
    expect(await processBroadcast(env, id)).toBe(0);
    expect(sent.length).toBe(before);
  });

  it('resumes a crashed batch with the same idempotency key', async () => {
    for (let i = 0; i < 3; i++) await addSignup(`r${i}@example.com`, true);
    const id = await draft();
    // First run: Resend fails, rows stay claimed under one key.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        sent.push({
          url,
          key: new Headers(init.headers).get('idempotency-key'),
          body: JSON.parse(String(init.body)),
        });
        return new Response('{}', { status: 500 });
      }),
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await call('POST', `/admin/broadcasts/${id}/send`, { body: { confirmCount: 3 } });
    const firstKey = sent.at(-1)?.key;
    expect(firstKey).toBeTruthy();
    // Second run succeeds with the SAME key.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        sent.push({
          url,
          key: new Headers(init.headers).get('idempotency-key'),
          body: JSON.parse(String(init.body)),
        });
        return new Response('{}', { status: 200 });
      }),
    );
    expect(await processBroadcast(env, id)).toBe(3);
    expect(sent.at(-1)?.key).toBe(firstKey);
  });

  it('respects the daily cap and finishes on a later run', async () => {
    env.DAILY_SEND_CAP = '2';
    for (let i = 0; i < 3; i++) await addSignup(`d${i}@example.com`, true);
    const id = await draft();
    await call('POST', `/admin/broadcasts/${id}/send`, { body: { confirmCount: 3 } });
    let b = (await (await call('GET', `/admin/broadcasts/${id}`)).json()) as {
      status: string;
      progress: { sent: number; pending: number };
    };
    expect(b).toMatchObject({ status: 'sending', progress: { sent: 2, pending: 1 } });
    env.DAILY_SEND_CAP = '10';
    await processBroadcast(env, id);
    b = (await (await call('GET', `/admin/broadcasts/${id}`)).json()) as typeof b;
    expect(b).toMatchObject({ status: 'sent', progress: { sent: 3, pending: 0 } });
  });

  it('sends a test only to the signed-in user, marked [TEST]', async () => {
    await addSignup('c1@example.com', true);
    const id = await draft();
    expect((await call('POST', `/admin/broadcasts/${id}/test`)).status).toBe(200);
    const mail = sent.at(-1)?.body as { to: string[]; subject: string };
    expect(mail.to).toEqual(['founder@example.com']);
    expect(mail.subject).toBe('[TEST] Version 1 is out');
  });

  it('puts a signed one-click unsubscribe link in every mail', async () => {
    const m = await renderMail(env, { subject: 's', body_md: 'Hi' }, 'x@example.com');
    expect(m.html).toMatch(/https:\/\/api\.test\/api\/unsubscribe\?t=[\w-]+\.[\w-]+/);
    expect(m.text).toContain('https://api.test/api/unsubscribe?t=');
    expect(m.headers['List-Unsubscribe']).toMatch(/^<https:\/\/api\.test\/api\/unsubscribe\?t=/);
    expect(m.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
  });
});

describe('markdown', () => {
  it('escapes HTML and drops unsafe links', () => {
    const html = markdownToHtml('<script>x</script> [a](javascript:alert(1)) [b](https://ok.test)');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('<a href="https://ok.test">b</a>');
  });
});

describe('public routes under /api/v1', () => {
  it('health answers on both prefixes', async () => {
    for (const p of ['/api/health', '/api/v1/health']) {
      const res = await worker.fetch(new Request(`https://pressstartgames.net${p}`), env);
      expect(await res.json()).toEqual({ ok: true });
    }
  });
});
