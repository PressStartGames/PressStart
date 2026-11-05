# Press Start — the beta landing page

This repository is the website for **Press Start**, a game engine built around Bevy that an AI agent can build in,
run and prove. The site's one job: say what the engine is, prove it with the engine's own output, and collect
beta sign-ups. The founder's brief: "with all the effect and looks and feel, but with our own touch … flashy with
nice animation, while holding the details … hosted as a GitHub page, with the remote server (if need be);
root/server, root/client structure."

- **The plan:** [`PLAN.md`](PLAN.md) (research of 2026-11-01). Read §0a, §3, §4, §5, §6.1, §6.4, §7, §9 before
  building. Where PLAN.md and this file disagree, this file wins (the resolutions are listed at the end).
- **The words:** [`CONTENT.md`](CONTENT.md). All page copy lives there, keyed by section id; code never holds prose.
- **The handover:** the `press-start-site` skill (`.claude/skills/press-start-site/SKILL.md`): the repository, stack,
  deploy, content and data flow, design system, sign-up modes, what is measured and what is open. Read it first.
- **The engine tie:** the `press-start-website` skill (`.claude/skills/press-start-website/SKILL.md`); read it first.
  The reference look: `docs/reference/elyx/` (16 renders + `elyx-facts.json`); the plan's brief: `docs/plan-brief.md`.

## The engine repository (read-only from here)

