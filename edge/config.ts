// The experiments that need the edge: HTML pages whose variant is chosen before the HTML is sent.
// Shared by the Worker handler (experiments.ts), the client's prerender (client/scripts/prerender.ts, which
// writes one static page per variant) and the client's consent code (cookie names). No imports, no side effects.
export interface ExperimentDef {
  /** The GrowthBook feature key (the feature's value is the variant's name). */
  id: string;
  /** The route whose HTML varies, as a path ("/"). */
  route: string;
  control: string;
  variants: readonly string[];
}

// One live sample experiment: the main site's home headline (CONTENT.md `site-home`: headline / headline-b).
export const EXPERIMENTS: readonly ExperimentDef[] = [
  { id: 'home-headline', route: '/', control: 'control', variants: ['control', 'variant-b'] },
];

// First-party cookies. ps_consent is the visitor's analytics "Accept", written by the client only after the
// click (a functional cookie: it is how the edge knows it may assign). ps_exp / ps_vid are written by the edge
// only when ps_consent=granted, and removed by the client when consent is withdrawn.
export const CONSENT_COOKIE = 'ps_consent';
export const EXPERIMENT_COOKIE = 'ps_exp';
export const VISITOR_COOKIE = 'ps_vid';
export const CONSENT_GRANTED = 'granted';

/** Where a variant's prerendered page lives inside the static assets (served by path, never linked). */
export function variantFile(exp: ExperimentDef, variant: string): string {
  return `_variants/${exp.id}/${variant}/index.html`;
}
export function variantPath(exp: ExperimentDef, variant: string): string {
  return `/_variants/${exp.id}/${variant}/`;
}

/** The route patterns for wrangler's `assets.run_worker_first`: only these paths wake the Worker. */
export const WORKER_FIRST_ROUTES: readonly string[] = EXPERIMENTS.map((e) => e.route);

/** The `ps_exp` cookie holds `id:variant` pairs joined by "~". */
export function parseAssignments(value: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of (value ?? '').split('~')) {
    const [id, variant] = pair.split(':');
    if (id && variant) out[id] = variant;
  }
  return out;
}
export function formatAssignments(a: Record<string, string>): string {
  return Object.entries(a)
    .map(([id, v]) => `${id}:${v}`)
    .join('~');
}
