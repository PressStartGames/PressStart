export interface RateLimiter {
  limit: (opts: { key: string }) => Promise<{ success: boolean }>;
}

export interface Env {
  DB: D1Database;
  ALLOWED_ORIGINS: string; // comma-separated public site origins (the sign-up form)
  ADMIN_ORIGINS: string; // comma-separated admin app origins (credentialed CORS)
  SITE_URL: string; // where /confirmed lives
  API_URL: string; // this Worker's public origin (for the links in the mail)
  MAIL_FROM: string;
  COOKIE_DOMAIN?: string; // ".pressstartgames.net" in production
  DAILY_SEND_CAP?: string; // broadcast mails per UTC day (Resend free plan: 100)
  TURNSTILE_SECRET_KEY?: string; // unset locally -> Turnstile is skipped
  RESEND_API_KEY?: string; // unset locally -> the mail is logged, not sent
  CONFIRM_LINK_SECRET: string;
  SESSION_SECRET: string;
  WORKOS_API_KEY: string;
  WORKOS_CLIENT_ID: string;
  RATE_LIMITER?: RateLimiter;
  AUTH_LIMITER?: RateLimiter;
}

export function json(status: number, body: unknown, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

export async function hashKey(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest).slice(0, 8), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}
