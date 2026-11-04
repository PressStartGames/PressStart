import { useEffect, useState } from 'react';
import { api, type BroadcastRow } from '../api';

const date = (s: string | null) => (s ? s.slice(0, 16).replace('T', ' ') : '—');

// Every broadcast with its progress; refreshes every 5 s while one is sending.
export function History() {
  const [rows, setRows] = useState<BroadcastRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    let timer = 0;
    const load = async () => {
      try {
        const r = await api<{ rows: BroadcastRow[] }>('/admin/broadcasts');
        if (!alive) return;
        setRows(r.rows);
        if (r.rows.some((b) => b.status === 'sending')) timer = window.setTimeout(load, 5000);
      } catch {
        if (alive) setError('Could not load the history.');
      }
    };
    load();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <section aria-labelledby="history-title">
      <h1 id="history-title">History</h1>
      <p className="status" role="status" aria-live="polite">
        {error}
      </p>
      <div className="screen">
        <table className="table">
          <caption className="sr-only">Broadcasts, newest first</caption>
          <thead>
            <tr>
              <th scope="col">Subject</th>
              <th scope="col">Status</th>
              <th scope="col">Progress</th>
              <th scope="col">Created</th>
              <th scope="col">Finished</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((b) => {
              const done = b.progress.sent;
              const pct = b.total ? Math.round((done / b.total) * 100) : 0;
              return (
                <tr key={b.id}>
                  <td>{b.subject}</td>
                  <td className={`mono status-${b.status}`}>{b.status}</td>
                  <td>
                    {b.status === 'draft' ? (
                      <span className="mono">—</span>
                    ) : (
                      <span className="progress">
                        <span
                          className="meter"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={b.total}
                          aria-valuenow={done}
                          aria-label={`${done} of ${b.total} sent`}
                        >
                          <span style={{ width: `${pct}%` }} />
                        </span>
                        <span className="mono">
                          {done}/{b.total}
                          {b.progress.failed ? ` · ${b.progress.failed} failed` : ''}
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="mono">{date(b.created_at)}</td>
                  <td className="mono">{date(b.finished_at)}</td>
                </tr>
              );
            })}
            {rows && !rows.length && (
              <tr>
                <td colSpan={5} className="empty">
                  No broadcasts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="hint">
        A large send pauses at the daily cap and continues automatically every 15 minutes.
      </p>
    </section>
  );
}
