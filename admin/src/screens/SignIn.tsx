import { useId, useState, type FormEvent } from 'react';
import { ApiError, post, type Me } from '../api';

type Mode = 'password' | 'code';

// Our own sign-in screen. Email first, then a password or a one-time code mailed by WorkOS.
// Failure messages never say which part was wrong.
export function SignIn({ onSignedIn }: { onSignedIn: (me: Me) => void }) {
  const id = useId();
  const [mode, setMode] = useState<Mode>('code');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const fail = (e: unknown) => {
    if (e instanceof ApiError && e.status === 429) setStatus('Too many attempts. Wait a minute.');
    else if (e instanceof ApiError && e.status === 401)
      setStatus('That did not work. Check and try again.');
    else setStatus('Something failed on our side. Try again.');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      if (mode === 'password') onSignedIn(await post<Me>('/auth/password', { email, password }));
      else if (!codeSent) {
        await post('/auth/code/send', { email });
        setCodeSent(true);
        setStatus('If this address has an account, a 6-digit code is on its way.');
      } else onSignedIn(await post<Me>('/auth/code/verify', { email, code }));
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const switchTo = (m: Mode) => {
    setMode(m);
    setStatus('');
    setCodeSent(false);
    setCode('');
  };

  return (
    <main className="signin">
      <div className="console">
        <p className="label">press start · admin</p>
        <h1>Sign in</h1>
        <div className="seg" role="group" aria-label="Sign-in method">
          <button type="button" aria-pressed={mode === 'code'} onClick={() => switchTo('code')}>
            Email code
          </button>
          <button
            type="button"
            aria-pressed={mode === 'password'}
            onClick={() => switchTo('password')}
          >
            Password
          </button>
        </div>
        <form onSubmit={submit} noValidate>
          <label htmlFor={`${id}-email`}>Email</label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="username"
            required
            value={email}
            disabled={codeSent}
            onChange={(e) => setEmail(e.target.value)}
          />
          {mode === 'password' && (
            <>
              <label htmlFor={`${id}-password`}>Password</label>
              <input
                id={`${id}-password`}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}
          {mode === 'code' && codeSent && (
            <>
              <label htmlFor={`${id}-code`}>6-digit code</label>
              <input
                id={`${id}-code`}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </>
          )}
          <button type="submit" className="key" disabled={busy}>
            {busy
              ? 'Working…'
              : mode === 'password'
                ? 'Sign in'
                : codeSent
                  ? 'Verify code'
                  : 'Send code'}
          </button>
          {mode === 'code' && codeSent && (
            <button type="button" className="link" onClick={() => switchTo('code')}>
              Use another address
            </button>
          )}
          <p className="status" role="status" aria-live="polite">
            {status}
          </p>
        </form>
      </div>
    </main>
  );
}
