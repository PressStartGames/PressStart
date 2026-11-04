// /api/v1/admin/*: every route needs a session (401) and a permission (403), checked with CASL.
import type { Action, Subject } from './ability';
import { adminCors, getSession, originAllowed, type Session } from './auth';
import { progress, processBroadcast, sendOne, startBroadcast, type Broadcast } from './broadcast';
import { json, type Env } from './env';
import { normaliseEmail } from './email';

type Handler = (ctx: {
  request: Request;
  env: Env;
  url: URL;
  session: Session;
  params: string[];
  exec?: ExecutionContext;
}) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  can: [Action, Subject];
  handler: Handler;
}

const PAGE_MAX = 200;

async function body(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function signupFilter(url: URL): { where: string; args: unknown[] } {
  const status = url.searchParams.get('status') ?? 'all';
  const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
  const parts: string[] = [];
  const args: unknown[] = [];
  if (status === 'confirmed') parts.push('confirmed_at IS NOT NULL');
  if (status === 'pending') parts.push('confirmed_at IS NULL');
  if (q) {
    parts.push("(email LIKE ? ESCAPE '\\' OR IFNULL(role, '') LIKE ? ESCAPE '\\')");
    const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    args.push(like, like);
  }
  return { where: parts.length ? `WHERE ${parts.join(' AND ')}` : '', args };
}

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  // Neutralise spreadsheet formulas, then quote.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

const routes: Route[] = [
  {
    method: 'GET',
    pattern: /^\/admin\/stats$/,
    can: ['read', 'Signup'],
    async handler({ env }) {
      const r = await env.DB.prepare(
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN confirmed_at IS NOT NULL THEN 1 ELSE 0 END) AS confirmed,
                SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS week
         FROM signups`,
      )
        .bind(new Date(Date.now() - 7 * 864e5).toISOString())
        .first<{ total: number; confirmed: number | null; week: number | null }>();
      const total = r?.total ?? 0;
      const confirmed = r?.confirmed ?? 0;
      return json(200, { total, confirmed, pending: total - confirmed, lastWeek: r?.week ?? 0 });
    },
  },
  {
    method: 'GET',
    pattern: /^\/admin\/signups$/,
    can: ['read', 'Signup'],
    async handler({ env, url }) {
      const { where, args } = signupFilter(url);
      const pageSize = Math.min(
        PAGE_MAX,
        Math.max(1, Number(url.searchParams.get('pageSize') ?? 50) || 50),
      );
      const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
      const count = await env.DB.prepare(`SELECT COUNT(*) AS n FROM signups ${where}`)
        .bind(...args)
        .first<{ n: number }>();
      const rows = await env.DB.prepare(
        `SELECT email, role, created_at, confirmed_at FROM signups ${where}
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      )
        .bind(...args, pageSize, (page - 1) * pageSize)
        .all();
      return json(200, { total: count?.n ?? 0, page, pageSize, rows: rows.results });
    },
  },
  {
    method: 'GET',
    pattern: /^\/admin\/signups\.csv$/,
    can: ['export', 'Signup'],
    async handler({ env, url, request }) {
      const { where, args } = signupFilter(url);
      const rows = await env.DB.prepare(
        `SELECT email, role, consent_text_version, created_at, confirmed_at FROM signups ${where}
         ORDER BY created_at`,
      )
        .bind(...args)
        .all<Record<string, unknown>>();
      const cols = ['email', 'role', 'consent_text_version', 'created_at', 'confirmed_at'];
      const csv = [
        cols.join(','),
        ...rows.results.map((r) => cols.map((c) => csvCell(r[c])).join(',')),
      ].join('\n');
      return new Response(csv + '\n', {
        headers: {
          ...adminCors(env, request.headers.get('origin')),
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="signups-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/admin\/signups\/(.+)$/,
    can: ['delete', 'Signup'],
    async handler({ env, params }) {
      const email = normaliseEmail(decodeURIComponent(params[0] ?? ''));
      const r = await env.DB.prepare('DELETE FROM signups WHERE email = ?').bind(email).run();
      await env.DB.prepare('DELETE FROM broadcast_recipients WHERE email = ?').bind(email).run();
      return json(r.meta.changes ? 200 : 404, { deleted: r.meta.changes });
    },
  },
  {
    method: 'GET',
    pattern: /^\/admin\/broadcasts$/,
    can: ['read', 'Broadcast'],
    async handler({ env }) {
      const rows = await env.DB.prepare(
        'SELECT id, subject, status, created_at, started_at, finished_at, total FROM broadcasts ORDER BY created_at DESC LIMIT 100',
      ).all<Broadcast>();
      const withProgress = await Promise.all(
        rows.results.map(async (b) => ({ ...b, progress: await progress(env, b.id) })),
      );
      return json(200, { rows: withProgress });
    },
  },
  {
    method: 'GET',
    pattern: /^\/admin\/broadcasts\/([\w-]+)$/,
    can: ['read', 'Broadcast'],
    async handler({ env, params }) {
      const b = await env.DB.prepare('SELECT * FROM broadcasts WHERE id = ?')
        .bind(params[0])
        .first<Broadcast>();
      if (!b) return json(404, { error: 'not-found' });
      return json(200, { ...b, progress: await progress(env, b.id) });
    },
  },
  {
    method: 'POST',
    pattern: /^\/admin\/broadcasts$/,
    can: ['send', 'Broadcast'],
    async handler({ env, request, session }) {
      const b = await body(request);
      const subject = typeof b.subject === 'string' ? b.subject.trim().slice(0, 200) : '';
      const bodyMd = typeof b.body === 'string' ? b.body.slice(0, 50_000) : '';
      if (!subject || !bodyMd.trim()) return json(400, { error: 'subject-and-body-required' });
      const id = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO broadcasts (id, subject, body_md, status, created_by, created_at) VALUES (?, ?, ?, 'draft', ?, ?)",
      )
        .bind(id, subject, bodyMd, session.claims.sub ?? 'unknown', new Date().toISOString())
        .run();
      return json(201, { id });
    },
  },
  {
    method: 'POST',
    pattern: /^\/admin\/broadcasts\/([\w-]+)\/test$/,
    can: ['send', 'Broadcast'],
    async handler({ env, params, session }) {
      const b = await env.DB.prepare('SELECT * FROM broadcasts WHERE id = ?')
        .bind(params[0])
        .first<Broadcast>();
      if (!b) return json(404, { error: 'not-found' });
      if (!session.email) return json(400, { error: 'no-email-on-session' });
      await sendOne(env, { ...b, subject: `[TEST] ${b.subject}` }, session.email);
      return json(200, { sentTo: session.email });
    },
  },
  {
    method: 'POST',
    pattern: /^\/admin\/broadcasts\/([\w-]+)\/send$/,
    can: ['send', 'Broadcast'],
    async handler({ env, params, request, exec }) {
      const b = await body(request);
      const typed = Number(b.confirmCount);
      if (!Number.isInteger(typed)) return json(400, { error: 'confirm-count-required' });
      const id = params[0] ?? '';
      const r = await startBroadcast(env, id, typed);
      if (!r.ok)
        return json(r.reason === 'not-found' ? 404 : 409, { error: r.reason, count: r.count });
      const work = processBroadcast(env, id).catch((e) => console.error('broadcast', String(e)));
      if (exec) exec.waitUntil(work);
      else await work;
      return json(202, { id, total: r.total });
    },
  },
];

export async function handleAdmin(
  path: string,
  request: Request,
  env: Env,
  exec?: ExecutionContext,
): Promise<Response> {
  const cors = adminCors(env, request.headers.get('origin'));
  if (!originAllowed(env, request)) return json(403, { error: 'origin' }, cors);
  const session = await getSession(env, request);
  const extra: Record<string, string> = {
    ...cors,
    ...(session?.setCookie ? { 'set-cookie': session.setCookie } : {}),
  };
  const withHeaders = (res: Response) => {
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(extra)) out.headers.set(k, v);
    return out;
  };
  for (const route of routes) {
    if (route.method !== request.method) continue;
    const m = route.pattern.exec(path);
    if (!m) continue;
    if (!session) return withHeaders(json(401, { error: 'unauthenticated' }));
    if (!session.ability.can(...route.can)) return withHeaders(json(403, { error: 'forbidden' }));
    return withHeaders(
      await route.handler({
        request,
        env,
        url: new URL(request.url),
        session,
        params: m.slice(1),
        exec,
      }),
    );
  }
  return withHeaders(json(404, { error: 'not-found' }));
}
