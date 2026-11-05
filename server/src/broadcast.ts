// Sending a broadcast to the confirmed list. The recipients are snapshotted into
// broadcast_recipients when the send starts; each batch of up to 100 is CLAIMED (status 'claimed'
// plus a batch key) before Resend is called, the batch key doubles as Resend's Idempotency-Key, and
// rows are marked 'sent' after. A crash between the call and the update leaves 'claimed' rows that
// the next run re-sends with the SAME key, which Resend deduplicates (24 h), so nobody gets the mail
// twice. A daily cap (Resend free plan: 100/day) pauses the send; the cron trigger resumes it.
import { deliveryFor, mailMode } from './delivery';
import type { Env } from './env';
import { markdownToHtml, markdownToText } from './markdown';
import { signToken } from './token';

export const BATCH = 100;

export interface Broadcast {
  id: string;
  subject: string;
  body_md: string;
  status: 'draft' | 'sending' | 'sent';
  created_by: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  total: number;
}

export function dailyCap(env: Env): number {
  const n = Number(env.DAILY_SEND_CAP ?? 100);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 100;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

async function sentToday(env: Env): Promise<number> {
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM broadcast_recipients WHERE status = 'sent' AND sent_at >= ?",
  )
    .bind(`${todayUtc()}T00:00:00.000Z`)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function unsubscribeUrl(env: Env, email: string): Promise<string> {
  const t = await signToken(env.CONFIRM_LINK_SECRET, { e: email, p: 'unsubscribe' });
  return `${env.API_URL}/api/v1/unsubscribe?t=${t}`;
}

export async function renderMail(env: Env, b: Pick<Broadcast, 'subject' | 'body_md'>, to: string) {
  const unsubscribe = await unsubscribeUrl(env, to);
  const html = `<!doctype html><html lang="en"><body style="font-family:system-ui,sans-serif;line-height:1.55;color:#111318;max-width:600px">
${markdownToHtml(b.body_md)}
<hr style="border:0;border-top:1px solid #c3c8cf;margin:32px 0 16px">
<p style="color:#5a6169;font-size:13px">You get this because you confirmed your address for the Press Start beta. <a href="${unsubscribe}" style="color:#5a6169">Unsubscribe and delete my address</a>.</p>
</body></html>`;
  const text = `${markdownToText(b.body_md)}\n\n--\nYou get this because you confirmed your address for the Press Start beta.\nUnsubscribe and delete your address: ${unsubscribe}`;
  return {
    from: env.MAIL_FROM,
    to: [to],
    subject: b.subject,
    html,
    text,
    headers: {
      'List-Unsubscribe': `<${unsubscribe}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}

type Mail = Awaited<ReturnType<typeof renderMail>>;

async function resendBatch(env: Env, all: Mail[], idempotencyKey: string): Promise<void> {
  const mails = all.filter((m) => deliveryFor(env, m.to[0] ?? '') === 'send');
  if (mails.length === 0) {
    console.log(
      `[batch not sent: ${mailMode(env)}] ${all.length} mails, none deliverable key=${idempotencyKey}`,
    );
    return;
  }
  const res = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
      'idempotency-key': idempotencyKey,
    },
    body: JSON.stringify(mails),
  });
  if (!res.ok) throw new Error(`resend batch ${res.status}`);
}

export async function sendOne(env: Env, b: Pick<Broadcast, 'subject' | 'body_md'>, to: string) {
  const mail = await renderMail(env, b, to);
  const delivery = deliveryFor(env, to);
  if (delivery !== 'send') {
    console.log(`[test mail not sent: ${delivery}] to=${to}`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify(mail),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
}

// Snapshot the confirmed list into the recipient table and flip the broadcast to 'sending'.
// Refuses unless the caller typed the same recipient count the server sees.
export async function startBroadcast(
  env: Env,
  id: string,
  typedCount: number,
): Promise<{ ok: true; total: number } | { ok: false; reason: string; count?: number }> {
  const b = await env.DB.prepare('SELECT * FROM broadcasts WHERE id = ?')
    .bind(id)
    .first<Broadcast>();
  if (!b) return { ok: false, reason: 'not-found' };
  if (b.status !== 'draft') return { ok: false, reason: 'already-started' };
  const count =
    (
      await env.DB.prepare(
        'SELECT COUNT(*) AS n FROM signups WHERE confirmed_at IS NOT NULL',
      ).first<{ n: number }>()
    )?.n ?? 0;
  if (typedCount !== count) return { ok: false, reason: 'count-mismatch', count };
  if (count === 0) return { ok: false, reason: 'no-recipients', count };
  const now = new Date().toISOString();
  const started = await env.DB.prepare(
    "UPDATE broadcasts SET status = 'sending', started_at = ?, total = ? WHERE id = ? AND status = 'draft'",
  )
    .bind(now, count, id)
    .run();
  if (!started.meta.changes) return { ok: false, reason: 'already-started' };
  await env.DB.prepare(
    `INSERT INTO broadcast_recipients (broadcast_id, email, status)
     SELECT ?, email, 'pending' FROM signups WHERE confirmed_at IS NOT NULL
     ON CONFLICT (broadcast_id, email) DO NOTHING`,
  )
    .bind(id)
    .run();
  return { ok: true, total: count };
}

// Send what the daily cap allows for one broadcast. Returns how many were sent this run.
export async function processBroadcast(env: Env, id: string): Promise<number> {
  const b = await env.DB.prepare('SELECT * FROM broadcasts WHERE id = ?')
    .bind(id)
    .first<Broadcast>();
  if (!b || b.status !== 'sending') return 0;
  let sent = 0;
  for (;;) {
    const room = dailyCap(env) - (await sentToday(env));
    if (room <= 0) break;
    // Claimed rows from a crashed run go first, with their original key.
    const stale = await env.DB.prepare(
      "SELECT batch_key FROM broadcast_recipients WHERE broadcast_id = ? AND status = 'claimed' LIMIT 1",
    )
      .bind(id)
      .first<{ batch_key: string }>();
    let key = stale?.batch_key;
    if (!key) {
      key = `${id}-${crypto.randomUUID()}`;
      const claim = await env.DB.prepare(
        `UPDATE broadcast_recipients SET status = 'claimed', batch_key = ?
         WHERE broadcast_id = ? AND email IN (
           SELECT email FROM broadcast_recipients WHERE broadcast_id = ? AND status = 'pending'
           ORDER BY email LIMIT ?)`,
      )
        .bind(key, id, id, Math.min(BATCH, room))
        .run();
      if (!claim.meta.changes) break;
    }
    const rows = await env.DB.prepare(
      "SELECT email FROM broadcast_recipients WHERE broadcast_id = ? AND batch_key = ? AND status = 'claimed'",
    )
      .bind(id, key)
      .all<{ email: string }>();
    const emails = rows.results.map((r) => r.email);
    if (!emails.length) break;
    const mails = await Promise.all(emails.map((e) => renderMail(env, b, e)));
    try {
      await resendBatch(env, mails, key);
    } catch (e) {
      console.error('broadcast batch failed', id, String(e));
      break; // leave the rows claimed; the next run retries with the same key
    }
    await env.DB.prepare(
      "UPDATE broadcast_recipients SET status = 'sent', sent_at = ? WHERE broadcast_id = ? AND batch_key = ? AND status = 'claimed'",
    )
      .bind(new Date().toISOString(), id, key)
      .run();
    sent += emails.length;
  }
  const left = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM broadcast_recipients WHERE broadcast_id = ? AND status IN ('pending', 'claimed')",
  )
    .bind(id)
    .first<{ n: number }>();
  if ((left?.n ?? 0) === 0) {
    await env.DB.prepare(
      "UPDATE broadcasts SET status = 'sent', finished_at = ? WHERE id = ? AND status = 'sending'",
    )
      .bind(new Date().toISOString(), id)
      .run();
  }
  return sent;
}

export async function processAll(env: Env): Promise<void> {
  const open = await env.DB.prepare(
    "SELECT id FROM broadcasts WHERE status = 'sending' ORDER BY started_at",
  ).all<{ id: string }>();
  for (const { id } of open.results) await processBroadcast(env, id);
}

export async function progress(env: Env, id: string) {
  const rows = await env.DB.prepare(
    'SELECT status, COUNT(*) AS n FROM broadcast_recipients WHERE broadcast_id = ? GROUP BY status',
  )
    .bind(id)
    .all<{ status: string; n: number }>();
  const by = Object.fromEntries(rows.results.map((r) => [r.status, r.n]));
  return {
    pending: (by.pending ?? 0) + (by.claimed ?? 0),
    sent: by.sent ?? 0,
    failed: by.failed ?? 0,
  };
}
