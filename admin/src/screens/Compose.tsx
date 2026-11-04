import { useEffect, useId, useState, type FormEvent } from 'react';
import { markdownToHtml } from '../../../server/src/markdown';
import { api, ApiError, post, type BroadcastRow, type Stats } from '../api';

// Write the mail, see exactly what will be sent (the Worker uses the same renderer), mail yourself
// a test, then send to every confirmed address after typing their count.
export function Compose({ onSent }: { onSent: () => void }) {
  const id = useId();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [savedAs, setSavedAs] = useState({ subject: '', body: '' });
  const [confirmed, setConfirmed] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    api<Stats>('/admin/stats')
      .then((s) => setConfirmed(s.confirmed))
      .catch(() => setConfirmed(null));
  }, []);

  const dirty = !draftId || subject !== savedAs.subject || body !== savedAs.body;

  // Drafts are immutable once sent; any edit makes a new draft.
  const ensureDraft = async (): Promise<string> => {
    if (draftId && !dirty) return draftId;
    const r = await post<{ id: string }>('/admin/broadcasts', { subject, body });
    setDraftId(r.id);
    setSavedAs({ subject, body });
    return r.id;
  };

  const run = async (what: () => Promise<string>) => {
    setBusy(true);
    setStatus('');
    try {
      setStatus(await what());
    } catch (e) {
      if (e instanceof ApiError && e.code === 'count-mismatch')
        setStatus(
          `The count does not match: ${String(e.data.count)} confirmed addresses right now.`,
        );
      else if (e instanceof ApiError && e.code === 'subject-and-body-required')
        setStatus('Write a subject and a body first.');
      else setStatus('Something failed. Nothing was sent to the list.');
    } finally {
      setBusy(false);
    }
  };

  const sendTest = () =>
    run(async () => {
      const draft = await ensureDraft();
      const r = await post<{ sentTo: string }>(`/admin/broadcasts/${draft}/test`);
      return `Test sent to ${r.sentTo}.`;
    });

  const sendAll = (e: FormEvent) => {
    e.preventDefault();
    return run(async () => {
      const draft = await ensureDraft();
      const r = await post<{ total: number }>(`/admin/broadcasts/${draft}/send`, {
        confirmCount: Number(typed),
      });
      setTimeout(onSent, 1200);
      return `Sending to ${r.total} confirmed addresses. Follow it in History.`;
    });
  };

  const ready = subject.trim() !== '' && body.trim() !== '';
  const countOk = confirmed !== null && typed === String(confirmed) && confirmed > 0;

  return (
    <section aria-labelledby="compose-title">
      <h1 id="compose-title">Compose</h1>
      <div className="compose">
        <div className="editor">
          <label htmlFor={`${id}-subject`}>Subject</label>
          <input
            id={`${id}-subject`}
            value={subject}
            maxLength={200}
            onChange={(e) => setSubject(e.target.value)}
          />
          <label htmlFor={`${id}-body`}>
            Body{' '}
            <span className="hint">
              Markdown: # heading, **bold**, *italic*, [link](https://…), - lists
            </span>
          </label>
          <textarea
            id={`${id}-body`}
            rows={16}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div className="preview">
          <p className="label">preview</p>
          <div className="mail">
            <p className="mail-subject">{subject || 'No subject yet'}</p>
            <div
              className="mail-body"
              // The renderer escapes all HTML and keeps only http(s)/mailto links.
              dangerouslySetInnerHTML={{ __html: markdownToHtml(body) }}
            />
            <p className="mail-foot">
              You get this because you confirmed your address for the Press Start beta. Unsubscribe
              and delete my address.
            </p>
          </div>
        </div>
      </div>
      <div className="actions">
        <button type="button" className="key ghost" disabled={!ready || busy} onClick={sendTest}>
          Send test to me
        </button>
      </div>
      <form className="sendall" onSubmit={sendAll}>
        <p>
          Every confirmed address gets this mail, each with its own unsubscribe link.{' '}
          <strong>{confirmed ?? '…'} confirmed addresses.</strong> Type that number to send.
        </p>
        <label htmlFor={`${id}-count`}>Recipient count</label>
        <div className="row">
          <input
            id={`${id}-count`}
            inputMode="numeric"
            value={typed}
            onChange={(e) => setTyped(e.target.value.replace(/\D/g, ''))}
          />
          <button type="submit" className="key danger" disabled={!ready || !countOk || busy}>
            Send to all confirmed
          </button>
        </div>
      </form>
      <p className="status" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}

export type { BroadcastRow };
