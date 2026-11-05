# Plan: the main site at pressstartgames.net, the beta under /beta

Written 2026-11-05 after the research in `docs/research/main-site.md` and the founder's decisions below.
This file is the contract for the work: each phase has an owner, a "done when", and what must never break.
Update the status column as phases land.

## Decisions (founder, 2026-11-05)

| Topic | Decision |
|---|---|
| Main site | `https://pressstartgames.net/` is the engine's website (React Router); this repo becomes it |
| The beta | Moves to `https://pressstartgames.net/beta` (nested routes); same console/arcade look; `beta.pressstartgames.net` redirects there |
| Admin | `admin.pressstartgames.net` stays as it is |
| Layouts | Four directions, one worktree each, inspired by Unreal / Unity / Godot+Defold / Bevy, never copied; console colours and type kept, more and better motion |
| Join the beta | A button to `/beta`, behind a feature flag (later becomes Download) |
| Analytics | Cloudflare Web Analytics for everyone (cookieless, no banner); GA4 only after opt-in through a console-styled consent banner (Consent Mode v2, defaults denied); partial EU numbers accepted |
| The promise | Rewritten to be exactly true: no selling or sharing of data, anonymous cookie-free statistics, GA4 only with consent, beta email used only for beta news. Privacy page names Google as a processor; CLAUDE.md, mission README and CONTENT.md changed to match |
| Split testing / flags | GrowthBook (free cloud plan) with its Cloudflare edge app; variants chosen before HTML is sent; visitors without consent are not enrolled (see the control) |
| Hosting | Root site moves from GitHub Pages to Cloudflare (Workers static assets) |
| Cost | Stay on free tiers. The edge Worker runs only on HTML routes with a live experiment (free tier returns 429 past 100k Worker requests/day; static assets are free and unlimited) |
| Environments | local / staging / production (table in §Phase 6) |
| React standard | A project skill built from Vercel's `react-best-practices` (the rules that apply outside Next.js) + react.dev's rules + our accessibility, motion, copy and budget rules; enforced by lint where possible; applies to admin, beta and main |
| Rename | Repo and folder `PressStart` → `PressStartWeb`; the Claude session moves with it |

## Never break (checked at the end of every phase)

- A sign-up on the live beta works, and its confirmation mail's link confirms.
- Links in mails already sent (confirm, unsubscribe) keep working.
- The admin console signs in and lists sign-ups.
- Nothing reaches production without the founder; no mail to the real list.
- Copy only from `CONTENT.md`; counts only from the sync script; images only with provenance rows.
- Accessibility (axe clean), reduced motion, and the no-JS page.

## Phases

| # | Phase | Owner | Agent model | Status |
|---|---|---|---|---|
| 0 | Rename and housekeeping | Founder + Claude | — | done 2026-11-05 |
| 1 | Routing skeleton: one app, `/` and `/beta/*` | Claude (agent) | Opus | open |
| 2 | Four layouts for `/`, one worktree each | Claude (4 agents) | Opus | open |
| 3 | The React standard (skill + lint) for all three apps | Claude (agent) | Sonnet | open |
| 4 | Analytics with consent, the new promise | Claude (agent) | Sonnet | open |
| 5 | Feature flags and split testing (GrowthBook) | Claude (agent) + founder (account) | Sonnet | open |
| 6 | Environments and the pipeline | Claude (agent) + founder (token, keys) | Sonnet | open |
| 7 | Production cut-over | Claude + founder (approval) | — | open |

Phases 3–6 run after phase 1 and can overlap with phase 2 (separate worktrees, separate files). Phase 2's
winner is merged before phase 7. Design work (1, 2) uses the strongest model because design quality was the
problem in earlier rounds; mechanical work (3–6) uses Sonnet.

### Phase 0 — Rename and housekeeping

1. `.gitattributes` with `* text=auto eol=lf` and a one-time renormalise commit, ending the CRLF noise on
   this Windows machine.
2. GitHub: rename `PressStartGames/PressStart` → `PressStartGames/PressStartWeb` (GitHub keeps redirects).
   Update the local remote URL.
