import { useEffect, useId, useReducer, useRef, useState, type FormEvent } from 'react';
import { Pill } from '../components/Pill';
import { Reveal } from '../components/Reveal';
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

export function Signup() {
  const s = section('signup');
  const intro = s.blocks.find((b) => b.type === 'p');
  const mode = signupMode();
  return (
    <section id="signup" className={`section ${styles.signup}`} aria-labelledby="signup-title">
      <div className="column">
        <Reveal className="section-head">
          <h2 id="signup-title">{f('headline')}</h2>
          {intro?.type === 'p' && (
            <p className={styles.intro}>
              <Inline text={intro.text} />
            </p>
          )}
        </Reveal>
        <Reveal delay={100}>
          {mode.kind === 'none' && <ComingSoon />}
          {mode.kind === 'fallback' && <FallbackForm action={mode.url} />}
          {(mode.kind === 'stub' || mode.kind === 'endpoint') && <LiveForm />}
        </Reveal>
      </div>
    </section>
  );
}

function Cartridge({
  label,
  children,
  status,
}: {
  label: string;
  children?: React.ReactNode;
  status?: boolean;
}) {
  return (
    <div
      className={styles.cartridge}
      role={status ? 'status' : undefined}
      tabIndex={status ? -1 : undefined}
      data-cartridge
    >
      <span className={styles.notch} aria-hidden="true" />
      <span className={styles.grooves} aria-hidden="true" />
      <div className={styles.cartFace}>
        <span className={styles.cartLabel}>{label}</span>
        {children}
      </div>
    </div>
  );
}

function ComingSoon() {
  return (
    <div className={styles.card} data-signup-mode="none">
      <Cartridge label={f('coming-soon')} />
      <Consent />
    </div>
  );
}

function Consent() {
  return (
    <p className={`small ${styles.consent}`}>
      <Inline text={f('consent')} />
    </p>
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

// A plain HTML form to a form service (PLAN.md §6.6, Kit). Works with JavaScript off.
function FallbackForm({ action }: { action: string }) {
  const id = useId();
  return (
    <form className={styles.card} action={action} method="post" data-signup-mode="fallback">
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
      <Consent />
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
  const resultRef = useRef<HTMLDivElement>(null);
  const done = state.status === 'success';

  useEffect(() => {
    if (done) resultRef.current?.querySelector<HTMLElement>('[data-cartridge]')?.focus();
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

  // The flip is CSS (Signup.module.css .flip): both faces are rendered, the hidden one is inert.
  return (
    <div className={styles.flipStage} ref={resultRef} data-signup-mode={mode.kind}>
      <div className={styles.flip} data-done={done || undefined}>
        <form
          className={`${styles.card} ${styles.face} ${styles.front}`}
          onSubmit={onSubmit}
          noValidate
          inert={done}
        >
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
          {/* The honeypot: hidden from people, filled by bots, refused by the Worker. */}
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
          <Consent />
        </form>
        <div
          className={`${styles.card} ${styles.face} ${styles.back}`}
          inert={!done}
          aria-hidden={!done}
        >
          <Cartridge label={f('success-card')} status>
            <p className={styles.cartText}>{f('state-success')}</p>
          </Cartridge>
        </div>
      </div>
    </div>
  );
}
