# The main site at pressstartgames.net — research (2026-11-05)

Research only; nothing is built yet. Scope from the founder: the engine's main website at
`https://pressstartgames.net/` (React Router), the current beta moving to `/beta` (same console/arcade
style), four layout directions in four worktrees, Google Analytics, a proper pipeline, split testing and
feature flags, a React standard for admin + beta + main, and the repo/folder rename to `PressStartWeb`.
`admin.pressstartgames.net` stays as it is.

Sources read: `mission/README.md`, `mission/strengths.md`, `mission/roadmap.md` (the pitch, the pain, the
four strengths with evidence, the road, the decisions, the audience), the engine sites below, and the
technical references listed at the end.

## 1. What the engine sites do (for inspiration, not copying)

| Site | Top navigation | Home page, top to bottom | Main CTA |
|---|---|---|---|
| unity.com | Games, Industry, Resources, Community, Learning, Support, Pricing — each a mega-menu with columns (e.g. Games: Develop / Deploy / Grow / Use cases) | Hero video + download → latest cards → "game development, unified" (three pillars) → one section per pillar → testimonials from shipped games → capabilities (C#, 2D/3D, 25+ platforms) → learn + discuss → tutorials → pricing teaser → industry | Download Unity (repeated), Explore plans |
| godotengine.org | Features, Console support, Priorities, Showcase, Blog, Community, Assets; utility row Download, Docs, Contribute, Donate | Hero + download → latest news (4 cards) → latest releases → "a different way to make games" (7 feature cards) → get involved (Code / Document / Report) → sponsors | Download Latest, What's new |
| bevy.org | Getting Started, Learn, News, Community, Foundation, Assets, Examples, Donate, GitHub | Hero → one long section per feature, each with a short claim and a code sample or picture (ECS, 2D, 3D, render graph, animation, cross platform, UI, scenes, sound, hot reload, compile times) → free and open source → supporters | Get Started |
| defold.com | Features, Showcase, Learn, Assets, Community, Blog, Support; utility API, Free, Download | Hero with featured games → value badges (Free forever, Cross-platform, Production ready, Source available) → all you need → ship everywhere → no setup → customize → Free. Forever. (licence) → production ready → learn cards → what's new → closing download CTA → partners | Download Defold now |
| unrealengine.com | Not fetchable (HTTP 403 to automated tools, archive also blocked). From general knowledge, to be checked by eye: a cinematic full-bleed video hero, tabs or tiles per industry, flagship-technology showcases (Nanite, Lumen, MetaHuman), a showcase of shipped work, licensing, learning, marketplace (Fab), Download | | Download |

Patterns worth taking: a mega-menu grouped by what a visitor wants to do (Unity); a value-badge strip
right under the hero (Defold); one section per capability with real evidence beside it (Bevy, which suits
our "every claim has a number"); a licence page that answers money in one screen (Defold, Unity pricing);
news and roadmap kept live (Godot); a cinematic hero (Unreal). What none of them has and we do: published
misses (catalog tallies, the caveats section), the replay/checksum proof, the oracle table.

## 2. Proposed site map (first cut)

```
/                     home
/engine               what it is; sub-pages per strength:
  /engine/determinism   /engine/parallel   /engine/oracles   /engine/ai   /engine/ownership
/showcase             Team Fights (and later games), only the engine's own renders
/roadmap              the road in order, waves with their state (from mission/roadmap.md, re-synced)
/learn                "build a game" guides (later: docs); for now the shape of a game and the four verbs
/news                 posts (version notes, wave closes)
/licensing            source-available terms in Unreal's shape, the royalty shape, "nothing requires a login"
/about                the mission, the method, who it is for
/community            GitHub, Discord (when the MCP gives the link), contact
/beta                 today's beta landing page, unchanged in content
  /beta/confirmed       /beta/privacy   (and its 404)
/privacy  /terms  /cookies   site-wide legal (needed once analytics exist)
```

The **Join the beta** button links to `/beta`; it sits behind a feature flag so it can later become
**Download** without a deploy. Every count stays synced from the engine (the existing sync script and
CONTENT.md placeholders), never typed.

## 3. Four layout directions (one worktree each), all in the console/arcade palette and type

| # | Name | Inspired by | Shape |
|---|---|---|---|
| L1 | **Cinematic** | Unreal | Full-viewport hero with the replay simulation as the "video"; audience tabs (studios, solo devs, AI-tooling builders, Bevy devs) each re-telling the pitch; big flagship blocks for the four strengths; showcase strip; licence CTA |
| L2 | **Platform suite** | Unity | Mega-menu; three pillars (Build as data → Prove → Own the code) each with its own deep section; evidence cards; learn + licensing teasers; a dense, product-company feel |
| L3 | **Community engine** | Godot + Defold | Value-badge strip (Deterministic · All cores · Measured · Yours); feature card grid; live roadmap and news on the home page; "get involved" and the beta; light and fast |
| L4 | **Feature tour** | Bevy | One long scroll, one section per capability, each with a code sample or a live proof (checksum ledger, core board, golden wipe); a sticky section index like the beta's spine |

Each keeps the console identity (chassis grey, phosphor screens, pixel labels, mono readouts), with more
and better motion than the beta, using the GSAP layer we already have (pin-and-scrub, SplitText) and the
honesty rules in `.claude/skills/press-start-website/SKILL.md`.

## 4. Architecture: routing and hosting (the part that must not break the beta)

**One app, one router.** The main site and the beta become one React app with nested routes:
`/` (main layout) and `/beta/*` (the beta's own layout, its current pages as children). React Router 7
in **framework mode** with `ssr: false` and an explicit `prerender` list gives route modules, per-route
`meta`, code-splitting per route and static HTML for every route (basename + prerender with `ssr:false`
was fixed in 7.8.1; we pin 7.18.x). The current home-made prerender script stays the fallback if
framework mode misbehaves.

**Hosting moves from GitHub Pages to Cloudflare** (the domain is already on Cloudflare): the built site is
served as Workers static assets on a route `pressstartgames.net/*`, while the API keeps its more specific
route `pressstartgames.net/api/v1/*` (the most specific route wins — to verify on a test path before the
switch). GitHub Pages can only serve one host per repo and cannot sit behind the root alongside the API.
Note: prerendering *inside* the Cloudflare Vite plugin is still uneven (open issue workers-sdk #16113), so
we build to plain static files and serve them; no SSR on Workers.

**Keeping the beta working, step by step:**
1. Build the new app locally with `/beta/*` rendering today's pages byte-for-byte in content; e2e runs the
   existing beta suites against `/beta`.
2. Worker var `SITE_URL` → `https://pressstartgames.net/beta`, so confirm links redirect to
   `/beta/confirmed`. Mails already sent link to the API, which redirects using the new `SITE_URL`: they
   keep working.
3. `beta.pressstartgames.net/*` → 301 to `pressstartgames.net/beta/*` (a Cloudflare redirect rule; the
   `beta` record becomes proxied). GitHub Pages is retired after a grace period.
4. CORS: add `https://pressstartgames.net` to `ALLOWED_ORIGINS`.
5. Admin, API and the D1 data are untouched.

## 5. Google Analytics: a conflict to decide first

Today the site, the privacy page, CLAUDE.md and `mission/README.md` all promise **no cookies and no
trackers**. GA4 sets cookies and, for EU/UK visitors, needs **prior opt-in consent**: defaults set to
denied before the tag loads (Consent Mode v2: `ad_storage`, `analytics_storage`, `ad_user_data`,
`ad_personalization`), a banner with real choices, GA blocked until consent, and the privacy page
rewritten to name Google as a processor. Consent Mode alone does not make GA4 lawful; it sits on top of a
consent-gated setup. Options:
- **GA4 + a consent banner** (what was asked): the promise changes; EU numbers will be partial (only
  consenting visitors).
- **Cookieless analytics** (Cloudflare Web Analytics, already in the plan; or PostHog in cookieless mode):
  no banner, the promise stands, less detail.
- Both: cookieless for everyone, GA4 only after opt-in.

## 6. Split testing and feature flags

| Tool | Free tier (third-party summaries, check before choosing) | Fit |
|---|---|---|
| **GrowthBook** | Cloud: 3 users, 1 project; self-hosted: unlimited (needs a server) | A documented Cloudflare Workers edge app (variant chosen at the edge, no flicker, consent-aware cookie option); open source |
| **PostHog** | 1M flag requests/month, experiments, analytics, replay in one | Could also be the analytics; no first-party edge integration found |
| **Statsig** | Unlimited flag checks, ~1–2M events | Strong statistics; ownership changed (Amplitude), pricing may shift |
| **Our own** | Free | A small table in D1/KV, assignment in the site Worker, results in our analytics; no stats engine |

Constraint from our stack: the pages are prerendered static HTML, so a variant must be chosen **before**
the HTML is served (in the Worker that serves the site) to avoid a flash of the wrong content. That
favours GrowthBook's edge app or our own Worker; client-only tools would flicker. The assignment cookie is
not strictly necessary, so in the EU it falls under the same consent decision as analytics.

## 7. The pipeline

- **Every PR:** install, lint, typecheck, unit tests, build all three apps (site, admin, API), Playwright +
  axe on the site and admin, Lighthouse budgets, a **preview deploy** (`wrangler versions upload` gives a
  preview URL per version) commented on the PR.
- **main:** production deploy of the site and admin; the Worker deploy with D1 migrations behind a manual
  approval (GitHub environment), since it touches live data.
- Needs a scoped Cloudflare API token as a GitHub Actions secret (Workers + D1 + routes; not DNS), and the
  CRLF line-ending problem on this Windows machine fixed with a `.gitattributes` (`* text=auto eol=lf`),
  which has caused noise in every round so far.

## 8. React standard for admin, beta and main

- **Vercel `react-best-practices` skill** (`vercel-labs/agent-skills`, MIT, 70 rules in 8 categories by
  impact: waterfalls, bundle size, server, client fetching, re-renders, rendering, JS, advanced). Much of
  the server half is Next.js-specific; the client, re-render, rendering, bundle and JS rules apply to us.
- **react.dev's own rules** (purity, rules of hooks, no state derived in effects) enforced by
  `eslint-plugin-react-hooks` 7 (already installed; its recommended set includes the React Compiler
  rules), TypeScript `strict` + `noUncheckedIndexedAccess` (already on), React Router route-module
  conventions.
- Proposal: a project skill `press-start-react` = the applicable Vercel rules + react.dev + our own rules
  (accessibility, reduced motion, copy only from CONTENT.md, the performance budgets), enforced by lint
  where a rule can be, and used as the review checklist for all three apps.

## 9. The rename to PressStartWeb

- **GitHub:** renaming `PressStartGames/PressStart` → `PressStartWeb` keeps redirects for clones, links
  and the API; Actions and secrets move with it. (Mission files already name the target `PressStartWeb`.)
- **Folder:** `C:\Yanivs\GameDev\PressStartGames\PressStart` → `...\PressStartWeb`. Claude Code keeps
  sessions and memory per folder path (`~/.claude/projects/<path-slug>/`), so after the rename the
  project directory is copied to the new slug and `claude --resume` is run from the new folder. The rename
  must happen with no process holding the folder (close dev servers and this session first).
- `INFRASTRUCTURE.md`, the skills and CLAUDE.md are updated to the new names.

## 10. Proposed order

0. Rename (repo, folder, session) and `.gitattributes`.
1. Routing skeleton, locally: the one app with `/` (placeholder) and `/beta/*` (today's pages); the
   existing beta e2e green under `/beta`; the confirm flow tested end to end against a local Worker.
2. The four layout worktrees for `/` (L1–L4).
3. The React standard (skill + lint) applied to all three apps.
4. Analytics + consent (once decided), flags and the split-testing setup.
5. The pipeline with preview deploys.
6. Cut-over: Cloudflare hosting for the root, `beta.` redirect, `SITE_URL`, GitHub Pages retired.

## Sources

- Engine sites: https://unity.com/ · https://godotengine.org/ · https://bevy.org/ · https://defold.com/
  (unrealengine.com refused automated access)
- React Router: https://reactrouter.com/how-to/pre-rendering ·
  https://reactrouter.com/api/framework-conventions/react-router.config.ts · https://reactrouter.com/changelog ·
  https://github.com/remix-run/react-router/issues/12083 · https://github.com/remix-run/react-router/discussions/13603 ·
  https://github.com/cloudflare/workers-sdk/issues/16113
- GA4 and consent: https://swetrix.com/blog/google-analytics-cookie-consent-requirements ·
  https://blog.lueurexterne.com/en/blog/google-analytics-4-and-consent-mode-v2-a-practical-guide-for-2026/ ·
  https://cookieconfirm.com/guides/google-analytics-gdpr/
- Split testing: https://docs.growthbook.io/lib/edge/cloudflare · https://abtesting.cc/blog/growthbook-vs-posthog/ ·
  https://abtesting.cc/blog/statsig-vs-growthbook/ · https://dripagency.de/blog/growthbook-vs-statsig
- React standard: https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices ·
  https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md
