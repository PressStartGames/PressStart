# Brief — the Press Start beta landing page: research and plan (no code yet)

The founder is opening a separate organisation and repository for the engine's website, to be built as a React SPA.
Your deliverable is ONE plan document, `C:\Users\neta\AppData\Local\Temp\claude\C--Yanivs-GameDev-PressStart\959323ff-1399-4b66-ac7d-903a2444c1b5\scratchpad\website\plan.md`
(plus any notes/screenshots in that same `website/` directory). Nothing in the engine repository (C:\Yanivs\GameDev\PressStart) is edited; no cargo; read-only there.

## 1. Learn the reference look: https://elyx.design/

Fetch it. If it is a single-page app whose content does not come through a plain fetch, use the Claude in Chrome
tools (load them with ONE ToolSearch call: `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__tabs_close_mcp,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__javascript_tool`; call tabs_context first, open a NEW tab, close it when done). Record, with screenshots saved under `website/ref-elyx-*.png` where the tools give you one:
- the page structure top to bottom (hero, sections, their order, the beta/waitlist block, footer);
- the typography (families if you can read them from the CSS, scale, weights), the palette, spacing rhythm, the grid;
- motion: what animates on load, on scroll, on hover; how heavy it is;
- the beta/waitlist mechanics: what the form asks, what happens on submit, any social proof (counts, logos);
- what makes it feel the way it feels, in five sentences a designer could act on.
Also read https://bevy.org/ (and its "features"/"learn" pages) as the second reference: how an engine's page sells
itself, what sections it has, how it shows code and screenshots, and how it handles "early stage" honesty.

## 2. Learn the product so the copy is true

Read, in the engine repository: `README.md`, `docs/00-build-a-game.md`, `docs/INDEX.md`, the catalog index under
`docs/catalog/`, `docs/research/system-design-law-and-ai-connection.md`, `docs/research/user-flow-and-editor.md`,
`docs/12-orchestration.md` (for the "tests, not eyes" and oracle ideas) and `plans/parity-gaps.md` if present.
Extract the selling points as the engine itself states them: built around Bevy; AI as a first-class citizen ("Unity
for AI": a game is as natural for an AI to build as Unity is for a human); everything is data (scenes, laws and
assets as documents an agent can read and write); deterministic replay; extremely multi-thread friendly (Bevy ECS
scheduling, the lane's parallel batteries); speed with oracle parity (every feature judged against an industry
oracle: Unreal, Unity, Blender, Jolt, PhysX, Recast …); tests not eyes (pixel and geometry legs, goldens); the
feature catalog (what is BUILT today, counted — give the count from the catalog README); our own source-available
licence; optional login nothing requires; CI on free runners. Every claim in the plan cites the file it came from.
Say which claims are TRUE TODAY and which are the road (version 1 not yet public): the page must not oversell.

## 3. The plan document — sections

1. Positioning: one-line promise, three-word tagline candidates (5), audience (game authors using AI agents; AI
   tool builders; Bevy developers), the beta's ask (email for early access).
2. Page structure: every section in order with its purpose, headline draft, body copy draft (short, specific,
   no marketing filler), and what visual it carries (screenshot of the editor, a code/document sample, a diagram
   of the data flow, a number tile from the catalog). Include a "What is built today" section with honest counts,
   a "How an agent builds a game" walkthrough, a "Why determinism and data" section, a "Roadmap / what beta
   means" section, the beta sign-up block, FAQ, footer (licence, GitHub, Discord/contact).
3. Visual direction: what we borrow from Elyx (the feel, the rhythm, the motion restraint or boldness), what we do
   differently (our own palette and type: propose two palette options with hex values and two type pairings from
   Google Fonts, with reasons tied to the product), dark-first or light-first and why, the hero's one bold element.
4. Tech stack: React SPA as the founder wants — propose Vite + React + TypeScript, routing, a CSS approach
   (Tailwind vs vanilla-extract vs CSS modules: pick one, say why), animation library choice (Framer Motion vs
   GSAP vs CSS only), image handling (AVIF/WebP, responsive sizes), accessibility and reduced-motion, Lighthouse
   targets, analytics choice that respects privacy.
5. Hosting and the email store. The founder has an account at a very well-known cloud provider whose name he
   remembers as "cloudfront / cloud formation / fire-cloud": those are AWS CloudFront, AWS CloudFormation and
   Google Firebase. Cover BOTH AWS and Firebase (and Cloudflare Pages as the third option), each with: how the SPA
   is hosted (S3 + CloudFront; Firebase Hosting; Cloudflare Pages), the free tier's limits as of today (cite the
   pricing page URL), and the smallest possible email-collection backend (AWS: API Gateway HTTP API + Lambda +
   DynamoDB, or a Lambda function URL; Firebase: Firestore with security rules + a callable function or direct
   client write with App Check; Cloudflare: a Worker + D1 or KV) with a cost estimate at 0, 1k and 10k sign-ups,
   spam protection (hCaptcha/Turnstile, double opt-in), export path (CSV), GDPR/privacy line. Recommend one with a
   sentence. Also list two zero-backend alternatives (a form service: Formspree, Tally, Buttondown, ConvertKit)
   with their free limits, as the fallback if the founder wants no backend at all.
6. Image and asset pipeline: where screenshots come from (the engine's own goldens and review PNGs under the
   repository — name the directories you find, e.g. crates/*/goldens, oracles/review — and the rule that we only
   publish our own renders), how they are stored (in the website repo vs an object store/CDN), formats and sizes.
7. Repository layout for the new org: directory tree, CI (GitHub Actions on free runners: lint, typecheck, build,
   Lighthouse CI, deploy), branch flow, environment variables and secrets, a `CONTENT.md` where the copy lives
   separately from components so it can be edited without code.
8. Milestones: M1 static page with placeholder sign-up, M2 real sign-up backend, M3 screenshots and motion polish,
   M4 analytics and SEO (Open Graph, Twitter card, sitemap), each with a done-definition.
9. Open questions for the founder (at most eight), each with your recommended answer.

Cite every external fact by URL with the date read. Keep the document under ~900 lines. Hand back the plan's path,
a ten-line summary, and the open questions.
