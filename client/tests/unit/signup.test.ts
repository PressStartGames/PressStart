import { describe, expect, it, vi } from 'vitest';
import { reduce, submitSignup, validateEmail, type SignupState } from '../../src/lib/signup';

describe('validateEmail', () => {
  it('accepts a plain address and refuses the rest', () => {
    expect(validateEmail('a@b.co')).toBe(true);
    expect(validateEmail('  a@b.co ')).toBe(true);
    expect(validateEmail('a@b')).toBe(false);
    expect(validateEmail('a b@c.d')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('reduce', () => {
  const idle: SignupState = { status: 'idle' };
  it('goes busy on a valid submit and invalid on a bad address', () => {
    expect(reduce(idle, { type: 'submit', email: 'a@b.co' })).toEqual({ status: 'busy' });
    expect(reduce(idle, { type: 'submit', email: 'nope' })).toEqual({ status: 'invalid' });
  });
  it('resolves only from busy', () => {
    expect(reduce({ status: 'busy' }, { type: 'resolve', result: 'ok' })).toEqual({
      status: 'success',
      mail: true,
    });
    expect(reduce({ status: 'busy' }, { type: 'resolve', result: 'ok-list' })).toEqual({
      status: 'success',
      mail: false,
    });
    expect(reduce({ status: 'busy' }, { type: 'resolve', result: 'existing' })).toEqual({
      status: 'existing',
    });
    expect(reduce({ status: 'busy' }, { type: 'resolve', result: 'error' })).toEqual({
      status: 'error',
    });
    expect(reduce(idle, { type: 'resolve', result: 'ok' })).toEqual(idle);
  });
  it('ignores a submit while busy or after success', () => {
    expect(reduce({ status: 'busy' }, { type: 'submit', email: 'a@b.co' })).toEqual({
      status: 'busy',
    });
    expect(reduce({ status: 'success', mail: true }, { type: 'submit', email: 'a@b.co' })).toEqual({
      status: 'success',
      mail: true,
    });
  });
  it('resets to idle', () => {
    expect(reduce({ status: 'error' }, { type: 'reset' })).toEqual(idle);
  });
});

const payload = { email: 'a@b.co', role: '', website: '', turnstileToken: '', consentVersion: 'v' };

describe('submitSignup', () => {
  it('maps the Worker answers', async () => {
    const mode = { kind: 'endpoint', url: 'https://api.test' } as const;
    const fetchImpl = vi.fn(async (_url: unknown, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { email: string };
      if (body.email === 'dup@b.co')
        return new Response(JSON.stringify({ status: 'existing' }), { status: 200 });
      if (body.email === 'bad@b.co')
        return new Response(JSON.stringify({ status: 'invalid' }), { status: 400 });
      if (body.email === 'boom@b.co') return new Response('', { status: 500 });
      if (body.email === 'list@b.co')
        return new Response(JSON.stringify({ status: 'ok', mail: false }), { status: 200 });
      return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
    }) as unknown as typeof fetch;
    expect(await submitSignup(mode, payload, fetchImpl)).toBe('ok');
    expect(await submitSignup(mode, { ...payload, email: 'dup@b.co' }, fetchImpl)).toBe('existing');
    expect(await submitSignup(mode, { ...payload, email: 'bad@b.co' }, fetchImpl)).toBe('invalid');
    expect(await submitSignup(mode, { ...payload, email: 'boom@b.co' }, fetchImpl)).toBe('error');
    expect(await submitSignup(mode, { ...payload, email: 'list@b.co' }, fetchImpl)).toBe('ok-list');
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.test/api/waitlist',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('answers error when the network fails', async () => {
    const failing = (async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;
    expect(
      await submitSignup({ kind: 'endpoint', url: 'https://api.test' }, payload, failing),
    ).toBe('error');
  });

  it('stubs by address in stub mode', async () => {
    vi.useFakeTimers();
    const p1 = submitSignup({ kind: 'stub' }, payload);
    const p2 = submitSignup({ kind: 'stub' }, { ...payload, email: 'existing@b.co' });
    const p3 = submitSignup({ kind: 'stub' }, { ...payload, email: 'fail@b.co' });
    await vi.runAllTimersAsync();
    expect(await p1).toBe('ok');
    expect(await p2).toBe('existing');
    expect(await p3).toBe('error');
    vi.useRealTimers();
  });

  it('never posts without an endpoint', async () => {
    expect(await submitSignup({ kind: 'none' }, payload)).toBe('error');
  });
});
