// The Press Start API: one Cloudflare Worker + D1.
// Public (also under /api/v1/, served at https://pressstartgames.net/api/v1/*):
//   POST /api/waitlist        honeypot -> Turnstile -> validate -> insert -> confirmation mail (Resend)
//   GET  /api/confirm?t=      sets confirmed_at, redirects to the site's /confirmed
//   GET|POST /api/unsubscribe?t=  deletes the row (POST = one-click List-Unsubscribe)
//   GET  /api/health
// Auth (WorkOS behind our own screens):   /api/v1/auth/*   — see auth.ts
// Admin (CASL permissions per route):     /api/v1/admin/*  — see admin.ts
// A cron trigger continues unfinished broadcasts (broadcast.ts).
// No IP and no user agent are stored. CORS admits only ALLOWED_ORIGINS / ADMIN_ORIGINS.
import { handleAdmin } from './admin';
import { adminCors, handleAuth } from './auth';
import { processAll } from './broadcast';
import { deliveryFor } from './delivery';
import { json, type Env } from './env';
import { alreadySubscribedMail, confirmationMail } from './mail';
import { normaliseEmail, validEmail } from './email';
import { signToken, verifyToken } from './token';

export type { Env } from './env';

interface WaitlistBody {
  email?: unknown;
  role?: unknown;
  website?: unknown;
  turnstileToken?: unknown;
  consentVersion?: unknown;
}

const ROLES = new Set(['Games with AI agents', 'AI tools', 'Bevy projects', 'Something else']);
const RESEND_COOLDOWN_MS = 10 * 60 * 1000;

function corsHeaders(env: Env, origin: string | null): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!origin || !allowed.includes(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'origin',
  };
}

