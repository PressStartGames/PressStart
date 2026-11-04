// Every call carries the HttpOnly session cookie (credentials: 'include'); the page never sees a
// token. A 401 is retried once: two parallel calls right after the 5-minute access token expires
// can race on the single-use refresh token, and the retry picks up the cookie the winner set.
export const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? 'https://pressstartgames.net/api/v1';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly data: Record<string, unknown> = {},
  ) {
    super(code);
  }
}

export async function api<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
  });
  if (res.status === 401 && !retried && !path.startsWith('/auth/')) {
    await new Promise((r) => setTimeout(r, 250));
    return api<T>(path, init, true);
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new ApiError(res.status, String(data.error ?? 'error'), data);
  return data as T;
}

export const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

export interface Me {
  user: { id: string; email: string };
  organizationId: string | null;
  role: string | null;
  permissions: string[];
}

export interface Stats {
  total: number;
  confirmed: number;
  pending: number;
  lastWeek: number;
}

export interface SignupRow {
  email: string;
  role: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export interface BroadcastRow {
  id: string;
  subject: string;
  status: 'draft' | 'sending' | 'sent';
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  total: number;
  progress: { pending: number; sent: number; failed: number };
  body_md?: string;
}
