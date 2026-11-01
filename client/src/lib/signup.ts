// The sign-up state machine and the request, pure enough for Vitest.
import type { SignupMode } from './config';

// `ok` means a confirmation mail is on its way; `ok-list` means the address is stored and no mail
// is sent yet (the Worker runs without a mail key). Both are a success for the person.
export type SignupResult = 'ok' | 'ok-list' | 'existing' | 'invalid' | 'error';

export type SignupState =
  | { status: 'idle' }
  | { status: 'busy' }
  | { status: 'success'; mail: boolean }
  | { status: 'existing' }
  | { status: 'invalid' }
  | { status: 'error' };

export type SignupEvent =
  { type: 'submit'; email: string } | { type: 'resolve'; result: SignupResult } | { type: 'reset' };

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): boolean {
  const e = email.trim();
  return e.length <= 254 && EMAIL.test(e);
}

export function reduce(state: SignupState, event: SignupEvent): SignupState {
  switch (event.type) {
    case 'submit':
      if (state.status === 'busy' || state.status === 'success') return state;
      return validateEmail(event.email) ? { status: 'busy' } : { status: 'invalid' };
    case 'resolve':
      if (state.status !== 'busy') return state;
      switch (event.result) {
        case 'ok':
          return { status: 'success', mail: true };
        case 'ok-list':
          return { status: 'success', mail: false };
        case 'existing':
          return { status: 'existing' };
        case 'invalid':
          return { status: 'invalid' };
        case 'error':
          return { status: 'error' };
      }
      break;
    case 'reset':
      return { status: 'idle' };
  }
  return state;
}

export interface SignupPayload {
  email: string;
  role: string;
  website: string; // the honeypot: humans never see it, so it must stay empty
  turnstileToken: string;
  consentVersion: string;
}

// The Worker's answers: 200 {status:"ok", mail:boolean} | {status:"existing"}, 400 {status:"invalid"},
// anything else -> error.
export async function submitSignup(
  mode: SignupMode,
  payload: SignupPayload,
  fetchImpl: typeof fetch = fetch,
): Promise<SignupResult> {
  if (mode.kind === 'stub') {
    await new Promise((r) => setTimeout(r, 700));
    const local = payload.email.split('@')[0] ?? '';
    if (local === 'existing') return 'existing';
    if (local === 'fail') return 'error';
    if (local === 'list') return 'ok-list';
    return 'ok';
  }
  if (mode.kind !== 'endpoint') return 'error';
  try {
    const res = await fetchImpl(`${mode.url}/api/waitlist`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status === 400) return 'invalid';
    if (!res.ok) return 'error';
    const data = (await res.json()) as { status?: string; mail?: boolean };
    if (data.status === 'ok') return data.mail === false ? 'ok-list' : 'ok';
    if (data.status === 'existing') return 'existing';
    return 'error';
  } catch {
    return 'error';
  }
}
