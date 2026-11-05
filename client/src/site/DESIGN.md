# L1 "Cinematic" — design brief

Phase 2 of `plans/main-site.md`, direction L1 (inspired by Unreal's site, never copied). The console identity is
kept (chassis grey, phosphor screens, pixel labels, mono readouts); what changes is the pacing.

## The idea

**The console's screen is the cinema screen.** The page opens on a full-viewport phosphor screen playing the
replay simulation as the "film": run A drawn solid, run B traced over it from the same seed, never one pixel apart,
with a running timecode of both checksums along the bottom like subtitles. As you scroll, the screen sinks back into
the chassis (it scales into a bezel and its corners round), and the page alternates between **light acts** (the
chassis: who it is for, what the engine answers, the numbers) and **dark acts** (the screen: the four strengths,
the film strip of engine frames, the licence end card). Every dark act rises out of the chassis the same way the
hero sank into it, so the transitions feel like one camera move, not a stack of sections.

Letterboxing frames everything: the header and the footer are dark bars, the footer ends on the wordmark at
full width like a closing credit.

## Page structure (home)

| #   | Section                                                                                         | Act   | What it proves                                                                                                                                                                                                                          | Motion moment                                                                                                                                                                                             |
| --- | ----------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Hero** — "A game engine an AI can build in, and prove." over the full-bleed replay            | dark  | Same seed, same game: two runs drawn on top of each other, the checksum timecode matching tick by tick (an illustration, captioned)                                                                                                     | Words rise in on load; the stage powers on; the run plays while in view; scroll sinks the screen into the chassis                                                                                         |
| 2   | **Four ways in** — audience tabs: Studios · Solo developers · AI tooling · Bevy developers      | light | The same engine told four ways, each with three facts that are true today                                                                                                                                                               | A channel selector: the indicator slides, the panel re-plays its headline, arrow keys move between tabs                                                                                                   |
| 3   | **Four things you can hold us to** — flagship blocks: Same game · Every core · Measured · Yours | dark  | Determinism (a checksum ledger, run C failing), all cores (eight lanes, the gate ordering a conflict, two equal checksums), measured (subsystem → reference tool board), ownership (your game / the engine / Bevy as an exploded stack) | Desktop: each block is a sticky stage scrubbed by scroll — the giant word rises letter by letter, the ledger fills with a running tick, the lanes fill, the stack explodes. Reversible on the way back up |
| 4   | **The game answers back** — query · command · capture · control                                 | light | The four verbs, one line each                                                                                                                                                                                                           | Giant words rise in sequence; hover lights a verb                                                                                                                                                         |
| 5   | **Shot by the engine** — a film strip of accepted goldens                                       | dark  | Frames from the engine's own tests, each with its crate and test name; Team Fights named as the first game                                                                                                                              | Desktop: the strip is pinned and the film runs sideways as you scroll; phone: a native swipe strip                                                                                                        |
| 6   | **In numbers / Where we are, honestly**                                                         | light | Synced counts (never typed): crates, built of total, reference tools, goldens; the catalog bar with the misses; the road in order, no dates                                                                                             | Count-ups and the catalog bar filling once in view; the road's line draws to "now"                                                                                                                        |
| 7   | **Free to make and ship. Yours to read.** — licence end card                                    | dark  | The licence shape, stated as a plan; nothing requires a login                                                                                                                                                                           | The end card rises from the chassis; "Join the beta"                                                                                                                                                      |

Header: dark bar, LED wordmark, the eight nav links, "Join the beta" (behind `FLAGS.joinBeta`) to `/beta/`; on phones
the links fold into a `<details>` menu that works without JavaScript. Footer: three link columns, the honest line,
the giant wordmark.

## /engine and /engine/determinism

- **/engine** — "Built around Bevy, written as documents." The loop of the engine as a four-stop diagram
  (document → plugin → running world → your agent, the wire back), the five strengths as large index cards linking to
  their pages, the numbers band, and an honest "not there yet" panel (editor, launcher, export are on the road).
- **/engine/determinism** (the strength sub-page) — a hands-on replay: drag the tick slider (or press play) and
  watch run A, run B traced over it, and run C — the same seed with one different input at tick 140. The ledger turns
  red from the first checkpoint after it, and the binary search the engine uses to locate a divergence is run live
  in the browser, step by step, to name the first differing tick. Then the four things game logic may not do, the
  replay tape that names its build, and the honest scope (same build, same platform).

Other routes: styled placeholders — the same dark title band and honest copy from CONTENT.md, with the way to the
engine and the beta; never lorem.

## Motion rules (how the cinema stays honest)

- One **motion director** (`site/Motion.tsx`) scans the page for `data-m` hooks after the browser is idle and loads
  GSAP + ScrollTrigger + SplitText lazily (desktop, motion allowed). Nothing in the first paint depends on it.
- The prerendered HTML is the **final state**: every hidden start state is created by GSAP after load, or by CSS
  under `html.js`/`html.hydrated`. No JS and `prefers-reduced-motion` get the final state; phones get light in-view
  reveals instead of scrubs.
- Sticky stages are CSS (`position: sticky` in a taller block whose height exists only under `html.js` on desktop
  with motion allowed — set before first paint, so no layout shift). GSAP only maps scroll progress to transforms
  and opacity; no `pin` spacers are inserted.
- The hero's load sequence is CSS (the h1 rises with transform only, so it paints at once as the LCP); the run is the
  only loop and it pauses out of view. When the scroll stops, nothing moves.

## Colour and type

Console tokens from `styles/tokens.css`, plus a second phosphor, **amber** (`--amber`, the tick and the "now"
marker), so the dark acts read as an arcade cabinet rather than a terminal. Space Grotesk at cinema sizes (up to
~13 rem), Press Start 2P for plates and channel numbers, JetBrains Mono for every number.

## Honesty

Copy from CONTENT.md only (`site-*`, `page-*` sections), counts only via placeholders, images only accepted goldens
with provenance rows. The simulation is always captioned as an illustration drawn in the browser. Roadmap items are
worded as plans, no dates, no speed-up numbers, no MCP, the build lane never mentioned.
