# Press Start beta landing page: research and plan

Written 2026-11-01 for the brief `website/brief.md`. This is research and planning only. It contains no website
code, nothing was published, and nothing in the engine repository was edited.

**How to read the citations.**
- External facts carry their URL and "(read 2026-11-01)".
- Engine facts carry a repository path relative to `C:\Yanivs\GameDev\PressStart`.
- Counts that I derived myself give the command I used.

**The reference look.** The Claude in Chrome tools did not load: the one `ToolSearch` call the brief names returned
"No matching deferred tools found". So there are no `ref-elyx-*.png` screenshots. To make up for it, I studied
elyx.design from its HTML, its two stylesheets and its seven first-party scripts, which I downloaded with `curl` into
a scratch directory outside the repository. Everything I say below about its type, palette and motion was read from
that code. Anything I could only infer from the code, and could not see, is marked *(inferred)*.

---

## 0. What the references teach

### 0.1 elyx.design

**Stack.** The site is built with Astro, using Astro's own "islands" scripts and no client framework. The asset paths
are `/_astro/*`, the file names follow `*.astro_astro_type_script_*`, and an inline `vercel-speed-insights` element
shows it is hosted on Vercel with Vercel Analytics and Speed Insights (source of `https://elyx.design/`, read
2026-11-01).

**Structure, top to bottom** (from `<section>` and `<h1>/<h2>` in the HTML, with the text from a WebFetch of the
same page):
1. **Header.** The wordmark "Elyx · Where design means more" and a pill button, "Join the private beta". The pill
   opens a `<dialog id="private-beta">` that holds the sign-up form, so the form is not inline in the hero.
2. **Introduction (`h1`).** "Are design tools still relevant in the age of AI?" It is followed by a short problem
   essay: one-shot generators, vibe-coded canvas editors, tools that "charge you rent" for your designs, exported
   code that does not fit your codebase, and the closing line "Our source of truth is lost." A hand-drawn SVG
   "tangle" diagram (`tangle-strand`, `tangle-node`, `tangle-arrow`) illustrates it.
3. **"So, we're building something new. And we're calling it Elyx."** This section carries `data-horizon`, the
   point where the page's theme turns over (see Motion).
4. **"Three parts" (`parts-title`).** The three parts are a language (.elyx files), an editor, and lower-level tools
   (a CLI and agent skills). The section has a Venn diagram (`venn-circle`, `venn-wash`) and a canvas aurora.
5. **"Local-first" (`local-title`).** Files live in your git repo; bring your own agent or model; nightly drift
   checks.
6. **"Integrated Development Design Environment" (`editor-title`).** A native GPU renderer and a freeform canvas,
   "not a prompt box hiding an expensive AI subscription".
7. **"Ready for AI" (`ai-title`).** "The model is replaceable; your design files are not."
8. **"Where design means more" (`design-title`).** Files are split, imported and linked wiki-style into a living
   design system.
9. **The invite panel (`invite-panel`) with the second form.** It has the same fields as the dialog's form.
10. **Footer.** "Elyx · © 2026 · Privacy · X". The text is small (15 px) and centred.

**Typography** (`/_astro/Base.C8pMDUxO.css`, read 2026-11-01):
- **Families.** Display is *Tiempos Headline* (Klim, commercial) in 400, 700 and 700 italic. Body is *Söhne* (Klim,
  commercial) in 300, 400 and 600. Both are self-hosted woff2 with `font-display: swap`, and the 400 body and the
  700 headline are preloaded.
- **Scale.** Display 64/72 px, lead 52/62, section 32/40, body **20/32**, the sign-up text 22/26 and small 15. Below
  859 px every size clamps (for example the display is `clamp(40px, 7.5vw, 64px)`).
- **Details.** Headlines are 400 weight (not bold) with `letter-spacing: -.01em`. The measure is **780 px**: a single
  column, set like an essay.

**Palette** (the same file):
- **Base.** `--background:#131313`, `--foreground:#fff`, body text `#fffc` (80 %), muted `#ffffff80`, faint
  `#ffffff59`, borders `#fff3` and `#2f2f2f`.
- **Accent.** One accent, `#dc81ff` (orchid).
- **Gradients.** The brand gradient is `linear-gradient(270deg in oklch, #4feaff, #ff4664, #4feaff)` (cyan to red,
  interpolated in OKLCH). The text gradient is white → `#b2fcff` → `#94a5ff` → white.
- **Buttons.** The pill buttons are white with `#151515cc` text.
- **Theme turnover.** `color-scheme: dark`. The footer's text colour is `#00000080`, which together with
  `data-horizon` and `data-blackout` was read as a turn to light below the horizon *(inferred — WRONG: §0a, rendered, shows cream above the horizon and black below)*.

**Spacing and grid.**
- Spacing tokens: `--space-top: 228px` above the hero (88 px on phones), `--space-section: 56px`,
  `--space-heading: 20px`, `--space-paragraph: 24px`, `--gutter: 24px`.
- Radii are 6, 8, 10 and pill. Controls are 54-56 px tall.
- There is no multi-column grid. A diagram may break out wide (one SVG is 1472 px), but the text column stays at
  780 px.

**Motion** (scripts read 2026-11-01). The motion is restrained but crafted. About 27 KB of first-party scripts plus an
11 KB WebGL aurora run it, with no animation library.
- *On load:* the hero headline is written in as an "ink" stroke. `Ink.js` and `Introduction.js` draw SVG paths
  through the Web Animations API, with the keyframes `intro-wipe`, `intro-fade` and `intro-enter`.
- *On scroll:* the tangle diagram animates as it enters the view (IntersectionObserver), and the page crosses the
  dark-to-light horizon.
- *Behind the form:* a WebGL aurora (`aurora.js`, `getContext('webgl', {alpha:false, antialias:false})`).
- *On hover:* the pill buttons grow with a spring (`cubic-bezier(.34,1.56,.64,1)`, 0.45 s), and a gradient outline
  orbits them (`@keyframes control-outline-orbit`).
- *On success:* the form flips into a holographic "ticket" (`ticket-grain`, `ticket-sweep`, `foil-text`) with the
  title "Thanks!".
- *Durations and easing:* 0.12-1.2 s on named easing tokens.
- *Reduced motion:* every script checks `prefers-reduced-motion`, and the CSS has seven `reduce` blocks. An inline
  fallback marks the intro complete after 2 s if the scripts never start, and skips it on a back/forward navigation.

**Beta and waitlist mechanics** (`SignupForm.js`, read 2026-11-01):
- **Fields.** Email (required), "Your role" (optional) and a hidden honeypot named `website` (`class="trap"`). There
  is no CAPTCHA.
- **Submit flow.** The client POSTs JSON `{phase:"prepare"}` to `/api/waitlist`. The server answers `proceed` with a
  third-party endpoint and its fields. The client then posts form-encoded data to that endpoint (credentials
  omitted, 8 s timeout). If the third party is unreachable or returns 429, it calls `/api/waitlist` with
  `phase:"fallback"`.
- **States.** `success`, `existing` ("You have already signed up."), `invalid` and `error`. A live `role="status"`
  region announces them, and focus moves to the result.
- **After submit.** It says "Check your inbox to confirm your email.", so it is **double opt-in**.
- **Social proof.** None: no counts, no logos.

**Why it feels the way it does** (for a designer):
1. It reads like a letter, not a brochure: one 780 px column, a serif display at regular weight, and a 20 px body with
   generous leading.
