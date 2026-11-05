# Press Start — the beta landing page

The website for **Press Start**, a game engine built around Bevy that an AI agent can build in, run and
prove. One job: say what the engine is, prove it with the engine's own output, collect beta sign-ups.

- The plan: [`PLAN.md`](PLAN.md). The rules: [`CLAUDE.md`](CLAUDE.md). The words: [`CONTENT.md`](CONTENT.md).
- The engine tie (where every claim, count and picture comes from): `.claude/skills/press-start-website/SKILL.md`.

## Layout

```
client/   Vite + React 19 + TypeScript. Prerendered to static HTML at build -> GitHub Pages.
server/   Cloudflare Worker + D1: the email store (Turnstile, honeypot, double opt-in via Resend).
docs/     the plan's brief and the reference screenshots.
.github/workflows/   ci.yml (lint, tests, build, Playwright + axe, Lighthouse), deploy.yml (-> gh-pages),
                     deploy-server.yml (wrangler, on demand).
```

## Run it

```
pnpm install
pnpm --filter client dev                       # http://localhost:5173 (sign-up in stub mode)
pnpm --filter client build                     # prerendered site -> client/dist (+ 404.html)
pnpm --filter client preview
pnpm lint                                      # eslint, prettier, tsc, check-content, check-renders
pnpm test                                      # vitest, both packages
pnpm --filter client build:e2e && pnpm --filter client test:e2e   # Playwright + axe, three sign-up modes
pnpm --filter client lighthouse                # Lighthouse CI on client/dist
pnpm --filter client sync-facts -- C:/Yanivs/GameDev/PressStart   # refresh client/data/counts.json
pnpm --filter server dev                       # wrangler dev with a local D1 (copy .dev.vars.example)
pnpm --filter server deploy                    # d1 migrations apply + wrangler deploy
pnpm --filter server export:signups            # confirmed rows -> signups-YYYY-MM-DD.csv
```

## How the pieces fit

- **Routes** (`client/src/routes.tsx`, plans/main-site.md phase 1): one app, two lazily loaded areas.
  The main site (`client/src/site/`, a placeholder until phase 2) serves `/`, `/engine` (+
  `/engine/{determinism,parallel,oracles,ai,ownership}`), `/showcase`, `/roadmap`, `/learn`, `/news`,
  `/licensing`, `/about`, `/community`, `/privacy`, `/terms`, `/cookies` and `404.html`; the beta
  (`client/src/beta/`) serves `/beta/`, `/beta/privacy`, `/beta/confirmed` and `beta/404.html`. Every
  route is prerendered (`client/scripts/prerender.ts`). Locally the Worker's confirm redirect lands on
  `/beta/confirmed` through `SITE_URL` in `server/.dev.vars`.
- **Copy** lives in `CONTENT.md`, one `## section` each; the client parses it at build
  (`client/src/content/`). Counts are `{{placeholders}}` filled from `client/data/counts.json`, which only
  `sync-engine-facts` writes, from a read-only walk of the engine checkout. `check-content` fails CI on a
  missing section, an unknown placeholder or a leftover builder note.
- **Sign-up modes** are chosen at build (`client/.env.example`): a real Worker endpoint, `stub` (dev and
  e2e), a form-service fallback, or nothing, which renders a static "coming soon" card. The deploy
  workflow reads them from repository variables, so the site is live before the Worker is.
- **Motion** is CSS where the no-JS page must still read (the load sequence, the scroll reveals, the
  horizon cut, the hover springs); JavaScript drives the hero's tick counter and the tile count-ups once
  hydrated. Everything collapses to the final state under `prefers-reduced-motion`.
- **Images**: only accepted engine goldens and booth captures, each with a provenance row in
  `client/assets/renders/manifest.json` (`check-renders` refuses one without). None are imported yet
  (that is M3); the hero uses placeholder frames and placeholder checksums (`client/data/replay.json`).

## Deploying

- The site deploys to the `gh-pages` branch on every push to `main` (`deploy.yml`); GitHub Pages serves
  it at `https://beta.pressstartgames.net` (custom domain; Pages set to the `gh-pages` branch).
- The Worker: `wrangler d1 create press-start-signups`, paste the id into `server/wrangler.toml`, set the
  three secrets with `wrangler secret put`, then `pnpm --filter server deploy` (or run `deploy-server.yml`).
  Then set the repository variables `VITE_SIGNUP_ENDPOINT` (the Worker's origin) and
  `VITE_TURNSTILE_SITE_KEY` and redeploy the site.
