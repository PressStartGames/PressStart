# edge: experiment assignment at the edge

`experiments.ts` exports `handleHtml(request, env, assets)`, a pure handler for the site Worker (phase 6 scaffold).
`config.ts` lists the live experiments (`home-headline` on `/`), the cookie names, and `WORKER_FIRST_ROUTES`.

## Design

A variant is a separate prerendered page: `client/scripts/prerender.ts` writes `_variants/<experiment>/<variant>/index.html`
next to the normal `index.html` (marked `noindex` and `<meta name="ps-variant">`). Chosen over HTMLRewriter because the
variant is complete static HTML (no flicker, no hydration mismatch, nothing to keep in step with the markup).

1. Request without `ps_consent=granted`: the control page, no cookie, no GrowthBook call.
2. With consent and a stored `ps_exp`: that variant.
3. With consent and none stored: GrowthBook features (cached 60 s, fail open to control) evaluated with the plain JS SDK;
   an experiment result is stored in `ps_exp` plus a random `ps_vid` (90 days, first-party). Forced/default values are served, not stored.
4. Responses on experiment routes carry `Vary: Cookie` and `Cache-Control: private, no-cache`.
   The client writes `ps_consent` only on Accept and removes `ps_exp`/`ps_vid` on Decline or withdrawal, and reports
   `experiment_viewed` to GA4 (GrowthBook's shape) only with consent.

## Integration (done: site-worker/src/worker.ts)

```ts
import { handleHtml, type EdgeEnv } from '../../edge/experiments';
export default {
  fetch: (req: Request, env: EdgeEnv & { ASSETS: Fetcher }) => handleHtml(req, env, env.ASSETS),
};
```

wrangler: `assets = { directory = "../client/dist", binding = "ASSETS", run_worker_first = ["/"] }`
(use `WORKER_FIRST_ROUTES`; only `/` wakes the Worker, everything else is free static serving). Set the Worker vars
`GROWTHBOOK_CLIENT_KEY` and `GROWTHBOOK_API_HOST`. In GrowthBook create the feature `home-headline` (string, default `control`)
with an experiment rule over `control` / `variant-b`, hash attribute `id`, and connect GA4 as the data source.
Add a new experiment by appending to `EXPERIMENTS`, a `-b` copy field in CONTENT.md, and a `useVariant` consumer.
