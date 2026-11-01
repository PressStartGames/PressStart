import { beforeEach, describe, expect, it, vi } from 'vitest';
import worker, { type Env } from '../src/index';
import { normaliseEmail, validEmail } from '../src/email';
import { signToken, verifyToken } from '../src/token';

// A small in-memory D1 that understands the five statements the Worker issues.
interface Row {
  email: string;
  role: string | null;
  consent_text_version: string;
  created_at: string;
  confirm_sent_at: string | null;
  confirmed_at: string | null;
}

function fakeDb(rows: Map<string, Row>) {
  const prepare = (sql: string) => ({
    bind: (...args: unknown[]) => ({
      first: async () => {
        if (sql.startsWith('SELECT')) {
          const r = rows.get(String(args[0]));
          return r ? { confirmed_at: r.confirmed_at, confirm_sent_at: r.confirm_sent_at } : null;
        }
        throw new Error('unexpected first(): ' + sql);
      },
      run: async () => {
        if (sql.startsWith('INSERT')) {
          const [email, role, consent, created] = args as [string, string | null, string, string];
          if (!rows.has(email))
            rows.set(email, {
              email,
              role,
              consent_text_version: consent,
              created_at: created,
              confirm_sent_at: null,
              confirmed_at: null,
            });
        } else if (sql.startsWith('UPDATE signups SET confirm_sent_at')) {
          const r = rows.get(String(args[1]));
          if (r) r.confirm_sent_at = String(args[0]);
        } else if (sql.startsWith('UPDATE signups SET confirmed_at')) {
          const r = rows.get(String(args[1]));
          if (r) r.confirmed_at = r.confirmed_at ?? String(args[0]);
        } else if (sql.startsWith('DELETE')) {
          rows.delete(String(args[0]));
        } else throw new Error('unexpected run(): ' + sql);
        return { success: true };
      },
    }),
  });
  return { prepare } as unknown as D1Database;
}

const rows = new Map<string, Row>();
const env: Env = {
  DB: fakeDb(rows),
  ALLOWED_ORIGINS: 'https://site.test',
  SITE_URL: 'https://site.test/PressStart',
  API_URL: 'https://api.test',
  MAIL_FROM: 'Press Start <beta@test>',
  CONFIRM_LINK_SECRET: 'secret',
};

const post = (body: unknown, origin = 'https://site.test') =>
  worker.fetch(
    new Request('https://api.test/api/waitlist', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin },
      body: JSON.stringify(body),
    }),
    env,
  );

beforeEach(() => {
  rows.clear();
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('email helpers', () => {
  it('normalises and validates', () => {
    expect(normaliseEmail('  A@B.CO ')).toBe('a@b.co');
    expect(validEmail('a@b.co')).toBe(true);
    expect(validEmail('a@b')).toBe(false);
  });
});

describe('tokens', () => {
  it('round-trips and refuses tampering', async () => {
    const t = await signToken('s', { e: 'a@b.co', p: 'confirm' });
    expect(await verifyToken('s', t)).toMatchObject({ e: 'a@b.co', p: 'confirm' });
    expect(await verifyToken('other', t)).toBeNull();
    expect(await verifyToken('s', t.slice(0, -2) + 'xx')).toBeNull();
    expect(await verifyToken('s', 'garbage')).toBeNull();
  });
});

describe('POST /api/waitlist', () => {
  it('stores a new address unconfirmed and answers ok, with CORS for the site', async () => {
    const res = await post({
      email: 'New@Example.com',
      role: 'AI tools',
      website: '',
      consentVersion: 'v1',
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok', mail: false });
    expect(res.headers.get('access-control-allow-origin')).toBe('https://site.test');
    const row = rows.get('new@example.com');
    expect(row).toMatchObject({ role: 'AI tools', consent_text_version: 'v1', confirmed_at: null });
    expect(row?.confirm_sent_at).toBeTruthy();
  });

  it('answers existing for a confirmed address', async () => {
    await post({ email: 'dup@example.com' });
    rows.get('dup@example.com')!.confirmed_at = '2026-01-01T00:00:00.000Z';
    const res = await post({ email: 'dup@example.com' });
    expect(await res.json()).toEqual({ status: 'existing' });
  });

  it('refuses a bad address', async () => {
    const res = await post({ email: 'nope' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ status: 'invalid' });
  });

  it('swallows a honeypot hit without storing anything', async () => {
    const res = await post({ email: 'bot@example.com', website: 'http://spam' });
    expect(res.status).toBe(200);
    expect(rows.size).toBe(0);
  });

  it('refuses a missing Turnstile token when a secret is configured', async () => {
    const strict = { ...env, TURNSTILE_SECRET_KEY: 'k' };
    const res = await worker.fetch(
      new Request('https://api.test/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.co' }),
      }),
      strict,
    );
    expect(res.status).toBe(403);
  });

  it('gives no CORS headers to an unknown origin', async () => {
    const res = await post({ email: 'a@b.co' }, 'https://evil.test');
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
});

describe('confirm and unsubscribe', () => {
  it('confirms through a signed link and redirects to /confirmed', async () => {
    await post({ email: 'c@example.com' });
    const t = await signToken('secret', { e: 'c@example.com', p: 'confirm' });
    const res = await worker.fetch(new Request(`https://api.test/api/confirm?t=${t}`), env);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('https://site.test/PressStart/confirmed');
    expect(rows.get('c@example.com')?.confirmed_at).toBeTruthy();
  });

  it('does not confirm with an unsubscribe token, and deletes on unsubscribe', async () => {
    await post({ email: 'u@example.com' });
    const wrong = await signToken('secret', { e: 'u@example.com', p: 'unsubscribe' });
    expect(
      (await worker.fetch(new Request(`https://api.test/api/confirm?t=${wrong}`), env)).status,
    ).toBe(400);
    const res = await worker.fetch(new Request(`https://api.test/api/unsubscribe?t=${wrong}`), env);
    expect(res.status).toBe(200);
    expect(rows.has('u@example.com')).toBe(false);
  });
});