2. It earns its pitch by naming the problem first, at length and with an opinion, before the product is named.
3. It is almost colourless (#131313 and white at four opacities) and spends colour only on one gradient and one
   orchid accent, so the colour means something.
4. The motion is rare but handmade (an ink-drawn headline, one diagram that untangles, one aurora behind the ask), and
   it all switches off for reduced motion.
5. The ask appears twice, in the header and at the end, and the reward for signing up is a small object (the foil
   ticket), not a toast.

### 0.2 bevy.org

**The home page** (`https://bevy.org/`, read 2026-11-01):
- **Hero.** "A refreshingly simple data-driven game engine built in Rust", the line "Free and Open Source Forever!"
  and a "Get Started" button.
- **Feature sections**, one image each: Data Driven (ECS: fast, simple, capable), 2D renderer, 3D renderer, render
  graph, animation, cross-platform (platform logos), Bevy UI, scenes, sound, hot reloading, productive compile times
  ("0.8-3.0 seconds"), free and open source (MIT or Apache 2.0).
- **Then:** the quick-start call to action, a supporters wall (tiers from $25 to $6000 a month, with logos) and a
  footer with only community links (GitHub, Discord, Bluesky, Mastodon, Reddit, itch.io, Atom).
- **Code.** All code on the home page is shown as images; there is no inline code text.
- **Honesty.** The home page itself carries no stability warning.

**The honesty is on the Learn page** (`https://bevy.org/learn/quick-start/introduction/`, read 2026-11-01): "Bevy is
still in development. Important features are missing, and documentation can be sparse." It adds that a breaking
release comes about every 3 months, and it recommends Godot for a "Next Big Project".

**Lessons for us.**
- One concrete feature per band, each with a real picture, works for an engine. We should do the same with our own
  renders, but keep the bands short.
- Put the honesty on the home page, not one click away, because our product is not public yet.
- Show code and documents as real, selectable text, not images: our audience includes agents and people who copy.

---

## 0a. What Elyx actually looks like, rendered (2026-11-01, the repository's pinned headless Chromium 1243, 1440×900 and 390×844; screenshots in `website/shots/elyx-*.png`)

The inference in §0 that the page "turns light below the horizon" was the wrong way round. Seen:

- **It starts LIGHT and turns DARK.** The page body is near-black (`rgb(19,19,19)`), but the whole first act sits on a warm
  cream card (about `#ECEBE6`) inset from the viewport edge by a thin dark margin. The hero, the problem statement
  ("Most tools rely on owning your designs"), the scribble illustrations and the "We can build faster than ever…"
  manifesto are all on cream. At the horizon the cream ends and the rest of the page (the three-part Venn diagram,
  local-first, the IDE section, "ready for AI", "the new source of truth", the sign-up) is on black, white serif
  headings, grey body. The sign-up block sits on a soft rainbow aurora bleeding up from the bottom edge.
- **Hand-drawn annotations are the signature.** A pink marker underline under the italic word *relevant*; a pink
  highlighter stroke over the key sentence of a paragraph; a yellow highlighter scribble filling the whole
  manifesto block; a tangled pen-line "cursor spaghetti" illustration with arrow-cursor heads; a small pink padlock
  doodle by "owning your designs". On the dark half the same role is played by iridescent gradient strokes
  (a purple underline under "the new source of truth", the gradient-bordered Venn overlap).
- **Type.** Display *Tiempos Headline* (serif) at very large sizes, regular and italic; body *Söhne* (grotesk).
  On the cream half some section heads are the grotesk in heavy weight ("Most tools rely…", the manifesto); on the
  dark half every head is the serif. Body measure about 60–65 characters, generous line height.
- **Layout.** One column, centred, text left-aligned inside a ~760 px measure; the Venn section is a two-column
  split (diagram left, head + copy right); large vertical whitespace between sections (300–500 px of nothing).
- **The persistent button.** "Join the private beta" is a pill with a thin rainbow-gradient border, fixed top-right
  on every scroll position, white on dark and white on cream alike.
- **Sign-up.** One stacked card: "Your email" and "Your role (Optional)", gradient border, a wide white "Sign Up"
  pill under it; footer "Elyx · © 2026 · Privacy · X". No logos, no counts, no social proof anywhere.
- **Phone.** The same one column; the hero wraps to three lines, the spaghetti drawing scales down, nothing hides.

**What this changes in §4 (visual direction).** The borrowable move is the ACT CHANGE: a paper-coloured opening that
states the problem in the reader's world, then a hard cut to the product's own dark world for the proof. For Press
Start that maps to: the problem and the "what it is" on paper tokens (Option B), the horizon at "How an agent builds
a game", and everything that shows the engine (renders, goldens, the two-runs hero, sign-up) on the booth tokens
(Option A). Our annotation idiom is not markers but the booth's own marks: the PASS stamp, the tick counter, the
golden's crop frame. Keep Elyx's one fixed CTA pill and its single stacked sign-up card.

## 1. The product as the engine states it (claims with sources; TRUE TODAY vs ROAD)

| claim | status | source |
|---|---|---|
| A game engine built around Bevy; it builds the pieces Bevy is missing (terrain, shader graphs, VFX, particles, networking, input, animation, rigging, modeling, localization) | TRUE TODAY as a direction; the pieces exist at the counts below | `README.md`; `docs/01-direction.md` |
| The internal line "Unity for AI": developing and testing a game is as natural for an AI as Unity is for a human | the engine's own line. See open question 5 about using it publicly | `README.md`; `docs/13-positioning.md` "In one line" |
| Runs on Bevy 0.19.1 | TRUE TODAY | `docs/00-build-a-game.md` §1 |
| 89 `press_start_*` engine crates | TRUE TODAY | `docs/00-build-a-game.md` §1; `ls crates \| grep -c press_start` = 89 on 2026-11-01 |
| Games are real Rust codebases the author owns | TRUE TODAY. The first game, Team Fights stage 1, is seven `press_start_ts_*` crates | `docs/01-direction.md` pillars; `docs/00-build-a-game.md` §1, §6 |
| Everything is data: a scene is a document (base plus override patches, tombstones, keyed lists, one byte form); every system is a document validated before the app exists, then a plugin | TRUE TODAY | `docs/00-build-a-game.md` §2; `docs/04-data-spec.md` §1 |
| An agent drives a running game through four verbs (query, command, capture, control) plus input injection | TRUE TODAY as the in-repo wire. **No MCP server is offered.** The external-agent door is the editor's brokered API, which is ROAD | `docs/10-ai-layer.md` §2 and its 2026-09-04 amendment (ruling 13a) |
| Deterministic replay: one seed, no wall clock and no sleep in logic, a fixed tick, the boundary checksum tick by tick | TRUE TODAY, **scoped to the same binary on the same platform**. A cross-machine claim waits for its own gate | `docs/00-build-a-game.md` §3; `docs/13-positioning.md` "Determinism by construction"; `AGENTS.md` rule 1 |
| Multi-thread friendly: Bevy's ECS runs systems in parallel. An ambiguity gate refuses an unordered pair of conflicting systems by name, and a doctrine allows only ordered or order-independent reductions, so parallel work stays deterministic | TRUE TODAY (the gate and the doctrine). Do not claim a speed-up number; none is recorded for the page | `docs/00-build-a-game.md` §2 "The headless app"; `docs/15-determinism-parallelism.md` |
| The "lane": the internal parallel build and test batteries (18 of 24 threads) | an internal development tool, **not a product claim**. Leave it off the page | `CLAUDE.md`; `docs/12-orchestration.md` |
| Every feature is judged against an industry oracle (Unreal, Unity, Blender, Jolt, PhysX, Recast, Chromium layout, HarfBuzz, ICU, Mitsuba, Manifold, meshoptimizer, xatlas, Yoga …); a difference is a recorded row with both numbers | TRUE TODAY as a method: 71 oracle directories under `oracles/` | `docs/12-orchestration.md` "Oracles everywhere"; `docs/13-positioning.md` §2; `ls -d oracles/*/ \| wc -l` = 71 on 2026-11-01 |
| The speed bar is parity: at or under the oracle's wall time (1.0×) | TRUE as **the bar**, NOT as an achievement. A speed miss is a recorded debt | `docs/12-orchestration.md` ruling 69 |
| Tests, not eyes: pixel and geometry legs; goldens are never accepted by a tool; every picture is shot on one reference card (Intel UHD 770) | TRUE TODAY: 189 accepted golden PNGs and 939 candidates under `crates/*/goldens` | `docs/12-orchestration.md` standing rulings; `docs/00-build-a-game.md` §3; `find crates -path '*goldens*' -name '*.png'` on 2026-11-01 |
| The feature catalog: **404 entries; 103 BUILT, 129 PARTIAL, 32 SKIP, 9 CRATE-EXISTS-UNJUDGED, 131 UNDETERMINED**. BUILT means every clause of the row is held by a landed test | TRUE TODAY. I re-derived the counts on 2026-11-01 from the `- state:` bullets, and they match the README's tally | `docs/catalog/README.md`; `grep -h '^- state:' docs/catalog/*.md` |
| Builder and critic: one agent builds, an independent critic judges against the bar | TRUE TODAY as **the method by which the engine is built**. The README says "that is the method, not the product" | `README.md`; `docs/01-direction.md` |
| An editor: an editor window and a game window, editing by hand and by AI side by side, play, inspect | **ROAD.** `press_start_editor` exists and has file dialogs, a command log and replay. The editor wave is sectioned after Team Fights stage 1 | `docs/editor-agent.md`; `docs/03-founder-rulings.md` §117 |
| The undo law: every change, human or agent, has an exact inverse | the stated law of the editor; ROAD with the editor | `docs/13-positioning.md` |
| Our own source-available licence in Unreal's shape (use and ship games; no redistribution or competing engine; a royalty above a threshold) | **ROAD.** The draft exists, but the rate and threshold are the founder's and the text lands with version 1 | `docs/03-founder-rulings.md` §117(a); `plans/engine-licence.md` |
| A public repository | **ROAD**, at version 1 | `docs/03-founder-rulings.md` §117 |
| Optional login that nothing requires; the engine, the editor and the launcher work fully offline | **ROAD** (the launcher is wave 10's version-1 cut) | `docs/03-founder-rulings.md` §117(d) |
| CI on free GitHub runners; the GPU goldens stay local on the reference card | **ROAD** for a public CI. Workflows exist in `.github/workflows/`, and the dev and master triggers are restored at version 1 | `docs/03-founder-rulings.md` §117(c) |
| Version 1: launcher, new project from a template, save, build, Windows export only; then a version every two weeks | **ROAD** | `docs/03-founder-rulings.md` §117; `docs/12-orchestration.md` "The road" |
| Known gaps against Unreal and Unity are listed publicly in one backlog | TRUE TODAY (internal) | `plans/parity-gaps.md` |

**The rule for the copy.** The page claims only the TRUE TODAY column in the present tense. Everything in the ROAD
column goes in the Roadmap section, worded as a plan with no dates. The counts are re-derived on the day of each
deploy (§8 gives the script, `sync-engine-facts.ts`).

---

## 2. Positioning

**One-line promise.** *A game engine on Bevy that an AI agent can build in, run, and prove: every scene a document,
every tick replayable, every feature measured against the industry's own tools.*

**Three-word tagline candidates.**
1. **Tests, not eyes.** It is the engine's own doctrine, and it tells an agent author exactly what is different.
2. **Replay any tick.** It is concrete, it is true today, and it implies determinism without the jargon.
3. **Built for agents.** It is the plainest statement of the audience.
4. **Data, not clicks.** It contrasts with editor-first engines without naming them.
5. **Every frame accountable.** It is the strongest line, and it fits the golden and oracle story.

My recommendation is **"Tests, not eyes."** for the hero kicker, with the one-line promise as the h1 subhead.

**Audience, in order.**
1. Game authors who build with AI agents. They want an engine where the agent can see, measure and verify, not just
   type.
2. AI tool builders. They want a deterministic, documented, data-first target to drive and evaluate agents against.
3. Bevy developers. They want the missing pieces (terrain, VFX, networking, animation, UI, save) as Bevy plugins,
   held to an outside reference.

**The beta's ask.** An email address for early access, plus one optional question (what you build). The beta is the
list we invite when version 1 opens (open question 3).

---

## 3. Page structure with copy drafts

The copy below is a first draft. In the new repository it lives in `CONTENT.md` (§8), keyed by section id. Each
section lists its purpose, its headline, its body and its visual.

### 3.0 Header (`header`)
- **Purpose:** identity, plus one always-visible ask.
- **Content:** the wordmark "Press Start" on the left; on the right, the anchors *Build · Determinism · Built today ·
  Roadmap · FAQ* and a pill button **"Join the beta"** that scrolls to the sign-up block. I chose a scroll over
  Elyx's dialog: a dialog is a second form to keep accessible.
- **Behaviour:** it becomes a translucent bar after 80 px of scroll.

### 3.1 Hero (`hero`)
- **Purpose:** say what it is in one breath and show proof, not a mood picture.
- **Kicker:** Tests, not eyes.
- **H1:** A game engine an AI can build in, and prove.
- **Body:** Press Start is built on Bevy. Every scene, law and asset is a document an agent can read and write.
  Every run replays to the same tick. Every feature is measured against the industry's own reference tools.
- **Call to action:** [Join the beta] [See what is built ↓]
- **Honesty line under the buttons (small):** Private beta. Version 1 is not public yet. Windows first.
- **Visual:** the hero's bold element (§4.5), two runs of the same game frame side by side with matching
  checksums.

### 3.2 The problem (`problem`), Elyx's move: name it first
- **Headline:** Agents can type code. They cannot see whether the game is right.
- **Body:** Ask an agent for a game in an engine built for human hands. It writes a script, presses play, takes a
  screenshot and guesses. The frame rate changes the outcome. The random seed is unseeded. Nothing says what
  "right" means. Two runs are two different games, so a test is a coin toss and a bug report is a story.
- **Visual:** none, or a small hand-drawn "tangle" of three strands (script → play → screenshot → guess) that
  straightens on scroll. Borrow Elyx's device once.

### 3.3 What Press Start is (`what`)
- **Headline:** An engine whose first user is an agent, and the human sits above it.
- **Body, three short parts:**
  - **The toolkit.** It covers the pieces Bevy is missing: terrain, shader graphs, VFX, physics materials, input,
    animation and rigging, modeling, UI, localisation, save, navigation and AI, networking. There are 89 engine
    crates. Each one is a document plus a plugin.
  - **The wire.** A running game answers four verbs: *query* state, *command* an edit, *capture* a frame, *control*
    pause, step, seed, checksum, save and load. Input is injected through the same funnel a player's goes through.
  - **The proof.** Every feature carries tests that can fail: pixel goldens, geometry legs and a reference tool it
    is compared against.
- **Visual:** a three-cell diagram: Document → Plugin → Running world, with the wire looping back from the world
  to the agent.
- **Sources:** `docs/00-build-a-game.md` §1-2; `docs/10-ai-layer.md` §2.

### 3.4 How an agent builds a game (`build`), the walkthrough
- **Headline:** How an agent builds a game here.
- **Steps (numbered, each one line and a small sample):**
  1. **Write the scene as data.** A scene is a base plus patches. A field is set with
     `SetField { entity, type_name, field_path, value }`, never by a click.
  2. **Validate before it runs.** Every document is checked before the app exists. A refusal names the value and
     the fix.
  3. **Run it on a fixed tick.** Tick 128 is the same tick on every run. Drive it from a recorded input tape through
     the player's own input funnel.
  4. **Look with numbers, then pixels.** Query the camera pose, the body positions and the state checksum. Capture
     the frame on the reference card and compare it with its golden.
  5. **Ask a second agent.** The builder never grades itself. A critic gets the bar and the result, never the
     reasoning.
- **Visual:** one real code sample as selectable text. Use the shortest real test from `docs/00-build-a-game/test-app.md`
  (the `fixed_step_app` / `advance` pattern) or a `SceneDoc` JSON excerpt. Copy it verbatim from the repository on
  the day it is written, and record its commit in `CONTENT.md`. Do not invent API.
- **Footnote:** the critic step is how the engine itself is built today (`README.md`). Bringing it into the author's
  flow is part of the editor road (§3.9).

### 3.5 Why determinism and data (`determinism`)
- **Headline:** Same seed, same inputs, same frame.
- **Body:** Every random stream comes from one seed you can write down. Game logic may not read the clock or sleep,
  and the lint refuses it. The simulation steps only on a fixed tick, and the state that replays read is a declared
  boundary, not "the whole world". So a test is a fact, a replay is exact, and "the bug at tick 340" is something one
  agent can hand to another. *Scope today: the same build on the same platform.*
- **Second paragraph, "Parallel, and still deterministic":** Bevy runs systems across every core. Our gate refuses
  two systems that touch the same data in no declared order, and it names both. A parallel sum must be ordered or
  order-independent, never "whatever the scheduler did".
- **Visual:** a tick ruler 0 → 340 with two identical checksum columns (the same component as the hero, shown
  static).
- **Sources:** `docs/13-positioning.md`; `docs/00-build-a-game.md` §3; `docs/15-determinism-parallelism.md`.

### 3.6 Measured against the masters (`oracles`)
- **Headline:** Every feature has a reference it must match.
- **Body:** We do not grade our own homework. Physics is held against Jolt and PhysX, navigation against Recast, UI
  layout against Chromium and Yoga, text shaping against HarfBuzz, lighting against Mitsuba, mesh repair against
  Blender and Manifold. Where we differ, the difference is a written row with both numbers and a reason, never a
  hidden tolerance. The speed bar is parity: at or under the reference's time.
- **Visual:** a plain list of reference names as text, set in the mono face. **No third-party logos** (open
  question 5).
- **Honesty line:** "Parity is the bar we hold every feature to. Not every feature meets it yet. The misses are
  recorded."
- **Sources:** `docs/12-orchestration.md` ruling 69; `oracles/` directory names.

### 3.7 Tests, not eyes (`goldens`)
- **Headline:** Pictures are tests too.
- **Body:** Every picture the engine draws in a test is shot on one reference card and compared with a golden, a
  frame a human accepted in a reviewed commit. A tool can propose a new golden. It can never accept one. A blank or
  one-colour frame is refused before any verdict.
- **Visual:** a contact sheet of 6-9 accepted goldens (sprite, shader, UI and terrain sets), each captioned with its
  test name in mono. These are real test frames, small and honest.
- **Source:** `docs/00-build-a-game.md` §3.

### 3.8 What is built today (`built`)
- **Headline:** What is built today, counted.
- **Number tiles (re-derived at each deploy):** **404** entries in the catalog · **103** BUILT · **129** partly built
  · **89** engine crates · **71** reference tools · **189** accepted goldens.
- **Body:** Our catalog lists 404 things a game engine needs, from terrain to crash reports. An entry counts as BUILT
  only when every clause of it is held by a landed test. 103 are BUILT today and 129 are partly built. 32 are
  deliberately skipped, each with its reason. The rest are written down and visibly unbuilt, because a list you
  cannot forget is the point.
- **Visual:** the six tiles, plus one thin stacked bar (BUILT / PARTIAL / SKIP / not yet) whose segments sum to 404.
- **Proof:** the first game, *Team Fights*, a small team shooter made of primitives, is built on these crates. Show
  one frame of it once the frames are accepted goldens (§7).

### 3.9 Roadmap / what beta means (`roadmap`)
- **Headline:** Where we are, honestly.
- **Body:** Press Start is not public yet. This is the road to version 1, in order:
  1. **Now:** the licence clean-up, where every module is rewritten from public documents only, and the editor
     (an editor window and a game window, by hand and by AI side by side, play and inspect).
  2. **Version 1:** a launcher, a new project from a template, save, build, Windows export. An account is optional,
     and nothing requires one. The engine works fully offline.
  3. **Then:** the major performance pain points, one full release gate, and the public repository under our own
     source-available licence.
  4. **After:** a version every two weeks, the remaining gaps, more platforms.
- **What "beta" means:** "You get an invitation when version 1 opens, and earlier builds if we open a private
  preview. We email you about access and major releases only."
- **Visual:** a vertical four-stop line, with the current stop lit and no dates.
- **Source:** `docs/03-founder-rulings.md` §117.

### 3.10 Beta sign-up (`signup`)
- **Headline:** Join the beta.
- **Body:** We will email you when your invite is ready. Nothing else, unless you ask.
- **Fields:** Email (required). "What do you build?" (optional select: games with AI agents / AI tools / Bevy
  projects / something else). A hidden honeypot. An invisible Turnstile widget (§6).
- **Button:** "Request access" (busy state: "Sending…").
- **States:** "Check your inbox to confirm." / "You are already on the list." / "That address does not look right." /
  "Something failed on our side. Try again."
- **Consent line (small):** We store your email, and your answer if you give one, only to send beta access and
  release news. One click unsubscribes and deletes it. [Privacy]
- **Visual:** the success state turns the form into a "cartridge": a small rendered card with the user's
  position-free confirmation ("Player 1 ready"). This is our version of Elyx's ticket. Show no queue number: a
  count is social proof we do not have yet.

### 3.11 FAQ (`faq`)
1. **Is it open source?** It will be source-available. The repository goes public at version 1, under our own
   licence modelled on Unreal's: free to use to make and ship games, with a royalty only above a revenue threshold.
   The final terms are published with version 1.
2. **Do I need an account?** No. An account will be optional, and nothing in the engine, editor or launcher will
   require one.
3. **Which AI does it work with?** Your own. The engine exposes data and verbs, not a model. *(Keep this line until
   the editor's agent door is specified; do not name a vendor.)*
4. **Is it a Bevy fork?** No. It is built around Bevy 0.19, with each system as Bevy plugins plus our own document
   formats. A game is a normal Rust codebase you own.
5. **Which platforms?** Windows first at version 1. More platforms follow.
6. **Can I use my existing Bevy game?** It is not a goal of version 1. A Press Start game is laid out as described in
   our game-authoring guide. *(Confirm before publishing.)*
7. **How much will it cost?** Using and shipping is free below a revenue threshold. The threshold and the rate are
   set with the licence text.
8. **When?** When version 1 passes its release gate. We do not publish dates we have not earned.

### 3.12 Footer (`footer`)
- Press Start · © 2026 · Licence (links to a "Licence: source-available, published with version 1" stub until then) ·
  Privacy · GitHub (the website's own repository until the engine is public) · Discord · contact email.
- Small print: "Built on Bevy. Bevy is an independent open-source project; we are not affiliated." (`bevy.org`
  credits.)

---

## 4. Visual direction

### 4.1 What we borrow from Elyx
- **The essay rhythm.** One readable column (we use 760 px), a large regular-weight display face and a 19-20 px
  body. Sections are spaced at about 56 px between heading groups and about 160 px between sections.
- **The problem-first order** and the ask in two places.
- **Colour that means something.** A near-black page and white text at four opacities, with colour spent only where
  it carries meaning.
- **Motion restraint.** At most four motion moments on the whole page. Each runs once and switches off under
  `prefers-reduced-motion`, and each has a no-JavaScript fallback that shows the final state.
- **A small reward object on sign-up**, not a toast.

### 4.2 What we do differently
- **Proof over mood.** Elyx uses an aurora and diagrams. Every visual of ours is a real engine output or real data
  (goldens, checksums, counts). Our one "decorative" element is itself a replay.
- **Code and documents as selectable text** in a mono face, which the audience copies.
- **Wider breakouts for pictures.** Renders go up to 1200 px while the text stays at 760.
- **Our colour carries test semantics:** the accent is the PASS colour.

### 4.3 Palette options

**Option A, "Booth" (dark, recommended).** This is the engine's capture booth: a dark room, a lit subject and a
verdict.

| token | hex | use |
|---|---|---|
| `--bg` | `#0E1014` | page |
| `--surface` | `#161A21` | cards, code |
| `--rule` | `#262B34` | borders |
| `--fg` | `#F2F4F7` | headings |
| `--fg-body` | `#F2F4F7CC` | body (80 %) |
| `--fg-muted` | `#8A93A3` | captions, mono labels |
| `--accent` | `#3DDC97` | PASS green: buttons, lit roadmap stop, matching checksums |
| `--accent-2` | `#FFB547` | tick amber: tick counters, the "now" marker |
| `--fail` | `#FF5D5D` | only for a deliberately shown mismatch |

**Option B, "Blueprint" (light).** This is the document view: paper, ink and a red start button.

| token | hex | use |
|---|---|---|
| `--bg` | `#F6F4EF` | page |
| `--surface` | `#FFFFFF` | cards |
| `--rule` | `#DCD8CF` | borders |
| `--fg` | `#15171C` | headings and body |
| `--fg-muted` | `#5D6470` | captions |
| `--accent` | `#2F5BFF` | ink blue: links and buttons |
| `--accent-2` | `#E8543A` | "press start" red: the one hero mark |

**Contrast to check at M1.** `#F2F4F7` on `#0E1014` and `#15171C` on `#F6F4EF` both clear WCAG AAA by a wide margin.
`#8A93A3` on `#0E1014` must be checked to reach AA (4.5:1) for small text. Check every pair with a contrast tool
before M1 closes.

**Dark-first, and why.** Engine renders and the editor are seen on dark, so screenshots look like they do in the
product. The audience works in dark editors. The PASS-green and tick-amber semantics read best on near-black. We
offer a light theme through `prefers-color-scheme`, using Option B's tokens, and default to dark.

### 4.4 Type pairings (Google Fonts)

1. **Instrument Serif (display) + Inter Tight (body) + JetBrains Mono (code and numbers).**
   - This is the closest free equivalent of Elyx's Tiempos/Söhne contrast, an editorial serif over a neutral
     grotesk.
   - The serif makes "we are opinionated" read as a manifesto, and the mono carries every number and checksum, which
     is where our proof lives.
   - Instrument Serif has a single weight (400 and italic), which forces Elyx's regular-weight headlines.
2. **Space Grotesk (display) + IBM Plex Sans (body) + IBM Plex Mono (code and numbers).**
   - It is engineered and technical, and it suits "measured against the masters".
   - The Plex family is one designed system, so the body and the mono match. Space Grotesk's quirks give the
     wordmark character without a logo budget.

My recommendation is pairing 1 with palette A. Self-host the fonts through `@fontsource` packages: no Google request
at runtime, which helps privacy and LCP. Use `font-display: swap`, preload the display face, and subset to Latin.

### 4.5 The hero's one bold element: "Two runs, one game"
- Two panels side by side. Each shows the same engine render at the same tick, labelled `run A` and `run B`.
- Under each panel is a mono column of tick numbers with the state checksum for each tick. The tick counter runs
  0 → 128 once on load. The checksums scroll and match line for line, and each matching line flashes PASS-green.
- **All content is real.** The frames are our own booth captures, and the checksums are recorded from the engine's
  replay test for that scene. They are exported once into the website repository as JSON with their engine commit.
- **Motion.** A single 3-4 s sequence. Under reduced motion it shows tick 128 with all checksums matched.
- **Implementation.** CSS plus one small React component, with no WebGL. Its weight is two AVIF frames (or a 3 s
  AV1/H.264 loop under 400 KB) plus about 4 KB of JSON.
- This is our version of Elyx's ink headline. It is the one place the page "performs", and it performs a fact.

---

## 5. Tech stack

- **Build:** Vite + React 19 + TypeScript (`strict`, `noUncheckedIndexedAccess`). Pin exact versions at M1, and pin
  only versions at least two weeks old. Node is pinned in `.nvmrc` to the current LTS.
- **Routing:** React Router in library (SPA) mode with three routes: `/`, `/privacy` and `/confirmed` (where the
  double opt-in link lands), plus a 404.
  - **SEO caveat for an SPA.** Prerender all routes to static HTML at build time, with React Router's `prerender`
    option or a small `vite-react-ssg` step. Crawlers and link-preview bots (Open Graph, X, Discord, Slack) do not
    run JavaScript reliably, and the page should paint before React hydrates.
  - It stays a React SPA after the first load, as the founder wants.
- **CSS: CSS Modules plus one `tokens.css` of custom properties.**
  - *Why.* The page is about 12 sections and one design system. Tokens as CSS variables give the dark and light
    themes for free, which is exactly Elyx's approach.
  - CSS Modules keep each section's styles beside its component, with zero runtime and no class soup in the JSX
    that a copy editor has to read around.
  - Tailwind would speed up a large product UI, which this is not. vanilla-extract adds a build-time type layer we
    do not need.
- **Animation: Motion (`motion`, the library formerly called Framer Motion), for scroll reveals and the sign-up
  state change only.** CSS does the hover springs and the hero counter.
  - *Why.* It is React-native (`useReducedMotion`, `whileInView`, layout animations for the form-to-card flip) and
    tree-shakes to about 15-20 KB gzip for the features we use.
  - GSAP is stronger for scroll-scrubbed timelines, which we deliberately avoid.
  - Budget: no animation runs on the main thread after 4 s.
- **Images:** `vite-imagetools` emits AVIF and WebP (plus PNG for Open Graph) at 480/768/1200/1920 widths into a
  `<picture>` with `srcset`, `sizes`, explicit `width`/`height` (no CLS) and `loading="lazy"` below the fold. The
  hero frames use `fetchpriority="high"`. Pixel-art goldens are scaled by integer factors with
  `image-rendering: pixelated` and stored losslessly.
- **Accessibility:** WCAG 2.2 AA.
  - Landmarks and one `h1`; every input has a visible label; the status messages sit in a `role="status"` live
    region (as Elyx does).
  - Focus moves to the result after submit; there are visible focus rings and a skip link.
  - Every motion respects `prefers-reduced-motion`.
  - Turnstile in "managed/invisible" mode (WCAG 2.2 AAA per Cloudflare,
    `https://developers.cloudflare.com/turnstile/plans/`, read 2026-11-01).
- **Lighthouse targets (mobile, in CI):** Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100. LCP
  ≤ 2.0 s, CLS ≤ 0.02, TBT ≤ 150 ms. Initial JS ≤ 90 KB gzip, and total page weight ≤ 1.2 MB on first view.
- **Analytics:** **Cloudflare Web Analytics.** It is free, cookieless and needs no consent banner. The real metric
  (sign-ups, confirmations) is counted server-side in our own table. On AWS or Firebase hosting, Cloudflare Web
  Analytics still works as a JS beacon. The paid privacy-first alternative is Plausible.
- **Tests:** Vitest for the content loader and the form state machine. Playwright for one end-to-end smoke test
  (load the page, submit to a stubbed API, see the confirm state) and one reduced-motion run. axe-core is wired into
  the Playwright run.

---

## 6. Hosting and the email store

**The founder's account.** The names "cloudfront / cloud formation / fire-cloud" are AWS CloudFront, AWS
CloudFormation and Google Firebase. All three hosts are costed below. The sign-up data model is the same everywhere:
`email` (unique, lowercased), `role` (optional), `created_at`, `confirm_token_hash`, `confirmed_at`, `consent_text_version`,
`source` (header or footer form), `unsubscribed_at`. **No IP address or user-agent is stored.**

### 6.1 Option 1: Cloudflare (Workers static assets + a Worker + D1), recommended
- **Hosting.** The built SPA is served as Workers static assets with
  `not_found_handling = "single-page-application"` (`https://developers.cloudflare.com/workers/static-assets/`, read
  2026-11-01). Cloudflare Pages would also work. Its free plan allows 500 builds a month, 20 000 files and 25 MiB per
  file (`https://developers.cloudflare.com/pages/platform/limits/`, read 2026-11-01).
- **Free limits.**
  - "Requests to static assets are free and unlimited"
    (`https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/`, read 2026-11-01).
  - Workers Free: 100 000 requests a day and 10 ms CPU per invocation.
  - D1 Free: 5 M rows read a day, 100 000 rows written a day and 5 GB of storage.
  - KV Free: 100 000 reads a day and 1 000 writes a day.
  - Workers Paid starts at $5 a month.
  - Source for the last four lines: `https://developers.cloudflare.com/workers/platform/pricing/` (read 2026-11-01).
- **Backend.** One Worker, `POST /api/waitlist`:
  1. Check the honeypot.
  2. Verify Turnstile server-side.
  3. Validate and normalise the email.
  4. `INSERT … ON CONFLICT(email) DO NOTHING` into D1.
  5. Send the confirmation email through Resend with an HMAC-signed link to `GET /api/confirm?t=…`, which sets
     `confirmed_at` and redirects to `/confirmed`.
  6. `GET /api/unsubscribe?t=…` deletes the row.
- **Rate limiting:** Cloudflare's Workers rate-limiting binding, or a KV counter per /24 hash.
- **Spam:** Turnstile is free, with unlimited challenges and up to 20 widgets
  (`https://developers.cloudflare.com/turnstile/plans/`, read 2026-11-01). Add the honeypot and double opt-in on top.
- **Email sending:** Resend Free allows 3 000 emails a month and 100 a day on 3 domains; Pro is $20 a month for
  50 000 (`https://resend.com/pricing`, read 2026-11-01).
- **Cost:**

| sign-ups | hosting | Worker + D1 | Turnstile | confirm emails | total |
|---|---|---|---|---|---|
| 0 | $0 | $0 | $0 | $0 | **$0** plus the domain |
| 1 000 | $0 | $0 | $0 | $0 (under 3 000 a month, as long as no day passes 100) | **$0** |
| 10 000 | $0 | $0 (far under 100 000 writes a day) | $0 | Resend Pro $20 for the month of a launch spike, or queue the confirmations at 100 a day | **$0-20** |

- **Export:** `wrangler d1 execute <db> --remote --json --command "SELECT …"` piped to a CSV through
  `scripts/export-signups.ts`, and `wrangler d1 export` for a full backup.

### 6.2 Option 2: AWS (S3 + CloudFront; Lambda function URL + DynamoDB; SES)
- **Hosting.** A private S3 bucket behind CloudFront with origin access control, and SPA fallback through a
  CloudFront Function or a 403/404 → `/index.html` error mapping. Define it all in one CloudFormation (or CDK) stack,
  since the founder already knows the name.
  - CloudFront's **flat-rate Free plan** is $0 a month per distribution with no overage charges. It includes 1 M
    requests and 100 GB of transfer a month, 5 GB of S3 storage, WAF with 5 rules, DDoS protection and DNS. Pro is $15
    a month (`https://aws.amazon.com/cloudfront/pricing/`, read 2026-11-01).
- **The account itself.** New accounts get $100 in credits, plus up to $100 more. A **Free-plan account closes after
  6 months** or when the credits run out, unless it is upgraded to the Paid plan (`https://aws.amazon.com/free/`, read
  2026-11-01). A site meant to live must sit on a Paid-plan account; with the flat-rate CloudFront plan it still costs
  near zero.
- **Backend.** One Lambda behind a **Lambda function URL**, which avoids API Gateway. API Gateway HTTP API would be
  $1.00 per million requests, and its 1 M a month free allowance is only for 12 months
  (`https://aws.amazon.com/api-gateway/pricing/`, read 2026-11-01).
  - Lambda free tier: 1 M requests and 400 000 GB-s a month (`https://aws.amazon.com/lambda/pricing/`, read
    2026-11-01).
  - DynamoDB on-demand: $0.625 per million writes, $0.125 per million reads, $0.25 per GB-month, with 25 GB of storage
    in the free tier (`https://aws.amazon.com/dynamodb/pricing/on-demand/`, read 2026-11-01).
  - SES sends the confirmation at $0.10 per 1 000 emails (`https://aws.amazon.com/ses/pricing/`, read 2026-11-01). New
    SES accounts start in the sandbox, and production access is a support request; that is a known AWS step.
- **Spam:** Turnstile works on any host (verify from the Lambda), or AWS WAF's CAPTCHA, which is extra cost.
- **Cost:** 0 sign-ups ≈ **$0** plus Route 53 if used (about $0.50 a month per hosted zone, from memory; verify). 1 000
  ≈ **$0.10**, the SES emails. 10 000 ≈ **$1.00** for SES plus about $0.01 for DynamoDB.
- **Export:** `aws dynamodb scan` → `jq` → CSV in `scripts/export-signups.ts`, or DynamoDB export to S3.

### 6.3 Option 3: Firebase (Hosting + Firestore; App Check; optional Functions)
- **Hosting.** Firebase Hosting with a `rewrites: [{source:"**", destination:"/index.html"}]` SPA rule.
  - **Spark (free):** 10 GB of storage but only **360 MB a day of transfer**
    (`https://firebase.google.com/pricing`, read 2026-11-01). A 1 MB first view caps the free tier at about 350
    visits a day, which a launch post exceeds within hours. A real launch needs **Blaze** (pay as you go).
- **Backend, the smallest version.** A direct client write to a `signups` collection.
  - The security rules allow `create` only, with exact fields, a valid email shape and a server timestamp. They deny
    `read`, `update` and `delete`, so the list is never readable from the client.
  - App Check with reCAPTCHA Enterprise protects it, free for 10 000 assessments a month
    (`https://firebase.google.com/docs/app-check`, read 2026-11-01).
  - Firestore Spark allows 20 000 writes a day and 1 GiB stored (`https://firebase.google.com/pricing`).
- **Double opt-in.** It needs a server: a Cloud Function trigger on create that sends the confirmation (the "Trigger
  Email" extension with an SMTP provider such as Resend), plus a confirm endpoint.
  - **Cloud Functions are listed only under Blaze**, with 2 M invocations, 400 000 GB-s and 5 GB egress free each
    month (`https://firebase.google.com/pricing`).
  - Firestore rates beyond the free quota are on `https://cloud.google.com/firestore/pricing`. I could not read the
    numbers on 2026-11-01, so verify them before relying on the cost figures below.
- **Cost:** 0 → **$0** (Blaze with no usage). 1 000 → **≈ $0** (inside the free quotas) plus hosting egress beyond
  360 MB a day. 10 000 → **≈ $0-5** (egress-dominated) plus email sending ($0 on Resend Free under 3 000 a month,
  otherwise $20).
- **Export:** `gcloud firestore export` or a 20-line admin script → CSV.

### 6.4 Shared policy (all three options)
- **Spam:** an invisible captcha (Turnstile, or App Check on Firebase), a honeypot field, a server-side email
  syntax check plus an MX lookup (optional), per-network rate limiting and **double opt-in**. Only confirmed rows
  are invited.
- **GDPR and privacy line:** "We store your email (and your answer, if you give one) only to send you beta access and
  Press Start release news. Our providers are [Cloudflare] and [Resend]. One click in any email unsubscribes and
  deletes your data; or write to [contact]. No cookies, no trackers."
  - Lawful basis: consent. Record `consent_text_version` and the time.
  - The `/privacy` page names the processors, retention (until unsubscribe, or 30 days after version 1 if never
    confirmed) and the contact for erasure.
  - On Cloudflare, set D1's location hint to the region where most sign-ups are expected (open question 1).
- **Export:** a `pnpm export:signups` script writes `signups-YYYY-MM-DD.csv` with confirmed rows only.

### 6.5 Recommendation
**Cloudflare.** It is $0 at 0, 1 000 and 10 000 sign-ups apart from email sending. The free tier never closes and is
not capped by transfer. Turnstile is native. The whole backend is one Worker file and one SQL table, deployed by the
same `wrangler` step as the site.

If the founder wants to stay inside his existing account: on **AWS**, use the flat-rate CloudFront Free plan, a
Lambda function URL and DynamoDB, on a Paid-plan account. On **Firebase**, use Blaze from day one, because Spark's
360 MB a day of hosting transfer will not survive a launch.

### 6.6 Zero-backend fallback (a form service)
- **Kit (formerly ConvertKit):** free up to **10 000 subscribers**, with unlimited opt-in forms and landing pages;
  Creator is $33 a month (`https://kit.com/pricing`, read 2026-11-01). It sends the beta emails too and handles
  confirmation. **This is the best fallback.**
- **Tally:** "unlimited forms and submissions, completely free" under fair use, with webhooks on free; Pro is $24 a
  month (`https://tally.so/pricing`, read 2026-11-01). It needs a separate email tool to send invites.
- *(Rejected)* **Formspree:** 50 submissions a month on free, and no export on free
  (`https://formspree.io/plans`, read 2026-11-01).
- *(Rejected)* **Buttondown:** free only for the first 100 subscribers (`https://buttondown.com/pricing`, read
  2026-11-01).

---

## 7. Image and asset pipeline

### 7.1 Where the pictures come from (the engine repository, read-only)
- **Accepted goldens**, 189 PNGs across `crates/*/goldens/`:
  - `press_start_sprite_bevy` 77, `press_start_shader_bevy` 61, `press_start_ui` 31, `press_start_mesh_bevy` 9,
    `press_start_terrain_bevy` 6, `press_start_animation_bevy` 4, `press_start_render` 1.
  - Command: `find crates -path '*goldens*' -name '*.png' ! -name '*.candidate.png'`, 2026-11-01.
  - These are publishable proof: a human accepted each one.
- **Candidates**, 939 `*.candidate.png` files across the same 14 `goldens/` directories. Among them,
  `crates/press_start_ts_game/goldens/` holds Team Fights frames such as `ts-hud`, `ts-firing`, `ts-overhead` and
  `ts-menu`.
  - A candidate is not yet accepted. **Publish a candidate only after it is accepted in the engine repository**, so
    the site never shows a frame the engine itself has not signed off.
- **The eye-review page** `oracles/review/eye-review.html`, with its subject directories (`oracles/review/PIN`,
  `POSES`, `ANIM-POSES`, `NAV-DEBUG`, `GPU-MAPS`, `WEIGHT-SUBJECTS` …).
  - **Only our half of a pair may be published.** The other half is a reference tool's output (Blender, Unreal, Unity
    …), and showing it would show their product.
- **The editor's test output** `crates/press_start_editor/test-output/` (`editor_visual.png` and its siblings).
  - It is useful for the roadmap's "editor" stop as an *in-progress* picture, captioned as such.

### 7.2 The rules
1. **We publish only our own renders.** That means no reference-tool output, no third-party logos, no restricted
   game's look or branding (rulings 96 and 97 in `docs/12-orchestration.md`), and no screenshots of other engines.
2. **Every published image has a provenance row** in `assets/renders/manifest.json` with these fields: the engine
   commit sha, the crate, the test or leg name, the source path, and whether it is a golden or a booth capture. CI
   refuses an image file that has no manifest row.
3. **Goldens are proof, not beauty.** They are small, shot on the UHD 770 with noisy features off. For the hero and
   for marketing frames, shoot dedicated booth captures at 1920-2560 px wide with the features on. That shoot is a
   task in the engine repository and needs the founder's go (open question 3's neighbour; it is not part of this
   plan).

### 7.3 Storage, formats and sizes
- **Storage.** Sources (PNG) live in the website repository under `assets/renders/` with Git LFS off, under 30 MB
  total. Build outputs are generated, never committed.
  - When video loops or the total passes about 50 MB, move the sources to Cloudflare R2 (or S3 on AWS) and fetch them
    at build.
- **Outputs.** AVIF (quality about 55) first, WebP second, PNG only for the Open Graph image (1200 × 630). Widths are
  480, 768, 1200 and 1920.
  - Pixel-art sprite goldens are upscaled by integer factors only and stored as lossless WebP.
  - The hero frames' budget is ≤ 180 KB each in AVIF.
  - A hero loop, if used, is AV1 + H.264 MP4, ≤ 400 KB, muted, with `playsinline` and a poster frame.

---

## 8. The new repository

**Name:** proposed `press-start-site` in a new organisation (the organisation name is open question 2).

```
press-start-site/
├── CONTENT.md                  # all page copy, keyed by section id (## hero, ## problem, …); edited without code
├── README.md                   # how to run, deploy, export sign-ups
├── package.json  pnpm-lock.yaml  .nvmrc  tsconfig.json  vite.config.ts
├── eslint.config.js  .prettierrc  lighthouserc.json  playwright.config.ts
├── public/                     # favicon set, robots.txt, og-image.png (generated), site.webmanifest
├── assets/
│   └── renders/                # source PNGs from the engine + manifest.json (provenance per file)
├── data/
│   ├── counts.json             # catalog counts, crates, oracles, goldens; written by scripts/sync-engine-facts.ts
│   └── replay.json             # the hero's two checksum columns + engine commit
├── src/
│   ├── main.tsx  routes.tsx
│   ├── content/                # loader: parses CONTENT.md at build (import ?raw) into typed sections
│   ├── sections/               # Hero.tsx, Problem.tsx, What.tsx, Build.tsx, Determinism.tsx, Oracles.tsx,
│   │                           # Goldens.tsx, BuiltToday.tsx, Roadmap.tsx, Signup.tsx, Faq.tsx, Footer.tsx (+ .module.css)
│   ├── components/             # Picture.tsx, NumberTile.tsx, CodeSample.tsx, ReplayStrip.tsx, Pill.tsx
│   ├── lib/                    # signup state machine, turnstile loader, reduced-motion hook
│   ├── pages/                  # Privacy.tsx, Confirmed.tsx, NotFound.tsx
│   └── styles/                 # tokens.css (palette A + B), fonts.css, base.css
├── worker/                     # Cloudflare Worker: src/index.ts, schema.sql, wrangler.toml
├── scripts/
│   ├── sync-engine-facts.ts    # reads a local engine checkout (path argument), writes data/counts.json
│   ├── import-renders.ts       # copies chosen goldens + writes manifest rows
│   ├── check-content.ts        # every section id in CONTENT.md exists in code and vice versa
│   └── export-signups.ts       # confirmed rows → CSV
└── tests/                      # vitest unit + playwright e2e (stubbed API) + axe
```

**`CONTENT.md` format.**
- One `## <section-id>` per section, with `headline:`, `kicker:` and `cta:` lines followed by Markdown body
  paragraphs.
- Numbers are written as placeholders, `{{catalog.built}}`, filled from `data/counts.json` at build, so the copy never
  goes stale by hand.
- `check-content.ts` fails CI on an unknown placeholder or a missing section.

**CI (GitHub Actions; free for a public repository on standard runners).**
- `ci.yml` runs on every PR and push:
  - `pnpm install --frozen-lockfile`
  - lint (ESLint + Prettier check)
  - `tsc --noEmit`
  - `check-content`
  - `vitest`
  - `vite build`
  - the image-manifest check
  - Playwright + axe against `vite preview`
  - Lighthouse CI (`treosh/lighthouse-ci-action`) on the built output, with the §5 budgets asserted in
    `lighthouserc.json`
- `deploy.yml`:
  - On every PR, a preview deploy (`cloudflare/wrangler-action`), with its URL commented on the PR.
  - On `main`, a production deploy of the site and the Worker. D1 migrations run from `worker/schema.sql` with
    `wrangler d1 migrations apply`.

**Branch flow.** Feature branches → PR → `main`, with a preview per PR and production on merge.
- This is simpler than the engine's feature → dev → master flow. A marketing site gains nothing from a `dev` branch,
  because PR previews do that job.
- If the founder wants the same three-branch flow for uniformity, `dev` deploys to a staging hostname.

**Environment variables and secrets.**
- Public, at build: `VITE_TURNSTILE_SITE_KEY`, `VITE_SITE_URL`, `VITE_CF_ANALYTICS_TOKEN`.
- Worker secrets (set with `wrangler secret put`): `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`,
  `CONFIRM_LINK_SECRET` (HMAC), `MAIL_FROM`.
- GitHub Actions secrets: `CLOUDFLARE_API_TOKEN` (scoped to Workers, D1 and this zone) and `CLOUDFLARE_ACCOUNT_ID`.
- On AWS, the equivalents are an OIDC role (`AWS_ROLE_ARN`) and no long-lived keys.

---

## 9. Milestones

**M1: static page with a placeholder sign-up**
- Every section from §3 is on screen with its copy from `CONTENT.md`, placeholder visuals, and palette A plus
  pairing 1.
- The form posts to a stub that always answers `success`.
- The site is deployed to a preview hostname.
- **Done when:**
  - CI is green: lint, types, content check, build, e2e, axe with zero violations.
  - Lighthouse mobile reaches ≥ 95 / 100 / 100 / 100.
  - The page renders correctly with JavaScript disabled (prerendered HTML).
  - The founder has read the copy and answered the open questions.

**M2: the real sign-up backend**
- The Worker, the D1 schema, Turnstile, double opt-in through Resend, the confirm and unsubscribe links, the
  `/privacy` and `/confirmed` pages, and the export script.
- **Done when:**
  - An end-to-end test against the preview environment signs up a test address, confirms it and unsubscribes it.
  - A duplicate address answers "already on the list".
  - A honeypot hit and a missing Turnstile token are refused.
  - `export:signups` writes a CSV that contains only confirmed rows.
  - The production domain is live over HTTPS.

**M3: screenshots and motion**
- Accepted goldens are imported with manifest rows. The hero replay strip uses real frames and checksums (needs the
  engine-side capture, §7.2). The contact sheet, the number tiles fed from `sync-engine-facts`, and the four motion
  moments are added.
- **Done when:**
  - Every image has a provenance row, and CI refuses one without a row.
  - Reduced-motion e2e shows every final state.
  - LCP stays ≤ 2.0 s on mobile Lighthouse with the hero in place.
  - Total first-view weight is ≤ 1.2 MB.

**M4: analytics and SEO**
- Cloudflare Web Analytics; the `<title>` and description; Open Graph and X (`summary_large_image`) cards with a
  generated 1200 × 630 image; `sitemap.xml`; `robots.txt`; canonical URLs; JSON-LD `SoftwareApplication`;
  sign-up and confirmation counts in a small admin query.
- **Done when:**
  - Link previews render correctly in the X card validator, Discord and Slack.
  - Lighthouse SEO is 100.
  - The analytics dashboard shows visits, and the D1 query shows sign-ups and confirmations with the confirmation
    rate.
  - No cookie is set, which is verified in the e2e run.

---

## 10. Open questions for the founder (each with a recommended answer)

1. **Which cloud account do you actually have, and where are most sign-ups expected?**
   - *Recommended:* host on Cloudflare anyway ($0 at every scale here, and the free tier never closes). If you want
     one bill with an existing account, AWS with the flat-rate CloudFront Free plan, on a Paid-plan account.
   - Put D1's location hint near your expected audience.
2. **The domain and the organisation name.** "Press Start" is a common phrase.
   - *Recommended:* search trademarks and domains before M1, buy one short domain, and name the GitHub organisation
     to match.
3. **What exactly does "beta" give someone, and when?**
   - *Recommended:* an invitation when version 1 opens, plus a possible private preview before it. No dates on the
     page.
   - Until the engine repository is public, the GitHub link points to the website's repository or is hidden.
4. **How the licence is described before its text exists.**
   - *Recommended:* "source-available, modelled on Unreal's terms: free to make and ship games, a royalty only
     above a revenue threshold; final text with version 1." Give no rate or threshold until you set them
     (`plans/engine-licence.md`).
5. **Using "Unity for AI" and naming Unreal or Unity on the page.**
   - *Recommended:* do not use "Unity for AI" publicly, because it leans on another company's trademark. Use "the
     engine an AI builds games in".
   - Name the reference tools only as plain text in the oracles section (a factual comparison), with no logos.
6. **The form's fields and double opt-in.**
   - *Recommended:* email plus one optional "What do you build?" select, and double opt-in on. It gives a cleaner
     list and GDPR proof of consent.
7. **Contact channels for the footer.**
   - *Recommended:* a Discord invite (if the server is ready to be public) plus a plain contact address on the new
     domain. Leave out X or Bluesky until someone posts there.
8. **Should the beta list later become launcher accounts (ruling 117(d)'s optional login)?**
   - *Recommended:* keep them separate. Invite by email, and let people create an account in the launcher if they
     choose. Choose the launcher's auth provider when it is sectioned, not now.
