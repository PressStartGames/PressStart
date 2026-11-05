---
name: press-start-site
description: Handover for the Press Start beta landing page repository — what it is, the stack and why, the client/server layout, how it builds, tests and deploys to GitHub Pages, how copy, counts and images flow in, the design system (two acts, tokens, motion rules), the sign-up modes and the Cloudflare Worker, what is measured, what is decided, what is open, and the pitfalls. Read this first when taking over any work on the site; read the press-start-website skill before touching a claim, a number or a picture.
---

# The Press Start site: handover

## What this repository is

The marketing and beta sign-up site for **Press Start**, a game engine built around Bevy that an AI agent can
build in, run and prove. One page, one job: say what the engine is, prove it with the engine's own output,
collect emails. Repository: `https://github.com/PressStartGames/PressStartWeb` (renamed from `PressStart` on 2026-11-05), branch `main`.
Live: `https://beta.pressstartgames.net` (GitHub Pages, custom domain, from the `gh-pages` branch); the plan in `plans/main-site.md` moves it to `https://pressstartgames.net/beta`.

Governing documents, in order of authority:

1. `CLAUDE.md` — the rules (wins over PLAN.md where they disagree; its last section lists where).
2. `.claude/skills/press-start-website/SKILL.md` — the engine tie: what may be claimed, where every count and
   picture comes from, true-today vs roadmap, what is never said. **Read it before changing copy, numbers or
   images.**
3. `PLAN.md` — the research and plan (2026-11-01). `CONTENT.md` — every word on the site.
4. `docs/plan-brief.md`, `docs/reference/elyx/` — the brief and the reference look (Elyx), for taste only.

The engine itself lives at `C:\Yanivs\GameDev\PressStart` and is **read-only from here**: no file written,
no cargo, no commit. The site only reads it (`sync-engine-facts`, the golden import).

## Layout

```
package.json  pnpm-workspace.yaml  .nvmrc(24)  .prettierrc  .prettierignore   # pnpm workspace root
CONTENT.md  PLAN.md  CLAUDE.md  README.md
.github/workflows/  ci.yml (every PR/push: lint, tests, build, Playwright+axe, Lighthouse)
                    deploy.yml (push to main -> builds client -> gh-pages branch)
                    deploy-server.yml (workflow_dispatch -> wrangler deploy; needs Cloudflare secrets)
client/             the site (Vite 7, React 19.3, TypeScript strict, React Router 7, CSS Modules)
  index.html        template with <!--app-head--> / <!--app-html--> markers and the inline `js` class script
  src/
    main.tsx          loads the page's area, then hydrateRoot; adds html.hydrated; strips "/index.html"
    entry-server.tsx  render(url) for the prerender script (StaticRouter + head); exports PRERENDER
    routes.tsx        THE ROUTE TABLE (per-route meta, PRERENDER list): /beta/* -> beta area, / and the
                      main-site pages (SITE_PAGE_IDS in content/schema.ts) -> site area
    App.tsx           useRoutes(routes) under <Suspense>; RouteHead keeps title/description in step
    site/             the main site area (placeholder until phase 2; index.tsx documents the seam:
                      `pages` = layout, home, stub, notFound); MainLayout, pages/, site.css, site.module.css
    beta/             the beta area: index.tsx (`pages`, base.css imported LAST), BetaLayout (skip link,
                      <Header/>, <main>), paths.ts (BETA_HOME, betaPath), pages/ (Home = the two acts,
                      Privacy, Confirmed, NotFound, Page.module.css)
    content/          parse.ts (CONTENT.md -> typed sections), schema.ts (sections+fields the code reads,
                      NAV_TARGETS, SITE_PAGE_IDS), index.ts (loader: CONTENT.md?raw + counts.json +
                      replay.json), inline.tsx
    sections/         the beta's sections: Hero, Problem, What, Build, Determinism, Oracles, Goldens,
                      BuiltToday, Roadmap, Signup, Faq, Footer (+ .module.css each)
    components/       the beta's: Header, Pill, Reveal, ReplayStrip, NumberTile, CodeSample, Body
    lib/              areas.ts + AreaPage.tsx (lazy areas), config.ts (env -> sign-up mode, BASE,
                      ROUTER_BASENAME, CONSENT_VERSION, FLAGS), signup.ts
                      (state machine + request), turnstile.ts, renders.ts (image pipeline), seo.ts (head per
                      route), useCountUp.ts, usePrefersReducedMotion.ts, useSpotlight.ts
    styles/           tokens.css (palettes + signal gradient + type + motion tokens), base.css (reset,
                      layout primitives, .card, the motion system), fonts.css (Latin-only @font-face)
  data/             counts.json (written by sync-engine-facts), replay.json (hero rows: tick, file, hashes)
  assets/renders/   the published engine goldens + manifest.json (one provenance row per image)
  scripts/          sync-engine-facts.ts, check-content.ts, check-renders.ts, prerender.ts, build-e2e.ts
  tests/unit/       vitest: content parser, sign-up state machine
  tests/e2e/        playwright: home.spec (a11y, no-JS, cookies, routes), signup-{stub,none,fallback}.spec
  lighthouserc.json  playwright.config.ts  vite.config.ts  eslint.config.js  .env.example  .env.development
server/             the email store: a Cloudflare Worker + D1 (not deployed yet; see "Sign-ups")
  src/index.ts (routes), token.ts (HMAC links), email.ts, mail.ts; migrations/0001_signups.sql;
  wrangler.toml; scripts/export-signups.ts; tests/worker.test.ts (fake D1); .dev.vars.example
```

