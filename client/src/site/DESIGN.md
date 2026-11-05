# L4 "Feature tour" — design brief

Phase 2 of `plans/main-site.md`, direction L4 (inspired by how bevy.org presents information, never copied).

## The idea

The home page is **a cartridge's stage select**. The engine's capabilities are seven stages of one world
(`1-1` … `1-7`), each a calm, information-first section: a plain-language claim, two or three friendly
sentences, and **a proof you can touch** on a phosphor screen — a ledger you can break, a core board you can
re-deal, a golden you can wipe. The whole tour is visible at once in the hero (the select screen), and a
sticky **map rail** follows the reader down the page: a dotted path, one node per stage, a small pixel
player that walks to the stage in view.

It keeps the console identity of the beta (chassis grey, black phosphor screens, Press Start 2P labels,
JetBrains Mono readouts, Space Grotesk) and answers the founder's notes:

- **"Colours boring."** Each stage owns one arcade phosphor — green, amber, cyan, pink, blue, orange,
  violet — used only on its screen, its node on the map and its stage chip. The page reads as a colourful
  tour on a quiet chassis; body text never sits on a colour.
- **"Animation weak."** Every stage has its own motion moment, and each one shows the fact (see below).
- **"Nobody knows what a catalog item is."** The page says _features_, counts them in plain words, and
  shows the areas as level-progress bars.
- **"Grey test spheres."** The only engine pictures are the pixel-art character goldens (integer-scaled,
  no smoothing). Everything else is a captioned illustration drawn in the browser, or verbatim engine code.
- **"Information first, like bevy.org."** One capability per section, claim → explanation → evidence;
  no marketing cards, no stock, no testimonials.

## Page structure

**Home `/`**

| #   | Section                | What it proves                                                                  | The proof on its screen                                                                                                                                                       |
| --- | ---------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| —   | Hero + stage select    | What the engine is, the whole tour at a glance                                  | Nine cartridges with pixel icons, each a link to its stage                                                                                                                    |
| 1-1 | Write it as data       | Scenes are documents; patches stack; the engine answers which patch set a value | Three layers (base, patch 0, patch 1) slide into one resolved card with each value's source; tab: the verbatim wire request from `docs/scene-agent.md`                        |
| 1-2 | Same seed, same game   | Determinism: two runs, one checksum per line                                    | The checksum ledger (browser simulation): run A vs run B with two mini arenas and a tick scrubber; "change one input at tick 80" breaks it and names the first differing tick |
| 1-3 | Every core, one answer | Parallel systems, ordered conflicts, the same checksum                          | The core board: systems dealt onto 8 / 4 / 2 cores (buttons), the gated pair, the unchanged checksum                                                                          |
| 1-4 | Pictures are tests     | Goldens: a person accepts, a tool never does                                    | The golden wipe: drag between "this run" and "the golden" (a real accepted golden), PASS stamp; three ticks of the character as a filmstrip                                   |
| 1-5 | Held to a reference    | Oracles as a method; parity is the bar                                          | A wiring board: our subsystem → the reference tool, drawn on scroll; the misses line                                                                                          |
| 1-6 | The game answers back  | The four verbs                                                                  | A small console: query / command / capture / control played on the browser simulation                                                                                         |
| 1-7 | Your game is your code | Plain Rust, and it is yours                                                     | The engine's own test, imports trimmed, with its commit                                                                                                                       |
| ★   | Built today            | The feature count, misses included                                              | Seven level bars (built / partly / not yet), synced counts                                                                                                                    |
| ▶   | The road               | Where we are, no dates                                                          | Three stops, "now" lit; the Join-the-beta card                                                                                                                                |

**`/engine`** — what the engine is: the four-step procedure with the verbatim test lit step by step; the
five strengths as cartridges (to their pages); what is in the box (the engine families); the synced numbers.

**`/engine/ai`** (the designed strength page) — the four verbs in depth with the verbatim `command.apply`
request, the live console, "ask what it can do" (the manifest gate), "one door" (the wire never ships in a
game), and an explicitly labelled _On the road_ block for the editor's chat.

**Every other route** — a styled "stage under construction" page: its real two sentences from
CONTENT.md, a locked-stage screen, and the links that already answer the question today.

**Frame** — a chassis header (the mark + wordmark, eight nav links, "Join the beta" behind the `useJoinBeta()` flag), a
`<details>` menu on phones that works without JavaScript; a footer with four link columns and the status line.

## Motion moments (all: final state = reduced motion = no JS; compositor-only where it loops; nothing runs once settled)

1. **Load** — the headline rises through line masks (GSAP SplitText, lazy); the select screen powers on
   from a bright line; the cartridges are dealt in; "press start" blinks twice and holds.
2. **The map rail** — the pixel player walks to the stage in view (a transform transition); the path fills.
3. **Stage entry** — the stage chip wipes open, the claim rises (IntersectionObserver + CSS).
4. **Layers** — the three documents slide in and stack; the answer lines tick in with their sources.
5. **Ledger** — rows print in order, each match stamps green; breaking it re-prints and turns the rows after
   tick 80 red.
6. **Core board** — blocks land on their lanes; re-dealing to 4 or 2 cores moves each block to its new lane
   (FLIP with transforms); the checksum flashes "same".
7. **Golden wipe** — the divider sweeps once across, then follows the slider.
8. **Wiring board** — each wire draws to its reference in turn.
9. **Console** — capture flashes and draws crop marks; control steps the tick; query prints the state.
10. **Built today** — bars fill from the left, numbers count up once.
11. **Road** — the stops light in sequence up to "now".
12. **Hover** — cartridges lift with a pixel shadow; keys press down on `:active`; links draw their underline.

## True today (the press-start-website skill, binding)

Present tense only for what is true today; the roadmap block and the road are worded without dates. Every
browser simulation is captioned as an illustration. Code is verbatim with commit, file and lines in
CONTENT.md. Counts are placeholders from `counts.json`. Reference tools are plain mono text, no logos.
No MCP server, no build lane, no speed-up figure, no cross-machine determinism.
