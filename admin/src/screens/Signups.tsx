import { useCallback, useEffect, useState } from 'react';
import { Can } from '../ability';
import { api, API_BASE, type SignupRow, type Stats } from '../api';

const PAGE = 50;
type Status = 'all' | 'confirmed' | 'pending';

const date = (s: string | null) => (s ? s.slice(0, 16).replace('T', ' ') : '—');

export function Signups() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<SignupRow[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<Status>('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [note, setNote] = useState('');

  const query = `status=${status}&q=${encodeURIComponent(q)}`;
  const load = useCallback(async () => {
    const [s, list] = await Promise.all([
      api<Stats>('/admin/stats'),
      api<{ total: number; rows: SignupRow[] }>(
        `/admin/signups?${query}&page=${page}&pageSize=${PAGE}`,
      ),
    ]);
    setStats(s);
    setRows(list.rows);
    setTotal(list.total);
  }, [query, page]);

  useEffect(() => {
    // Deferred so the effect only subscribes; the state updates land in a later task.
    const t = setTimeout(() => load().catch(() => setNote('Could not load the list.')));
    return () => clearTimeout(t);
  }, [load]);

  const remove = async (email: string) => {
    if (!window.confirm(`Delete ${email} from the list? This cannot be undone.`)) return;
    await api(`/admin/signups/${encodeURIComponent(email)}`, { method: 'DELETE' });
    setNote(`Deleted ${email}.`);
    await load();
  };

  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <section aria-labelledby="signups-title">
      <h1 id="signups-title">Sign-ups</h1>
      <dl className="stats">
        {(
          [
            ['total', stats?.total],
            ['confirmed', stats?.confirmed],
            ['pending', stats?.pending],
            ['last 7 days', stats?.lastWeek],
          ] as const
        ).map(([label, n]) => (
          <div key={label} className="stat">
            <dt>{label}</dt>
            <dd>{n ?? '…'}</dd>
          </div>
        ))}
      </dl>
      <div className="toolbar">
        <label className="field">
          <span>Show</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as Status);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        <label className="field grow">
          <span>Search</span>
          <input
            type="search"
            value={q}
            placeholder="email or role"
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <Can I="export" a="Signup">
          <a className="key ghost" href={`${API_BASE}/admin/signups.csv?${query}`}>
            Export CSV
          </a>
        </Can>
      </div>
      <p className="status" role="status" aria-live="polite">
        {note}
      </p>
      <div className="screen">
        <table className="table">
          <caption className="sr-only">Sign-ups, newest first</caption>
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">Builds</th>
              <th scope="col">Signed up</th>
              <th scope="col">Confirmed</th>
              <Can I="delete" a="Signup">
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </Can>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.email}>
                <td className="mono">{r.email}</td>
                <td>{r.role ?? '—'}</td>
                <td className="mono">{date(r.created_at)}</td>
                <td className={`mono ${r.confirmed_at ? 'ok' : 'wait'}`}>
                  {r.confirmed_at ? date(r.confirmed_at) : 'pending'}
                </td>
                <Can I="delete" a="Signup">
                  <td>
                    <button
                      type="button"
                      className="link danger"
                      onClick={() => remove(r.email)}
                      aria-label={`Delete ${r.email}`}
                    >
                      Delete
                    </button>
                  </td>
                </Can>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="empty">
                  Nothing here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <nav className="pager" aria-label="Pages">
        <button
          type="button"
          className="key ghost"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span className="mono">
          page {page} / {pages} · {total} rows
        </span>
        <button
          type="button"
          className="key ghost"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </nav>
    </section>
  );
}