## Commands (root)

```
pnpm install
pnpm --filter client dev            # localhost:5173, sign-up in stub mode (.env.development)
pnpm --filter client build          # vite build + vite build --ssr + prerender -> client/dist (+404.html)
pnpm --filter client preview
pnpm lint                           # both packages: eslint, prettier --check, tsc, check-content, check-renders
pnpm test                           # both packages: vitest
pnpm --filter client build:e2e      # three builds (stub/none/fallback) -> client/dist-e2e/<mode>
pnpm --filter client test:e2e       # playwright + axe against the three previews (ports 4173-4175)
pnpm --filter client lighthouse     # lhci on client/dist; locally needs CHROME_PATH (see pitfalls)
pnpm --filter client sync-facts -- C:/Yanivs/GameDev/PressStart   # refresh data/counts.json
pnpm --filter server dev | deploy | export:signups | migrate:local
```

CI runs exactly `pnpm lint`, `pnpm test`, the client build, `build:e2e`, `test:e2e` and `lighthouse`. Keep
them green; the deploy workflow does not wait for CI, so run them before pushing to `main`.

## Hosting and deploy (GitHub Pages)

- `deploy.yml` runs on every push to `main`: builds `client/` with `VITE_BASE=/` and
  `VITE_SITE_URL=https://beta.pressstartgames.net` (custom domain, `client/public/CNAME`), then publishes `client/dist` to the `gh-pages`
  branch (`peaceiris/actions-gh-pages`, orphan commits). Pages is configured on that branch, root. It takes
  about a minute after the push.
- Base path matters: Vite's `base` comes from `VITE_BASE`; React Router's basename follows it
  (`lib/config.ts`). A custom domain would mean `VITE_BASE=/` and a `client/public/CNAME`.
- Routing: every route in `routes.tsx`'s `PRERENDER` is prerendered to `<route>/index.html`; the site's
  not-found page becomes `404.html` and the beta's `beta/404.html` (Cloudflare static assets serve the
  nearest 404.html; Pages only the root one). No hash routing. `main.tsx` normalises `/index.html` URLs so
  a prerendered file opened by name still matches its route (Lighthouse hit this).
- **Areas, not per-page chunks** (phase 1, 2026-11-05): React Router stays in library mode with our
  prerender script. Framework mode (`@react-router/dev` 7.18.4, `ssr:false` + `prerender`) was tried: it
  built, but the beta's first load grew from 110 to 142 KB gzip and its one stylesheet became five. Each
  area (`src/site`, `src/beta`) is one lazy chunk; `prerender.ts` reads Vite's build manifest to link the
  area's CSS and modulepreload its JS per page. The beta imports `base.css` last, so its stylesheet is
  byte-identical to the root-era beta; never import beta components from `src/site` (shared chunks would
  reorder the cascade). The beta's links go through `beta/paths.ts`.
- **This branch must not reach `main` before the phase 7 cut-over**: `deploy.yml` would publish the
  placeholder main site at the root of `beta.pressstartgames.net` and the beta under `/beta/`.
- The sign-up mode of the deployed site comes from repository **variables** (not secrets):
  `VITE_SIGNUP_ENDPOINT`, `VITE_SIGNUP_FALLBACK_URL`, `VITE_TURNSTILE_SITE_KEY`. None are set today, so the
  live site shows the "coming soon" card.

## How the content flows

- **Copy**: `CONTENT.md`, one `## section` each, `key: value` fields plus Markdown body (paragraphs, numbered
  lists, one fenced code block). `*(italic parenthetical)*` lines are builder notes and are stripped. The
  parser is `src/content/parse.ts`; `schema.ts` lists every section and field the code reads, in both
  directions (`check-content` fails CI on a missing field, an unrendered section, a raw `{{placeholder}}`, a
  surviving note, or the internal line "Unity for AI"). Code never holds prose: a new label goes into
  CONTENT.md and the schema.