3. Copy Claude Code's project folder `~/.claude/projects/C--Yanivs-GameDev-PressStartGames-PressStart/` to
   `~/.claude/projects/C--Yanivs-GameDev-PressStartGames-PressStartWeb/` (sessions + memory).
4. **Founder:** close this session and every dev server, rename the folder
   `C:\Yanivs\GameDev\PressStartGames\PressStart` → `PressStartWeb`, open Claude Code in the new folder and
   run `claude --resume` to continue this session.
5. Update names in `INFRASTRUCTURE.md`, CLAUDE.md, the two skills and the mission files.

Done when: the repo is `PressStartWeb` on GitHub and on disk, this session resumes there, `git status` is
clean after a fresh checkout, the live site and admin still work.

### Phase 1 — Routing skeleton (local only)

- One React app with nested routes: `/` (main layout, placeholder home) and `/beta/*` (the beta's layout with
  its current pages as children: index, `confirmed`, `privacy`, not-found). React Router 7 framework mode,
  `ssr: false`, explicit `prerender` list; fall back to the current prerender script if framework mode
  misbehaves. Route-level code splitting; per-route `meta`.
- The existing beta e2e suites run against `/beta` and pass unchanged in substance.
- Main-site routes stubbed from the research site map (`/engine`, `/showcase`, `/roadmap`, `/learn`, `/news`,
  `/licensing`, `/about`, `/community`, legal pages), each a placeholder with its CONTENT.md section.
- Local end-to-end: a sign-up from `localhost/beta` against a local Worker, the confirm link landing on
  `/beta/confirmed`.

Done when: lint, unit, build and all e2e green; the beta at `/beta` looks and behaves like today's beta;
nothing deployed.

### Phase 2 — Four layouts for `/`

Worktrees `PressStartWeb-L1` … `-L4`, branches `layout/cinematic`, `layout/suite`, `layout/community`,
`layout/tour`, each from phase 1's result:

- **L1 Cinematic** (Unreal): full-viewport hero with the replay simulation, audience tabs (studios, solo,
  AI tooling, Bevy devs), flagship blocks for the four strengths, showcase strip, licence CTA.
- **L2 Platform suite** (Unity): mega-menu; three pillars (build as data → prove → own the code), each a deep
  section; evidence cards; learn and licensing teasers.
- **L3 Community engine** (Godot + Defold): value-badge strip, feature cards, live roadmap and news on the
  home page, get involved, the beta.
- **L4 Feature tour** (Bevy): one long scroll, a live proof per capability (checksum ledger, core board,
  golden wipe), sticky section index.

Each: home page fully designed, the main nav and footer, `/engine` and one strength sub-page designed, the
other routes styled placeholders; "Join the beta" to `/beta` (flag-ready); content from `mission/` and
CONTENT.md, honesty rules from the website skill; a design brief written first; desktop and phone
screenshots self-reviewed against "would this win a site-of-the-day / does anything look like a template".
Local only; the founder picks one (or parts of several).

### Phase 3 — The React standard

- A project skill `.claude/skills/press-start-react/SKILL.md`: the Vercel rules that apply to a Vite + React
  Router SPA (bundle, client fetching, re-render, rendering, JS, advanced; Next.js-only rules excluded and
  listed as excluded), react.dev's rules (purity, hooks, no derived state in effects), our rules
  (accessibility, reduced motion, copy only from CONTENT.md, performance budgets, routing conventions).
- ESLint configs aligned across `client`, `admin` and the main app (react-hooks 7 recommended incl. compiler
  rules, import rules for barrel files, a11y plugin); fixes for what the rules find.
- CLAUDE.md points to the skill.

Done when: all three apps lint clean under the shared config, tests green, the skill reviewed.

### Phase 4 — Analytics with consent

- Cloudflare Web Analytics beacon on every page (cookieless).
- GA4 behind a consent banner in the console look: Consent Mode v2 defaults denied before any tag; the GA
  script loaded only after "accept"; a choice the visitor can change from the footer; no banner shown
  after a choice.