async function verifyTurnstile(env: Env, token: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

async function sendMail(
  env: Env,
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<void> {
  const delivery = deliveryFor(env, to);
  if (delivery !== 'send') {
    console.log(`[mail not sent: ${delivery}] to=${to} subject=${subject}\n${text}`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, text, html }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
}

async function sendConfirmation(env: Env, email: string): Promise<void> {
  const confirm = `${env.API_URL}/api/v1/confirm?t=${await signToken(env.CONFIRM_LINK_SECRET, { e: email, p: 'confirm' })}`;
  const unsubscribe = `${env.API_URL}/api/v1/unsubscribe?t=${await signToken(env.CONFIRM_LINK_SECRET, { e: email, p: 'unsubscribe' })}`;
  const mail = confirmationMail({ confirm, unsubscribe });
  await sendMail(env, email, mail.subject, mail.text, mail.html);
  await env.DB.prepare('UPDATE signups SET confirm_sent_at = ? WHERE email = ?')
    .bind(new Date().toISOString(), email)
    .run();
}

// For an already-confirmed address re-submitting: mail the inbox owner that they are
// already on the list (the web response stays identical to a new sign-up, so it never
// discloses membership). Reuses confirm_sent_at as the send cooldown.
async function sendAlreadySubscribed(env: Env, email: string): Promise<void> {
  const unsubscribe = `${env.API_URL}/api/v1/unsubscribe?t=${await signToken(env.CONFIRM_LINK_SECRET, { e: email, p: 'unsubscribe' })}`;
  const mail = alreadySubscribedMail({ unsubscribe });
  await sendMail(env, email, mail.subject, mail.text, mail.html);
  await env.DB.prepare('UPDATE signups SET confirm_sent_at = ? WHERE email = ?')
    .bind(new Date().toISOString(), email)
    .run();
}

async function rateLimited(env: Env, request: Request): Promise<boolean> {
  if (!env.RATE_LIMITER) return false;
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  const key = Array.from(new Uint8Array(digest).slice(0, 8), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
  const { success } = await env.RATE_LIMITER.limit({ key });
  return !success;
}

export async function handleWaitlist(request: Request, env: Env): Promise<Response> {
  const cors = corsHeaders(env, request.headers.get('origin'));
  if (await rateLimited(env, request)) return json(429, { status: 'error' }, cors);

  let body: WaitlistBody;
  try {
    body = (await request.json()) as WaitlistBody;
  } catch {
    return json(400, { status: 'invalid' }, cors);
  }
  // The honeypot: a person never sees the field, so anything in it is a bot. Answer as if fine.
  if (typeof body.website === 'string' && body.website.trim() !== '')
    return json(200, { status: 'ok', mail: true }, cors);

  const email = normaliseEmail(typeof body.email === 'string' ? body.email : '');
  if (!validEmail(email)) return json(400, { status: 'invalid' }, cors);
  const role = typeof body.role === 'string' && ROLES.has(body.role) ? body.role : null;
  const consentVersion =
    typeof body.consentVersion === 'string' ? body.consentVersion.slice(0, 32) : 'unknown';

  if (
    !(await verifyTurnstile(
      env,
      typeof body.turnstileToken === 'string' ? body.turnstileToken : '',
    ))
  ) {
    return json(403, { status: 'error' }, cors);
  }

  const existing = await env.DB.prepare(
    'SELECT confirmed_at, confirm_sent_at FROM signups WHERE email = ?',
  )
    .bind(email)
    .first<{ confirmed_at: string | null; confirm_sent_at: string | null }>();

  if (existing) {
    if (existing.confirmed_at) {
      // Same reply as a new sign-up — the web response never reveals whether an address
      // is already on the list (no enumeration). The already-subscribed notice goes to
      // the inbox owner only, rate-limited by the same cooldown as the confirmation.
      const last = existing.confirm_sent_at ? Date.parse(existing.confirm_sent_at) : 0;
      if (Date.now() - last > RESEND_COOLDOWN_MS) await sendAlreadySubscribed(env, email);
      return json(200, { status: 'ok', mail: Boolean(env.RESEND_API_KEY) }, cors);
    }
    const last = existing.confirm_sent_at ? Date.parse(existing.confirm_sent_at) : 0;
    if (Date.now() - last > RESEND_COOLDOWN_MS) await sendConfirmation(env, email);
    return json(200, { status: 'ok', mail: Boolean(env.RESEND_API_KEY) }, cors);
  }

  await env.DB.prepare(
    'INSERT INTO signups (email, role, consent_text_version, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING',
  )
    .bind(email, role, consentVersion, new Date().toISOString())
    .run();
  await sendConfirmation(env, email);
  return json(200, { status: 'ok', mail: Boolean(env.RESEND_API_KEY) }, cors);
}

export async function handleConfirm(url: URL, env: Env): Promise<Response> {
  const payload = await verifyToken(env.CONFIRM_LINK_SECRET, url.searchParams.get('t') ?? '');
  if (!payload || payload.p !== 'confirm')
    return new Response('This link is not valid.', { status: 400 });
  await env.DB.prepare(
    'UPDATE signups SET confirmed_at = COALESCE(confirmed_at, ?) WHERE email = ?',
  )
    .bind(new Date().toISOString(), payload.e)
    .run();
  return Response.redirect(`${env.SITE_URL}/confirmed`, 303);
}

export async function handleUnsubscribe(url: URL, env: Env): Promise<Response> {
  const payload = await verifyToken(env.CONFIRM_LINK_SECRET, url.searchParams.get('t') ?? '');
  if (!payload || payload.p !== 'unsubscribe')
    return new Response('This link is not valid.', { status: 400 });
  await env.DB.prepare('DELETE FROM signups WHERE email = ?').bind(payload.e).run();
  await env.DB.prepare('DELETE FROM broadcast_recipients WHERE email = ?').bind(payload.e).run();
  return new Response('You are unsubscribed and your address is deleted.', {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx?: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    // /api/v1/x and /api/x are the same public routes; auth and admin exist only under /api/v1.
    const v1 = url.pathname.startsWith('/api/v1/');
    const path = v1 ? url.pathname.slice('/api/v1'.length) : url.pathname.replace(/^\/api/, '');
    const isPrivate = v1 && (path.startsWith('/auth/') || path.startsWith('/admin/'));
    const cors = isPrivate
      ? adminCors(env, request.headers.get('origin'))
      : corsHeaders(env, request.headers.get('origin'));
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    try {
      if (v1 && path.startsWith('/auth/')) return await handleAuth(path, request, env, ctx);
      if (v1 && path.startsWith('/admin/')) return await handleAdmin(path, request, env, ctx);
      if (!url.pathname.startsWith('/api/')) return json(404, { status: 'not-found' });
      if (path === '/waitlist' && request.method === 'POST')
        return await handleWaitlist(request, env);
      if (path === '/confirm' && request.method === 'GET') return await handleConfirm(url, env);
      if (path === '/unsubscribe' && (request.method === 'GET' || request.method === 'POST'))
        return await handleUnsubscribe(url, env);
      if (path === '/health') return json(200, { ok: true });
      return json(404, { status: 'not-found' }, cors);
    } catch (e) {
      console.error(e);
      return json(500, { status: 'error' }, cors);
    }
  },
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(processAll(env));
  },
} satisfies ExportedHandler<Env>;
