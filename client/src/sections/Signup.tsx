import { useEffect, useId, useReducer, useRef, useState, type FormEvent } from 'react';
import { Pill } from '../components/Pill';
import { Reveal } from '../components/Reveal';
import { Screen } from '../components/Screen';
import { field, section, splitList } from '../content';
import { Inline } from '../content/inline';
import { CONSENT_VERSION, TURNSTILE_SITE_KEY, signupMode } from '../lib/config';
import { reduce, submitSignup, type SignupState } from '../lib/signup';
import { getTurnstileToken } from '../lib/turnstile';
import styles from './Signup.module.css';

const f = (k: string) => field('signup', k);

function statusText(state: SignupState): string {
  switch (state.status) {
    case 'busy':
      return f('busy');
    case 'existing':
      return f('state-existing');
    case 'invalid':
      return f('state-invalid');
    case 'error':
      return f('state-error');
    default:
      return '';
  }
}

// The cartridge slot: the form is a cartridge above a slot; submit slides it in; the screen below
// boots PLAYER 1 READY. Without an endpoint the slot holds a "coming soon" cartridge, no form.
export function Signup({ index, label }: { index: string; label: string }) {
  const s = section('signup');
  const intro = s.blocks.find((b) => b.type === 'p');
  const mode = signupMode();
  return (
    <section id="signup" className="section" aria-labelledby="signup-title">
      <div className="frame row">
        <div className="spine">
          <span className="spine-index">{index}</span>
          <span className="spine-label">{label}</span>
        </div>
        <div className={styles.grid}>
          <Reveal className={styles.copy}>
            <h2 id="signup-title">{f('headline')}</h2>
            {intro?.type === 'p' && (
              <p className="lede">
                <Inline text={intro.text} />
              </p>
            )}
            <p className={`small ${styles.consent}`}>
              <Inline text={f('consent')} />
            </p>
          </Reveal>
          <Reveal delay={100} className={styles.slotWrap}>
            {mode.kind === 'none' && <ComingSoon />}
            {mode.kind === 'fallback' && <FallbackForm action={mode.url} />}
            {(mode.kind === 'stub' || mode.kind === 'endpoint') && <LiveForm />}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Cartridge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={[styles.cartridge, className].filter(Boolean).join(' ')}>
      <span className={styles.grip} aria-hidden="true" />
      <div className={styles.cartLabel}>{children}</div>
      <span className={styles.contacts} aria-hidden="true" />
    </div>
  );
}

function Slot({ children, label }: { children?: React.ReactNode; label: string }) {
  return (
    <div className={styles.slot}>
      <span className={styles.slotLabel}>{label}</span>
      <span className={styles.slotMouth} aria-hidden="true" />
      {children}
    </div>
  );
}

function ComingSoon() {
  return (
    <div data-signup-mode="none" className={styles.stack}>
      <Cartridge className={styles.cartridgeSoon}>
        <p className={styles.soon}>{f('coming-soon')}</p>
      </Cartridge>
      <Slot label={f('slot-label')} />
    </div>
  );
}

function RoleField({ id, name }: { id: string; name: string }) {
  const options = splitList(f('field-role-options'), '|');
  return (
    <div className={styles.fieldWrap}>
      <label htmlFor={id} className={styles.label}>
        {f('field-role')}
      </label>
      <select id={id} name={name} className={styles.input} defaultValue="">
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function FallbackForm({ action }: { action: string }) {
  const id = useId();
  return (
    <form className={styles.stack} action={action} method="post" data-signup-mode="fallback">
      <Cartridge>
        <div className={styles.fieldWrap}>
          <label htmlFor={`${id}-email`} className={styles.label}>
            {f('field-email')}
          </label>
          <input
            id={`${id}-email`}
            name="email_address"
            type="email"
            required
            autoComplete="email"
            className={styles.input}
          />
        </div>
        <RoleField id={`${id}-role`} name="fields[role]" />
        <Pill type="submit" className={styles.submit}>
          {f('cta')}
        </Pill>
      </Cartridge>
      <Slot label={f('slot-label')} />
    </form>
  );
}

function LiveForm() {
  const id = useId();
  const mode = signupMode();
  const [state, dispatch] = useReducer(reduce, { status: 'idle' } as SignupState);
  const [email, setEmail] = useState('');
  const roleRef = useRef<HTMLSelectElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef<HTMLDivElement>(null);
  const done = state.status === 'success';
  const successLine =
    state.status === 'success' && !state.mail ? f('state-success-list') : f('state-success');

  useEffect(() => {
    if (done) readyRef.current?.focus();
  }, [done]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    dispatch({ type: 'submit', email: trimmed });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed) || state.status === 'busy') return;
    let turnstileToken = '';
    if (mode.kind === 'endpoint' && TURNSTILE_SITE_KEY && turnstileRef.current) {
      try {
        turnstileToken = await getTurnstileToken(turnstileRef.current, TURNSTILE_SITE_KEY);
      } catch {
        dispatch({ type: 'resolve', result: 'error' });
        return;
      }
    }
    const result = await submitSignup(mode, {
      email: trimmed,
      role: roleRef.current?.value ?? '',
      website: websiteRef.current?.value ?? '',
      turnstileToken,
      consentVersion: CONSENT_VERSION,
    });
    dispatch({ type: 'resolve', result });
  }

  const status = statusText(state);

  return (
    <div className={styles.stack} data-signup-mode={mode.kind} data-done={done || undefined}>
      <form className={styles.formWrap} onSubmit={onSubmit} noValidate inert={done}>
        <Cartridge className={styles.cartridgeForm}>
          <div className={styles.fieldWrap}>
            <label htmlFor={`${id}-email`} className={styles.label}>
              {f('field-email')}
            </label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state.status === 'invalid' || state.status === 'error')
                  dispatch({ type: 'reset' });
              }}
              aria-invalid={state.status === 'invalid' || undefined}
              aria-describedby={`${id}-status`}
            />
          </div>
          <RoleField id={`${id}-role`} name="role" />
          <div className="visually-hidden" aria-hidden="true">
            <label htmlFor={`${id}-website`}>Website</label>
            <input
              id={`${id}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              ref={websiteRef}
            />
          </div>
          <div ref={turnstileRef} />
          <Pill
            type="submit"
            className={styles.submit}
            disabled={state.status === 'busy'}
            aria-busy={state.status === 'busy'}
          >
            {state.status === 'busy' ? f('busy') : f('cta')}
          </Pill>
          <p
            id={`${id}-status`}
            role="status"
            aria-live="polite"
            className={styles.status}
            data-status={state.status}
          >
            {status}
          </p>
        </Cartridge>
      </form>
      <Slot label={f('slot-label')}>
        <Screen className={styles.readyScreen} label={f('ready-label')}>
          <div
            className={styles.ready}
            role="status"
            tabIndex={-1}
            ref={readyRef}
            data-cartridge
            inert={!done}
            aria-hidden={!done}
          >
            <p className={styles.readyWord}>{f('success-card')}</p>
            <p className={styles.readyLine}>{successLine}</p>
            <p className={styles.readyCursor} aria-hidden="true">
              _
            </p>
          </div>
        </Screen>
      </Slot>
    </div>
  );
}