- Events: page views, "Join the beta" clicks, sign-up submitted / confirmed (no personal data in events).
- The new promise written into the privacy page, CONTENT.md, CLAUDE.md and `mission/README.md`.

Done when: no cookie is set before consent (e2e), GA fires only after accept (e2e), Lighthouse unchanged
within budget, the founder approves the wording. Needs: the GA4 measurement IDs (staging + production).

### Phase 5 — Feature flags and split testing

- GrowthBook cloud (free plan): `join-beta-cta` (button on/off, label), and one sample experiment on a home
  headline variant.
- Edge: the site's Worker evaluates experiments only on HTML routes with a live experiment
  (`run_worker_first` patterns), sets the assignment cookie only with consent, serves the prerendered
  variant without flicker; everything else stays on free static serving.
- Client SDK for flags that need no edge decision.

Done when: a flag flip changes the button without a deploy; an experiment assigns, persists with consent and
reports in GrowthBook; visitors without consent see the control. Needs: the founder's GrowthBook account and
SDK keys (staging + production).

### Phase 6 — Environments and the pipeline

| | Local | Staging | Production |
|---|---|---|---|
| Site | Vite dev | `staging.pressstartgames.net` | `pressstartgames.net` |
| API | `wrangler dev`, local D1 | `staging.pressstartgames.net/api/v1` | `pressstartgames.net/api/v1` |
| Admin | Vite dev | `admin-staging.pressstartgames.net` | `admin.pressstartgames.net` |
| Database | local D1 | D1 `press-start-signups-staging` | D1 `press-start-signups` |
| WorkOS | staging env | staging env | production env (new keys) |
| Resend | logged, not sent | allowlist of our own addresses only | real |
| GA4 / GrowthBook | off | staging property / env | production |

- Vite modes and `.env.development` / `.env.staging` / `.env.production` (public values only),
  `.env.local` git-ignored; a typed config check per app that fails fast on a missing value.
- Wrangler `[env.staging]` / `[env.production]` for the API, the admin and the site Workers.
- Session cookies named and scoped per environment (no `.pressstartgames.net` cookie shared across envs).
- GitHub Environments `staging` and `production` with their own variables and secrets; production requires
  the founder's approval.
- Flow: PR → checks + preview URL (`wrangler versions upload`); merge to `main` → deploy to staging; approve →
  the same build to production. D1 migrations run per environment, production only after approval.

Done when: a PR shows a preview URL; a merge lands on staging by itself; production deploys only after
approval. Needs: a scoped Cloudflare API token as an Actions secret (Workers, D1, routes; not DNS), the
WorkOS production keys.

### Phase 7 — Production cut-over

1. Staging fully green: sign-up + confirm under `/beta`, admin, analytics consent, flags.
2. Worker vars: `SITE_URL` → `https://pressstartgames.net/beta`; `ALLOWED_ORIGINS` + `https://pressstartgames.net`.
3. Root site served from Cloudflare on `pressstartgames.net/*`; verify `/api/v1/*` still reaches the API
   (most specific route wins; tested on staging first).
4. `beta.pressstartgames.net/*` → 301 → `pressstartgames.net/beta/*` (Cloudflare redirect rule; the `beta`
   record proxied).
5. Check the never-break list live; GitHub Pages retired after a two-week grace period.

Done when: the never-break list passes in production and the founder signs off.

## Founder's steps across the plan

| When | Step |
|---|---|
| Phase 0 | Close the session and dev servers, rename the folder, reopen and `claude --resume` |
| Phase 2 | Pick a layout (or parts) |
| Phase 4 | GA4 measurement IDs; approve the privacy wording |
| Phase 5 | GrowthBook account + SDK keys |
| Phase 6 | Cloudflare API token for Actions; WorkOS production keys |
| Phase 7 | Approve the production deploy; sign off |
| Any time | Secret rotation from 2026-11-04 (see `INFRASTRUCTURE.md` §6) |
