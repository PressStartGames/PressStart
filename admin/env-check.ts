// The typed build-time config check for the admin console (plans/main-site.md Phase 6): vite.config.ts
// runs it before every build. staging and production are strict, development and e2e lenient.
type Env = Record<string, string | undefined>;

export function checkAdminEnv(mode: string, env: Env): string[] {
  const problems: string[] = [];
  const api = (env.VITE_API_BASE ?? '').trim();
  const strict = mode === 'staging' || mode === 'production';
  if (!api) {
    if (strict) problems.push('VITE_API_BASE is required (the API base, e.g. https://host/api/v1)');
    return problems;
  }
  if (api.startsWith('/')) {
    if (strict)
      problems.push(`VITE_API_BASE must be an absolute https URL in ${mode} (got "${api}")`);
    return problems;
  }
  try {
    const u = new URL(api);
    if (strict && u.protocol !== 'https:')
      problems.push('VITE_API_BASE must be https in a deployed mode');
    if (!u.pathname.replace(/\/$/, '').endsWith('/api/v1'))
      problems.push(`VITE_API_BASE must end with /api/v1 (got "${api}")`);
  } catch {
    problems.push(`VITE_API_BASE must be a URL or a /path (got "${api}")`);
  }
  return problems;
}

export function assertAdminEnv(mode: string, env: Env): void {
  const problems = checkAdminEnv(mode, env);
  if (problems.length === 0) return;
  throw new Error(
    `Invalid build configuration for --mode ${mode}:\n${problems.map((p) => `  - ${p}`).join('\n')}\n` +
      `Set them in admin/.env.${mode} (public values only), admin/.env.${mode}.local, or the process environment.`,
  );
}