`C:\Yanivs\GameDev\PressStart` is the engine. It is **never edited from this repository**: no file written, no
cargo run, no commit. The site's facts and counts come from it and are **re-synced, never invented**: numbers are
written by `client/scripts/sync-engine-facts.ts` (argument: the engine checkout's path) into
`client/data/counts.json`, and `CONTENT.md` uses placeholders (`{{catalog.built}}`) for them. Only the engine's
own renders are ever published, and only accepted goldens (never a `*.candidate.png`, never a reference tool's
half of a review pair). Every image gets a provenance row (engine commit, crate, test, source path).

## Layout

```
client/   Vite + React 19 + TypeScript SPA (the site)
          src/{sections,components,lib,pages,content,styles}  data/  assets/renders/  public/  scripts/  tests/
server/   Cloudflare Worker + D1 (the email store): src/index.ts, schema.sql, wrangler.toml, scripts/
docs/     the plan's brief, the reference screenshots
.github/workflows/   ci.yml (both packages), deploy.yml (client -> gh-pages)
```

A pnpm workspace at the root (`client`, `server`); Node pinned in `.nvmrc` (current LTS). Client deploy = a push
to `main` (deploy.yml -> `gh-pages`); no PR preview deploys (Pages has one site), CI builds and tests every PR.

### client/ — the stack (PLAN.md §5, fixed)

- Vite + React 19 + TypeScript (`strict`, `noUncheckedIndexedAccess`); exact versions, each two weeks old or more.
- React Router (library mode): `/`, `/privacy`, `/confirmed` and a not-found page. **Every route is prerendered to
  static HTML at build**: the page paints and reads with JavaScript off.
- **CSS Modules + one `styles/tokens.css`** of custom properties. No Tailwind, no CSS-in-JS.
- **Motion** (`motion`) for the load sequence, scroll reveals and the sign-up flip; CSS for hover springs and the
  tick counter. No WebGL required.
- Images: `vite-imagetools` -> AVIF first, WebP second, `<picture>` with `srcset`/`sizes`, explicit width/height,
  lazy below the fold; pixel-art goldens scaled by integer factors with `image-rendering: pixelated`.
- Fonts self-hosted through `@fontsource` (no runtime Google request), `font-display: swap`, display face preloaded.
- **WCAG 2.2 AA**: landmarks, one `h1`, visible labels, a `role="status"` live region for the form, focus moved to
  the result, a skip link, visible focus rings. **`prefers-reduced-motion` is respected everywhere**: every
  animation has a final-state fallback, which is also the no-JS state.
- **Lighthouse (mobile) ≥ 95 / 100 / 100 / 100**; LCP ≤ 2.0 s, CLS ≤ 0.02, TBT ≤ 150 ms, initial JS ≤ 90 KB gzip,
  first view ≤ 1.2 MB; asserted in `lighthouserc.json` in CI.
- Tests: Vitest (content, sign-up state machine); Playwright e2e + axe on `vite preview`, stubbed API, reduced motion.

### server/ — the email store (PLAN.md §6.1, §6.4)

The smallest backend: **one Cloudflare Worker + D1**, Turnstile verified server-side, a honeypot, **double opt-in**
(a confirmation mail through Resend with an HMAC-signed link). `POST /api/waitlist`; `GET /api/confirm?t=`
(redirects to the site's `/confirmed`); `GET /api/unsubscribe?t=` (deletes the row). The data model is §6's (no IP,
no user agent stored). CORS admits only the site's origin(s). `scripts/export-signups.ts` writes confirmed rows only.

**The client works with the server absent.** The build-time env selects the sign-up mode:
1. `VITE_SIGNUP_ENDPOINT` set (the Worker's URL) -> the real sign-up;
2. only `VITE_SIGNUP_FALLBACK_URL` set -> the form posts to a form service (Kit, PLAN.md §6.6);
3. neither set -> the sign-up block renders a static "coming soon" card (no form, no dead button).
The e2e suite covers all three.

## Hosting

- **Client on GitHub Pages.** `.github/workflows/deploy.yml` (free GitHub-hosted runners) builds `client/` and
  publishes `client/dist` to the `gh-pages` branch on every push to `main`.
- **SPA routing on Pages — decided: prerendered routes + `404.html`; no hash routing.** Each route is emitted as
  `<route>/index.html`, so Pages serves `/privacy` and `/confirmed` directly; the prerendered not-found page is
  copied to `dist/404.html`. Hash routing is refused: it defeats prerendering, link previews and the confirm
  redirect. Vite's `base` comes from `VITE_BASE` (`/` for a custom domain via `public/CNAME`; `/<repo>/` for a
  project page) and React Router's `basename` follows it.
- **The server deploys separately**: `wrangler deploy` from `server/` (by hand, or a `deploy-server.yml` on
  `workflow_dispatch`), D1 migrations from `server/schema.sql`, on its own origin (`*.workers.dev` or `api.<domain>`).

## Ground rules

- Copy lives in `CONTENT.md`; `client/scripts/check-content.ts` fails CI on a missing section or unknown placeholder.
- Numbers come from the sync script against the engine repository, never typed by hand.
- No stock images. No logos of other engines or tools (reference tools are named as plain mono text only).
- **"Unity for AI" is never used publicly** (the engine's internal line); say "the engine an AI builds games in".
- **The status section is on the home page** ("Where we are", plus the hero's small line).
- **Bevy is never named on the site** (main site and beta: copy, meta, alt text, code samples; trim `use bevy::…`
  lines from excerpts and never display a crate name containing `bevy`). Bevy is MIT/Apache-2.0: its notice ships
  with the engine, the website owes no attribution. Internal docs may name it. (Founder, 2026-11-05.)
- **The words "honest" and "honestly" are never used on the site.** The rules about truth still apply; the copy
  just does not say so. `check-content` enforces both rules over CONTENT.md and `client/src`.
- **No dates promised** for the beta or version 1. The present tense only for what is true today (the skill lists
  true today vs roadmap). The engine's internal build lane is never mentioned; no MCP server is claimed.
- No cookies, no trackers; analytics is Cloudflare Web Analytics (cookieless), added at M4. Secrets never committed
  (Worker secrets via `wrangler secret put`; Actions secrets for Cloudflare deploys).

## Design direction (PLAN.md §0a and §4 — our palette and type, never Elyx's)

- **The act change.** Act 1 is **paper** (Option B "Blueprint": page `#F6F4EF`, ink `#15171C`, ink blue `#2F5BFF`,
  press-start red `#E8543A`): the hero, the problem, what Press Start is. A **hard cut** at "How an agent builds a
  game" into Act 2, the dark **booth** (Option A: `#0E1014`, PASS green `#3DDC97`, tick amber `#FFB547`, `#FF5D5D`
  only for a deliberately shown mismatch): the walkthrough, determinism, oracles, goldens, built today, roadmap,
  sign-up, FAQ, footer. The paper act is inset from the viewport edge on the dark body, as in the reference. Both
  token sets live in `tokens.css`; the acts are fixed, not a light/dark toggle.
- **Type:** Instrument Serif (display, regular weight) + Inter Tight (body) + JetBrains Mono (code, numbers,
  checksums). One ~760 px reading column; renders break out to 1200 px.
- **Our annotation idiom** is the booth's own marks (the PASS stamp, the tick counter, the golden's crop frame), not
  Elyx's highlighter.
- **One fixed CTA pill** ("Join the beta", top-right on every scroll position, scrolls to the sign-up) and **one
  stacked sign-up card**; success turns it into the "Player 1 ready" cartridge (no queue number).
- **The hero, "two runs, one game":** two panels of the same frame (`run A`, `run B`) over mono checksum columns; the
  tick counter runs 0 -> 128 and every matching line flashes PASS green. On paper, the strip is a booth-dark window.
  Placeholder frames and checksums until M3 brings the real ones.
- **Flashy but purposeful motion:** a page-load sequence (wordmark, kicker, h1, the replay strip starting),
  scroll-driven section reveals, the horizon cut animated as the paper lifts away, hover micro-interactions (spring
  pills, an orbiting outline on the CTA, tile count-ups), the sign-up flip. Every animation shows a fact or guides
  the eye; nothing runs on the main thread once the sequence ends; all of it collapses to the final state under
  reduced motion.

## Work order (PLAN.md §9; each milestone's "done when" there is the bar)

1. **M1** — the static client: every section from CONTENT.md, both acts, the design and the motion, a placeholder
   sign-up (stub endpoint / coming-soon card), deployed to GitHub Pages. CI green, Lighthouse met, JS-off renders.
2. **M2** — `server/` and the real sign-up: Worker, D1, Turnstile, double opt-in, confirm/unsubscribe, `/privacy`,
   `/confirmed`, the export script.
3. **M3** — screenshots and motion polish: accepted goldens with provenance rows, the hero's real frames and
   checksums (the booth capture is an engine-side task that needs the founder's go), the contact sheet, the synced
   number tiles.
4. **M4** — SEO and analytics: title/description, Open Graph + X cards, sitemap, robots, canonical, JSON-LD,
   Cloudflare Web Analytics, a sign-up/confirmation count query. Open questions (PLAN.md §10) go to the founder.

## Commands (root, pnpm workspace; keep these script names when you create them)

```
pnpm install                         # both packages
pnpm --filter client dev             # the site on localhost:5173
pnpm --filter client build           # prerendered static site -> client/dist (+ 404.html)
pnpm --filter client preview         # serve the build
pnpm --filter client test            # vitest;  test:e2e = playwright + axe
pnpm lint                            # eslint + prettier --check + tsc --noEmit + check-content, both packages
pnpm --filter client sync-facts -- C:/Yanivs/GameDev/PressStart   # refresh client/data/counts.json
pnpm --filter server dev             # wrangler dev (local D1)
pnpm --filter server deploy          # wrangler deploy + d1 migrations apply
pnpm --filter server export:signups  # confirmed rows -> CSV
```

## PLAN.md points this file settles

- Hosting: §6.5 puts the site on Cloudflare; the founder chose GitHub Pages, so only the email store is a Worker and
  §8's per-PR preview deploys are dropped. Layout: §8's `src/` + `worker/` becomes `client/` + `server/`.
- §4.1's "at most four motion moments" yields to "flashy with nice animation"; §4.3's dark default with a
  `prefers-color-scheme` light theme yields to §0a's fixed act change; the hero is on paper with a booth window.
- The preamble's "no Elyx screenshots" is superseded by §0a; `website/shots/` = `docs/reference/elyx/`,
  `website/brief.md` = `docs/plan-brief.md`. §8's name `press-start-site` is the founder's call (open question 2).
