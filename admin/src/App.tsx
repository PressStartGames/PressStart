import { useCallback, useEffect, useMemo, useState } from 'react';
import { AbilityProvider, abilityFor, Can } from './ability';
import { api, post, type Me } from './api';
import { Compose } from './screens/Compose';
import { History } from './screens/History';
import { SignIn } from './screens/SignIn';
import { Signups } from './screens/Signups';

type Tab = 'signups' | 'compose' | 'history';

export function App() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('signups');
  const ability = useMemo(() => abilityFor(me?.permissions ?? []), [me]);

  const load = useCallback(() => {
    api<Me>('/auth/me')
      .then(setMe)
      .catch(() => setMe(null));
  }, []);
  useEffect(load, [load]);

  if (me === undefined)
    return (
      <main className="boot" aria-busy="true">
        <p className="label">connecting</p>
      </main>
    );
  if (me === null) return <SignIn onSignedIn={setMe} />;

  const signOut = async () => {
    await post('/auth/logout').catch(() => undefined);
    setMe(null);
  };

  const tabs: Array<[Tab, string, boolean]> = [
    ['signups', 'Sign-ups', ability.can('read', 'Signup')],
    ['compose', 'Compose', ability.can('send', 'Broadcast')],
    ['history', 'History', ability.can('read', 'Broadcast')],
  ];
  const visible = tabs.filter(([, , ok]) => ok);
  const current = visible.some(([t]) => t === tab) ? tab : visible[0]?.[0];

  return (
    <AbilityProvider value={ability}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="bar">
        <span className="wordmark">
          <span className="led" aria-hidden="true" /> Press Start{' '}
          <span className="label">admin</span>
        </span>
        <nav aria-label="Sections" className="tabs">
          {visible.map(([t, label]) => (
            <button
              key={t}
              type="button"
              className="tab"
              aria-current={current === t ? 'page' : undefined}
              onClick={() => setTab(t)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="who">
          <span className="mono">{me.user.email}</span>
          <span className="role">{me.role ?? 'no role'}</span>
          <button type="button" className="key ghost" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>
      <main id="main" className="page">
        {!current && (
          <section className="panel">
            <h1>No access yet</h1>
            <p>
              Your account has no permissions in this workspace. Ask an owner to give you a role.
            </p>
          </section>
        )}
        {current === 'signups' && <Signups />}
        {current === 'compose' && (
          <Can I="send" a="Broadcast">
            <Compose onSent={() => setTab('history')} />
          </Can>
        )}
        {current === 'history' && <History />}
      </main>
    </AbilityProvider>
  );
}
