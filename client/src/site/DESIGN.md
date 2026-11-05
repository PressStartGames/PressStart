# L3 "Community engine" — design brief

Direction for `/` and the main site (plans/main-site.md phase 2, layout L3; inspired by the way Godot and
Defold present themselves, never copied). The console identity stays: chassis grey, dark phosphor screens,
pixel labels, mono readouts, Space Grotesk. What changes is the temperature.

## The idea: co-op mode

The friendliest of the four layouts. The site is a **handheld console you pick up**, not a spec sheet: you and
your AI are player 1 and player 2, and the engine is the console that keeps score honestly. Everything that
was a lab instrument on the beta (ledgers, gates, checksums) is re-told as something a solo developer already
loves: a handheld that replays the same game when you press START, four face buttons for the four values, a
high-score table for the counts, an overworld map for the road, a patch-notes board for the news.
The proof stays — every number is synced, every claim is the website skill's "true today" — but it is
presented as play, then explained in one plain sentence.

**Colour.** The console's grey and phosphor, plus the four face-button colours of a controller, used as
_meaning_, not decoration: red = Deterministic, amber = All cores, blue = Measured, green = Yours. Each
strength keeps its colour on every page (cards, badges, the strength sub-page's accent). Bigger radii (12–24 px)
and soft drop shadows make the chassis feel like a held object; screens keep their hard 4 px bezels.

**Pictures.** Honest illustrations only: the handheld's game is the beta's browser simulation (`lib/sim.ts`),
captioned as an illustration, redrawn here in colour; every other picture is a hand-drawn pixel icon or a
small diagram. No engine golden is shown on these pages (the founder prefers an honest illustration to plain
test output); the beta keeps its golden section.

## Page structure

**Header** — the wordmark with its LED, the eight site pages, and a red arcade-button "Join the beta"
(`FLAGS.joinBeta`, links to `/beta/`). Under 900 px the nav folds into a `<details>` menu, which works
without JavaScript.

**Home `/`**

1. _Hero_ — kicker, the one h1, a plain lede, two CTAs, the beta's honest small line. Beside it **the
   handheld**: a CSS-drawn console whose screen plays the seeded simulation. START replays it and the
   checksum lands on the same value ("Run 2 = Run 1"); SELECT changes the seed and the game, and the checksum,
   change. _Proves: same seed, same inputs, same game — by letting the visitor try it._
2. _Four buttons_ (the value-badge strip) — Deterministic · All cores · Measured · Yours as four coloured
   arcade buttons, each a link to its strength page. _Proves: the four strengths, one line each._
3. _Features_ — a bento of six cards, each with its own small illustration; four tagged **Today**, two
   tagged **On the road** (the editor's chat beside the game; offline, no login). _Proves: what it is like to
   build here, with the roadmap items labelled as such._
4. _High scores_ — the synced counts as an arcade score table that rolls up when it scrolls in, including
   the misses (PARTIAL) and the sync date and engine commit. _Proves: nothing is typed by hand; we publish
   the misses._
5. _The road_ — an overworld map of the road to version 1: cleared, now, next, ahead; no dates. The path
   draws in once when it scrolls into view and the "you are here" marker lands on the current stage.
6. _Patch notes_ — what landed, from `mission/roadmap.md` (past dates only; the internal build lane is never
   mentioned).
7. _Get involved_ — four cartridges: join the beta, say hello on Discord, follow the road, read how it
   works; the honest note that the repository goes public with version 1.
8. _Press Start_ — the closing band: a big pixel PRESS START on a screen and the beta button.

**Footer** — dark screen colour, grouped links (Engine strengths, Project, Studio with Discord, Legal),
the beta's line and the sync stamp from `counts.json`.

**`/engine`** — hero; "how a game is made here" as a four-step loop (Write · Run · Prove · Own) with
pixel icons; the five strengths as coloured cards linking to their pages; the four verbs as a mini console
panel; "not there yet" (the caveats, stated); CTA.

**`/engine/parallel`** (the strength page, amber) — hero with a core board illustration (systems falling
into core lanes; two that touch the same data get ordered by the gate); a live float experiment computed in
the browser ("the same three numbers, added in two orders, are not equal"); the four rules; what we do not
claim; neighbour links to the other strengths.

**`/roadmap`** — the overworld map large, then every stage as a level card with its state, the decisions
already made, and what "beta" means.

**`/news`** — the patch notes in full.

**Other routes** (`/showcase`, `/learn`, `/licensing`, `/about`, `/community`, the other strength pages,
legal) — a styled "level not unlocked yet" page: the page's own honest copy from CONTENT.md, a pixel lock,
and doors to the designed pages. **404** — "Tick not found", drawn as a checksum mismatch.

## Motion moments (GSAP loaded lazily; CSS for the rest)

The scroll layer (ScrollTrigger, SplitText) loads only after the visitor first scrolls, presses a key or
touches the page (`lib/useScrollGsap.ts`): a visit that never scrolls never pays for it, and the first
paint never waits on it.

| Moment                                                                                                  | How                                    | Shows                      |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------- |
| Load: text rises, the handheld slides up and powers on (splash, then the game runs 240 ticks and stops) | CSS keyframes + one rAF loop that ends | determinism as a toy       |
| Pointer tilt of the handheld (fine pointers only)                                                       | CSS variables from `pointermove`       | it is an object you hold   |
| START / SELECT: replay, re-seed, verdict stamp                                                          | rAF loop, ends                         | same seed = same checksum  |
| Four buttons press in sequence when they enter (a combo)                                                | CSS on `data-visible`                  | the four values as one set |
| Feature card illustrations play once on reveal (typing verbs, fanning documents, pixel compare)         | CSS                                    | each card's fact           |
| High scores roll up digit by digit                                                                      | GSAP                                   | the counts are live data   |
| The road's path draws in, nodes pop, the marker lands on "now"                                          | GSAP timeline, ScrollTrigger once      | where we are               |
| Section headings rise word by word                                                                      | GSAP SplitText                         | guides the eye             |
| Core board on `/engine/parallel`: blocks drop into lanes, the gate orders a conflicting pair            | GSAP timeline                          | the parallel rule          |
| Hover: buttons press with a spring, cards lift, links nudge                                             | CSS                                    | affordance                 |

Rules: the prerendered HTML is the final state; hidden initial states exist only under `html.js` /
`html.js.hydrated`; `prefers-reduced-motion: reduce` shows the final state and turns the handheld into a
button that jumps straight to the verdict; transforms and opacity only (no CLS); every loop ends — nothing
runs once the sequence settles.

## Honesty

Present tense only for the website skill's "true today"; the editor, the chat's three modes, the optional
login, offline launcher, Windows export and the public repository are tagged **On the road**. No dates ahead,
no speed-up figure, no cross-machine determinism, no MCP, never the build lane, never "Unity for AI". Every
count is a `{{placeholder}}` from `client/data/counts.json`.
