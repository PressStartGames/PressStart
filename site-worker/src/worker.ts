// The site Worker. Static-asset serving for client/dist, with one seam: `handleHtml` from the edge package
// (edge/experiments.ts, Phase 5) runs first on the experiment routes (`WORKER_FIRST_ROUTES`, today `/`).
//
//   - Without a `ps_consent=granted` cookie, or without a GrowthBook client key, `/` is the plain static control
//     page (the edge adds `Vary: Cookie` and `Cache-Control: private, no-cache` on that route only).
//   - Every other path goes straight to the assets.
//   - wrangler.jsonc `run_worker_first`: production lists exactly the edge's routes (every other asset is
//     served by the platform without waking this script); staging runs the Worker for every request so it can
//     add `X-Robots-Tag: noindex`. tests/handle.test.ts keeps both in step with edge/config.ts.
import { handleHtml, type EdgeEnv } from '../../edge/experiments';

export interface Env extends EdgeEnv {
  ASSETS: Fetcher;
  /** "true" on staging: the whole origin asks search engines to stay away. */
  ROBOTS_NOINDEX?: string;
}

async function routeRequest(request: Request, env: Env): Promise<Response> {
  return handleHtml(request, env, env.ASSETS);
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