- **Numbers**: `{{catalog.built}}`-style placeholders resolve against `client/data/counts.json`, which only
  `scripts/sync-engine-facts.ts` writes (read-only walk of the engine checkout; records the engine commit).
  Never type a count.
- **Images**: only accepted engine goldens (never `*.candidate.png`, never a reference tool's half of a review
  pair). Each file in `client/assets/renders/` has a row in `manifest.json` (engineCommit, crate, test,
  sourcePath, kind, width, height, sha256); `check-renders` refuses one without. `manifest.sheet` lists the
  nine on the contact sheet. `lib/renders.ts` runs raster goldens through vite-imagetools (AVIF/WebP/PNG at
  480/900) and serves pixel-art goldens (≤160 px) as-is, integer-scaled with `image-rendering: pixelated`.
- **The hero strip** (`ReplayStrip`): `data/replay.json` holds one row per tick-stamped golden
  (`rig2d-character-tick-03/35/40` from `press_start_sprite_bevy`) with the golden's sha256 as both columns.
  The engine has no recorded per-tick replay checksums as artifacts and cargo is off-limits, so this is the
  honest version; a real booth capture is an engine-side task that needs the founder's go.

## The design system

- **Two fixed acts, not a theme.** Act 1 "paper" (`[data-act="paper"]`: hero, problem, what) is a warm card
  inset on the dark body; a hard cut at "How an agent builds a game" into act 2 "booth"
  (`[data-act="booth"]`: everything else). Tokens in `styles/tokens.css`: booth `#0b0e14` / PASS green
  `#3ddc97` / tick amber `#ffb547`; paper `#f5f1e8` / ink `#2f5bff` / press-start red `#e8543a`; the "signal"
  gradient (ink → PASS → tick) for rings, underlines, the scrubber and the aurora, never for body text.
- **Type**: Instrument Serif (display, regular only), Inter Tight (body), JetBrains Mono (numbers, code,
  captions). Self-hosted via @fontsource, Latin subsets only (`fonts.css`), display face preloaded by the
  prerender script.
- **Layout**: `.column` 760 px reading measure, `.breakout` 1200 px for pictures; the header aligns to the
  paper card's edges, not the column.
- **Motion rules** (all in `base.css` and the section CSS):
  - The server renders the final state. The no-JS page and reduced-motion users get that state. Hidden
    initial states exist only under `html.js.hydrated` (reveals) or `html.js` (load sequence, CSS keyframes).
  - `.enter` fades+rises on load; `.enter-solid` rises without opacity (used on the h1 so the first paint
    carries the LCP text). `<Reveal>` toggles `data-visible` via `useInView`; `wipe` reveals headings through
    a clip. `.card` + `spotlightHandlers()` give pointer light and tilt.
  - Scroll-driven CSS (`animation-timeline: view()`) lifts the paper and draws the horizon; falls back to
    static where unsupported.
  - **Keep the idle state still.** A drifting grid, a blinking mark or a breathing haze above the fold cost
    about two Lighthouse points of Speed Index; the hero run (3.2 s) and hover effects are the moving parts.
    Infinite animations must be compositor-only (transform/opacity) and small (the CTA ring spins on hover).
  - Every animation has a `prefers-reduced-motion: reduce` block.
- **Accessibility**: one h1, landmarks, visible labels, `role="status"` live region for the form, focus moved
  to the result, skip link, axe runs in e2e with WCAG 2.2 AA tags. Muted text must not use `opacity` (axe
  blends it and fails contrast). Scrollable regions need `tabIndex` and a label.

## Sign-ups

Three build-time modes (`lib/config.ts`, `.env.example`), all covered by e2e:

1. `VITE_SIGNUP_ENDPOINT=<worker origin>` → the real form (`stub` = local stub for dev/e2e; stub addresses
   `existing@…`, `fail@…`, `list@…` drive the states).
2. only `VITE_SIGNUP_FALLBACK_URL` → a plain HTML form posting to a form service (Kit field names assumed:
   `email_address`, `fields[role]`; verify before use).
3. neither → a static "coming soon" cartridge, no form, no dead button. **This is what is live today.**

The Worker (`server/`): `POST /api/waitlist` (honeypot → Turnstile → validate → D1 insert → confirmation mail
via Resend with HMAC links), `GET /api/confirm?t=` (sets `confirmed_at`, redirects to `SITE_URL/confirmed`),
`GET /api/unsubscribe?t=` (deletes the row). Answers `{status:"ok", mail:boolean}`; with no `RESEND_API_KEY`
it stores the row and `mail:false`, and the client shows "You are on the list." (list mode). No IP or user
agent is stored. CORS admits `ALLOWED_ORIGINS` only. Rate limit via the `[[ratelimits]]` binding.

