# L2 "Platform suite" — design brief

Phase 2 of `plans/main-site.md`, layout L2 (inspired by how unity.com organises a platform, never copied).

## The idea

Press Start presented as a **product with three moves**, the way a platform company presents its suite:
**Build as data → Prove → Own the code.** Each move is a product line with its own signal colour, its own
pixel badge and its own deep section, and the navigation itself is a designed object: a console-styled
mega-menu that maps the whole engine in one glance. The console identity stays (chassis grey, phosphor
screens set into it, pixel labels, mono readouts); what is new is the confidence of a product company —
dense, ordered, everything one click from the menu — and the friendliness the founder asked for: plain
words first, the proof one layer down, never a wall of jargon.

**Signal colours (site-only tokens, `site.css`):** Build = tick amber, Prove = phosphor green, Own = cobalt.
They tint the pillar badges, the rail, the card edges and the menu columns, so a visitor learns the map by
colour before reading it. Body text never takes a signal colour.

## Page structure

**Header** — wordmark, three menu groups (Engine · Resources · Company), "Join the beta" (`FLAGS.joinBeta`
→ `/beta/`). Engine opens a three-column mega-panel (one column per pillar, each strength with a one-line
description) plus an overview card; Resources and Company open compact panels. Disclosure-navigation
pattern: buttons with `aria-expanded`, Escape closes and returns focus, ArrowDown enters the panel,
Left/Right move between groups, focus leaving the nav or a click outside closes, hover-intent on fine
pointers. Phone: a "Menu" button opens a drawer (modal dialog, focus trapped, Escape, scroll locked).
No JS: panels open on `:hover`/`:focus-within`; on a phone "Menu" is a link to the footer's site map.

**Home `/`**

1. **Hero** — h1 (the LCP, prerendered), plain-language lede, two CTAs, then the **suite console**: one
   dark screen with three panes wired left to right — _the document_ (amber), _the run_ (green arena drawn
   from `lib/sim.ts`), _the proof_ (two checksum columns stamping PASS). Captioned as an illustration drawn
   in the browser. Controls: replay, and "another seed" (the second run diverges in red: the proof can fail).
2. **Facts strip** — synced counts (crates, built of total, reference tools, accepted goldens) with what
   each means in five words.
3. **Three moves** — the overview: three pillar cards on one rail; the rail draws as you scroll.
4. **01 Build as data** — "everything is a document" + the **four-verb console**: query, command,
   capture, control as console keys; each shows a plain-words exchange (illustration, not the wire format).
5. **02 Prove** — four **evidence cards** (same seed, all cores, a reference, pictures are tests), each a
   small live diagram and a link to its strength page.
6. **03 Own the code** — the game as a **cartridge** you own: Rust on Bevy, fixed at the root, nothing
   requires a login (decided), source-available with version 1 (road). True-today and road visibly split.
7. **Status board** — "Where we are, honestly": the catalog by area (synced), BUILT / PARTIAL / SKIP bars,
   and the road's stops without dates.
8. **Made for** — four audiences, one line each.
9. **Learn + Licensing teasers** — two cards, honest about what exists today.
10. **Join band** — the closing CTA.

**Footer** — a full site map in four columns (the no-JS phone menu points here), the line, legal links.

**`/engine`** — overview: the three moves as chapters, each listing its strength pages as cards; "what
the engine covers" (synced catalog areas); a true-today / on-the-road ledger.

**`/engine/oracles`** (the strength page) — the method in three steps (same scene in both → both numbers
recorded → disagreements resolve toward the reference); a **split-flap reference board** (domain →
reference tool, plain mono text, no logos); the two rules (parity is the bar; speed at the reference's
thread count); one accepted golden in a review frame with its provenance row; the honest misses.

**Other routes** — a styled placeholder: the page's own kicker, h1 and honest copy, a "what exists today"
panel linking to the designed pages. No lorem, no fake content.

## Motion moments (GSAP lazy-loaded after idle; CSS for the rest)

| Moment                                                                                                                         | What it shows                   | Final state (= no-JS = reduced motion) |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | -------------------------------------- |
| Load: h1 words rise (CSS, transform only: the LCP text paints at once), the moves' underlines draw                             | where to start reading          | text in place                          |
| Suite console: the console flattens from a tilt as it scrolls in (CSS scroll timeline); the run plays 0 → 240, rows stamp PASS | two runs, one game              | tick 240, every row PASS               |
| Mega-menu: panel unfolds, columns stagger, the open group turns into a dark key                                                | the map of the engine           | panel shown/hidden instantly           |
| Facts count up on view                                                                                                         | the numbers are real and synced | the numbers                            |
| GSAP ScrollTrigger: a signal runs along the moves' track with the scroll, lighting each move                                   | the order: build → prove → own  | track full, all lit                    |
| Verb console steps through the four exchanges once; keys replay one                                                            | what an agent can ask           | all four exchanges readable            |
| Evidence cards: lanes fill, the PASS stamp lands; pointer light on hover                                                       | the proof per strength          | diagrams complete                      |
| GSAP ScrollTrigger: the cartridge follows the scroll into its slot, the lamp lights                                            | the game is yours               | cartridge seated                       |
| Status bars grow from zero                                                                                                     | how much is built               | bars at their value                    |
| Split-flap board flips to each reference                                                                                       | many tools, one bar             | board settled                          |

Compositor-only (transform/opacity), no layout animation, nothing loops after it settles, every block has a
`prefers-reduced-motion: reduce` branch.

## What each section proves

- Hero/console: determinism — the same seed gives the same checksums, another seed does not.
- Facts: every count is synced from the engine (`counts.json`), never typed.
- Build: the engine is data and verbs an agent can use; no MCP is claimed — "your own AI".
- Prove: determinism, ordered parallelism, oracles, goldens — each with its honesty line.
- Own: real Rust on Bevy today; licence and login decisions worded as the road.
- Status: the misses are published (BUILT/PARTIAL/SKIP per area); no dates.
