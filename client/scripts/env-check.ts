// The typed build-time config check (plans/main-site.md Phase 6). vite.config.ts runs it with the
// merged environment (.env.<mode>, .env.<mode>.local, process.env) before every build, so a missing
// or malformed public value fails the build in seconds with a message that names the variable and the
// mode, not a half-working site. `development` and `e2e` are lenient (the sign-up falls back to the
// stub / the coming-soon card); `staging` and `production` are strict.
export type ClientMode = 'development' | 'e2e' | 'staging' | 'production';

export const STRICT_MODES: readonly string[] = ['staging', 'production'];

type Env = Record<string, string | undefined>;

const isHttpUrl = (v: string): boolean => {
  try {
    const u = new URL(v);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
};

/** The problems with `env` for `mode`; an empty list means the build may go ahead. */
export function checkClientEnv(mode: string, env: Env): string[] {
  const problems: string[] = [];
  const get = (k: string): string => (env[k] ?? '').trim();

  // Format rules hold in every mode when a value is present.
  const base = get('VITE_BASE');
  if (base && !(base.startsWith('/') && base.endsWith('/')))
    problems.push(`VITE_BASE must start and end with "/" (got "${base}")`);
  for (const k of ['VITE_SITE_URL', 'VITE_API_URL', 'VITE_SIGNUP_FALLBACK_URL']) {
    const v = get(k);
    if (v && !isHttpUrl(v)) problems.push(`${k} must be an absolute http(s) URL (got "${v}")`);
  }
  const endpoint = get('VITE_SIGNUP_ENDPOINT');
  if (endpoint && endpoint !== 'stub' && !isHttpUrl(endpoint))
    problems.push(
      `VITE_SIGNUP_ENDPOINT must be "stub" or an absolute http(s) URL (got "${endpoint}")`,
    );

  if (!STRICT_MODES.includes(mode)) return problems;

  // Strict modes: required values.
  for (const k of ['VITE_BASE', 'VITE_SITE_URL']) if (!get(k)) problems.push(`${k} is required`);
  if (endpoint === 'stub')
    problems.push('VITE_SIGNUP_ENDPOINT=stub is for development and e2e only');
  if (!endpoint && !get('VITE_SIGNUP_FALLBACK_URL'))
    problems.push('set VITE_SIGNUP_ENDPOINT (the API origin) or VITE_SIGNUP_FALLBACK_URL');
  if (get('VITE_SITE_URL').startsWith('http://'))
    problems.push('VITE_SITE_URL must be https in a deployed mode');
  if (endpoint.startsWith('http://'))
    problems.push('VITE_SIGNUP_ENDPOINT must be https in a deployed mode');
  return problems;
}

export function assertClientEnv(mode: string, env: Env): void {
  const problems = checkClientEnv(mode, env);
  if (problems.length === 0) return;
  throw new Error(
    `Invalid build configuration for --mode ${mode}:\n${problems.map((p) => `  - ${p}`).join('\n')}\n` +
      `Set them in client/.env.${mode} (public values only), client/.env.${mode}.local, or the process environment.`,
  );
}
