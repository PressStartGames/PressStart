import { describe, expect, it } from 'vitest';
import { assertClientEnv, checkClientEnv } from '../../scripts/env-check';

const good = {
  VITE_BASE: '/',
  VITE_SITE_URL: 'https://staging.pressstartgames.net',
  VITE_SIGNUP_ENDPOINT: 'https://staging.pressstartgames.net',
};

describe('client build config check', () => {
  it('accepts a complete staging / production environment', () => {
    expect(checkClientEnv('staging', good)).toEqual([]);
    expect(checkClientEnv('production', good)).toEqual([]);
  });

  it('is lenient in development and e2e', () => {
    expect(checkClientEnv('development', {})).toEqual([]);
    expect(checkClientEnv('e2e', { VITE_SIGNUP_ENDPOINT: 'stub' })).toEqual([]);
  });

  it('names every missing required value in a deployed mode', () => {
    const problems = checkClientEnv('production', {});
    expect(problems.join('\n')).toMatch(/VITE_BASE is required/);
    expect(problems.join('\n')).toMatch(/VITE_SITE_URL is required/);
    expect(problems.join('\n')).toMatch(/VITE_SIGNUP_ENDPOINT/);
  });

  it('refuses the stub and plain http in a deployed mode', () => {
    expect(checkClientEnv('staging', { ...good, VITE_SIGNUP_ENDPOINT: 'stub' })).toHaveLength(1);
    expect(checkClientEnv('staging', { ...good, VITE_SITE_URL: 'http://x.test' })).toHaveLength(1);
  });

  it('accepts the form-service fallback instead of an endpoint', () => {
    const { VITE_SIGNUP_ENDPOINT: _drop, ...rest } = good;
    void _drop;
    expect(
      checkClientEnv('production', { ...rest, VITE_SIGNUP_FALLBACK_URL: 'https://f.test/x' }),
    ).toEqual([]);
  });

  it('rejects malformed values in every mode', () => {
    expect(checkClientEnv('development', { VITE_BASE: 'x' })).toHaveLength(1);
    expect(checkClientEnv('development', { VITE_SITE_URL: 'nope' })).toHaveLength(1);
  });

  it('throws one readable error', () => {
    expect(() => assertClientEnv('production', {})).toThrow(
      /--mode production[\s\S]*\.env\.production/,
    );
  });
});