**To go live** (needs the founder's Cloudflare account; this machine is not logged in):
`cd server && pnpm exec wrangler login` → `wrangler d1 create press-start-signups` and paste the id into
`wrangler.toml` → `wrangler secret put CONFIRM_LINK_SECRET` (and later `TURNSTILE_SECRET_KEY`,
`RESEND_API_KEY`) → set `API_URL`/`MAIL_FROM` in `wrangler.toml` → `pnpm --filter server deploy` → set the
repository variable `VITE_SIGNUP_ENDPOINT` (and `VITE_TURNSTILE_SITE_KEY`) → push or re-run `deploy.yml`.
The founder has not yet chosen between the Worker, a form service (Kit) and their existing cloud account.

## What is measured, what is decided, what is open

Measured 2026-11-01 (Lighthouse mobile, three runs, `client/dist`): perf 95, accessibility 100, best
practices 100, SEO 100; LCP 2.4 s (the assertion is `warn`, target 2.0 s); CLS 0; JS 104 KB gzip
(react-dom 65, React Router 13.5, app ≈20, React 5); CSS 10 KB gzip; first view ≈250 KB.

Decided, with the reason recorded in the code or README:
- Prerendered routes + `404.html` on Pages; no hash routing.
- `motion` is a dependency for `useInView` only; load sequence, reveals, horizon and the sign-up flip are CSS
  so the no-JS page reads and the bundle stays small.
- External CSS beats inlined CSS here (measured); `PRERENDER_INLINE_CSS=1` is the opt-in experiment.
- Latin-only font subsets.

Open, for the founder:
- The 90 KB JS budget in CLAUDE.md is unreachable with React 19.3 + React Router; dropping the router for the
  prerendered routes would land near 88 KB.
- LCP 2.4 s vs the 2.0 s target on simulated mobile (first paint itself lands at 2.1 s).
- Which sign-up backend (see above); Turnstile and Resend keys; the sending domain.
- The contact address (the footer shows plain text until then). Discord is decided: https://discord.gg/XrmRJ5p2Xf
  (`DISCORD_URL` in `client/src/lib/config.ts`), linked from the beta footer and every main-site footer. Domain and organisation name. The licence wording. The engine-side booth capture for the hero.
- M4 is not started: Open Graph/X cards, sitemap, JSON-LD, Cloudflare Web Analytics.

The founder's taste, in their words (2026-11-01): "less technical, more friendly and appealing, but keep the
proof"; "the colour scheme was a bit boring"; "the animation should be more elaborate"; "no placeholders, real
data"; "first solid design and sign-ups". Act accordingly before adding anything.

## Pitfalls

- **Windows + bash**: `/tmp` in bash is `C:\Users\neta\AppData\Local\Temp`, but Node resolves `/tmp` to
  `C:\tmp`; pass Windows paths to Node. Lighthouse locally needs
  `CHROME_PATH='C:\Users\neta\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe'` (Playwright's
  Chromium; the folder name changes with the Playwright version).
- Prettier reads `.prettierignore` from the package directory, so `client/` and `server/` have their own.
  `pnpm format` at the root formats everything; run it before `pnpm lint`.
- `pnpm` build scripts: `esbuild`, `workerd` and `sharp` are approved in the root `package.json`
  (`pnpm.onlyBuiltDependencies`); a new native dependency needs adding there.
- Playwright e2e runs three preview servers; a stale server on 4173-4175 or a CPU-starved machine makes the
  desktop project time out. Rerun with `--workers=3` before suspecting the code.
- `vite-imagetools` imports are typed through `src/imagetools.d.ts`; the glob in `lib/renders.ts` must keep
  the `eager`/`query`/`import` shape.
- The engine's working tree may show changes made by the engine's own sessions; never touch them.
- Keep versions exact and at least two weeks old (CLAUDE.md); check `npm view <pkg> time` before bumping.

## Taking over: a checklist

1. Read `CLAUDE.md`, this skill, then `press-start-react` (the React standard and shared lint config, `eslint.shared.js`), then `press-start-website` (the engine tie).
2. `pnpm install`, `pnpm lint`, `pnpm test`, `pnpm --filter client build:e2e && pnpm --filter client test:e2e`.
   All should be green on `main`.
3. Before a release: run `sync-facts` against the engine, read the `counts.json` diff, re-check every claim
   in `CONTENT.md` against the skill's table, make sure every image has a manifest row.
4. Push to `main` only when CI would pass; the deploy is automatic.
