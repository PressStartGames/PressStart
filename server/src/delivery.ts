// Where a mail may go, by environment (plans/main-site.md Phase 6). MAIL_MODE:
//   log        never send: the mail is logged (local development)
//   allowlist  send through Resend ONLY to MAIL_ALLOWLIST (exact addresses or "@domain" entries); everything
//              else is logged as blocked (staging: no mail to a real sign-up, ever)
//   live       send to everyone (production)
// Unset: "live" when RESEND_API_KEY is set, otherwise "log" (the behaviour before modes existed).
// An unknown value is treated as "log": a typo must never send mail.
import type { Env } from './env';

export type MailMode = 'log' | 'allowlist' | 'live';
export type Delivery = 'send' | 'log' | 'blocked';

export function mailMode(env: Pick<Env, 'MAIL_MODE' | 'RESEND_API_KEY'>): MailMode {
  const raw = (env.MAIL_MODE ?? '').trim().toLowerCase();
  if (raw === 'log' || raw === 'allowlist' || raw === 'live') return raw;
  if (raw) return 'log';
  return env.RESEND_API_KEY ? 'live' : 'log';
}

export function allowlisted(env: Pick<Env, 'MAIL_ALLOWLIST'>, to: string): boolean {
  const address = to.trim().toLowerCase();
  return (env.MAIL_ALLOWLIST ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) => (entry.startsWith('@') ? address.endsWith(entry) : address === entry));
}

export function deliveryFor(
  env: Pick<Env, 'MAIL_MODE' | 'MAIL_ALLOWLIST' | 'RESEND_API_KEY'>,
  to: string,
): Delivery {
  const mode = mailMode(env);
  if (mode === 'log' || !env.RESEND_API_KEY) return 'log';
  if (mode === 'allowlist' && !allowlisted(env, to)) return 'blocked';
  return 'send';
}
