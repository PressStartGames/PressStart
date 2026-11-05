// The site Worker. With no experiments configured this is pure static-asset serving: the platform
// answers asset requests itself (assets.run_worker_first is false in production) and this script only
// runs where wrangler.jsonc turns run_worker_first on (staging, for the noindex header).
//
// ---------------------------------------------------------------------------------------------------
// EDGE INTEGRATION POINT (Phase 4/5: consent, flags, experiments at the edge)
//
// The edge module lives at the repository top level in `edge/experiments.ts` and exports
//     handleHtml(request, env, assets): Promise<Response>   // HTML requests; may rewrite or pick a variant
//     a list of route patterns it wants to see first         // for run_worker_first
// To plug it in, three edits and nothing else:
//   1. here: import { handleHtml } from '../../edge/experiments'; and in `routeRequest` below replace
//      the body with
//          if (wantsHtml(request)) return handleHtml(request, env, env.ASSETS);
//          return env.ASSETS.fetch(request);
//   2. wrangler.jsonc, every env: set "run_worker_first" to the module's patterns (a list such as
//      ["/", "/engine/*"]), so only those paths pay for a Worker invocation and every other asset is
//      still served straight from the platform.
//   3. add any experiment vars to the env's `vars` and secrets with `wrangler secret put --env <env>`.
// `env.ASSETS` is the Fetcher for client/dist, so handleHtml fetches the static page, then edits it.
// ---------------------------------------------------------------------------------------------------

export interface Env {
  ASSETS: Fetcher;
  /** "true" on staging: the whole origin asks search engines to stay away. */
  ROBOTS_NOINDEX?: string;
}

// Used by the edge wiring described above.
export function wantsHtml(request: Request): boolean {
  return (request.headers.get('accept') ?? '').includes('text/html');
}

// The seam: today every request is plain static serving.
async function routeRequest(request: Request, env: Env): Promise<Response> {
  return env.ASSETS.fetch(request);
}

export async function handle(request: Request, env: Env): Promise<Response> {
  const response = await routeRequest(request, env);
  if (env.ROBOTS_NOINDEX !== 'true') return response;
  const out = new Response(response.body, response);
  out.headers.set('x-robots-tag', 'noindex, nofollow');
  return out;
}

export default {
  fetch: handle,
} satisfies ExportedHandler<Env>;
