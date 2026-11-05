---
name: press-start-website
description: How this repository (the Press Start engine's beta landing page) ties to the engine repository at C:\Yanivs\GameDev\PressStart — where every claim, count and picture comes from, what is true today versus roadmap, and the rules for publishing engine output. Use before writing or changing any copy, number, image or claim on the site, before syncing facts from the engine, and whenever unsure whether something about the engine may be said.
---

# The site and the engine

## The engine repository

- Path: `C:\Yanivs\GameDev\PressStart` (git, branch `v2-full-engine`; Rust, Bevy 0.19.1).
- **Read-only from here.** Never write a file there, never run cargo there, never commit there. If the site needs
  something from the engine that does not exist yet (a booth capture, an accepted golden), it is a request to the
  founder, not an edit.
- It has its own Claude sessions and rules; nothing in its `CLAUDE.md` or `AGENTS.md` applies to this repository.

## Where the claims come from

Every sentence the site says about the engine traces to one of these (PLAN.md §1 has the claim-by-claim table):

| engine document | what it backs |
|---|---|
| `README.md` | what Press Start is; built around Bevy; the builder/critic method ("the method, not the product") |
| `docs/00-build-a-game.md` | the crate count, Bevy version, documents + plugins, the headless app, determinism, goldens, the first game (Team Fights) |
| `docs/catalog/` (`README.md` and the per-area files' `- state:` bullets) | the catalog counts: BUILT / PARTIAL / SKIP |
| `docs/12-orchestration.md` | "tests, not eyes", oracles everywhere, the speed bar (parity, 1.0×), the reference card |
| `docs/10-ai-layer.md` §2 | the four verbs (query, command, capture, control) and input injection |
| `docs/13-positioning.md`, `docs/15-determinism-parallelism.md` | determinism by construction; parallel and still deterministic |
| `docs/03-founder-rulings.md` §117 | the road: editor, version 1, licence, optional login, public repository |

If a claim cannot be traced to the engine's own documents, it is not published.

## The counts (as of 2026-11-01)

| fact | value | how it is derived |
|---|---|---|
| catalog entries | 404 | `grep -h '^- state:' docs/catalog/*.md` |
| BUILT | 103 | same (BUILT = every clause held by a landed test) |
| PARTIAL | 129 | same |
| SKIP | 32 | same (the rest: 9 crate-exists-unjudged, 131 undetermined) |
| engine crates | 89 | `ls crates \| grep -c press_start` |
| oracle (reference tool) directories | 71 | `ls -d oracles/*/ \| wc -l` |
| accepted goldens | 189 | `find crates -path '*goldens*' -name '*.png' ! -name '*.candidate.png'` |
| golden candidates | 939 | `find crates -path '*goldens*' -name '*.candidate.png'` |

**Re-synced before every release** by `client/scripts/sync-engine-facts.ts <engine path>`, which writes
`client/data/counts.json` with the engine commit it read. The copy uses placeholders; nobody types a number. If the
sync's result differs from the table above, the sync wins and this table is updated.

## Pictures

- The engine's renders live in its crates' golden directories, `crates/*/goldens/` (accepted:
  `press_start_sprite_bevy` 77, `press_start_shader_bevy` 61, `press_start_ui` 31, `press_start_mesh_bevy` 9,
  `press_start_terrain_bevy` 6, `press_start_animation_bevy` 4, `press_start_render` 1), and its review
  directories (`oracles/review/` with the eye-review page and its subject folders; the editor's
  `crates/press_start_editor/test-output/`).
- **Only accepted goldens are published.** A `*.candidate.png` (e.g. the Team Fights frames in
  `crates/press_start_ts_game/goldens/`) waits until the engine accepts it.
- **Only our own half of a review pair.** The other half is a reference tool's output (Blender, Unreal, Unity …)
  and is never shown. No logos of other engines; no restricted game's look or branding.
- The editor's test output may appear only on the roadmap, captioned as in progress.
- Every imported image gets a row in `client/assets/renders/manifest.json`: engine commit, crate, test name,
  source path, golden or booth capture. CI refuses an image with no row.
- Marketing-grade booth captures (the hero's two runs, wide frames) are an engine-side task that needs the
  founder's go. Until then the hero uses clearly placeholder frames.

## True today vs roadmap

Present tense only for TRUE TODAY:
- 89 engine crates; every system a document plus a plugin, validated before the app exists;
- the four-verb wire (query, command, capture, control) plus input injection, in-repo;
- deterministic replay **scoped to the same build on the same platform** (one seed, no wall clock, no sleep, fixed
  tick, boundary checksum);
- the ambiguity gate and the parallel-reduction doctrine (no speed-up number is claimed);
- oracles as a method (71 directories); parity (1.0×) is **the bar, not an achievement**;
- goldens on one reference card, never accepted by a tool; the catalog counts;
- the first game, Team Fights stage 1, built on the crates.

ROADMAP (a plan, worded without dates, only in the roadmap section and the FAQ):
- **On the site the road is direction only** (founder, 2026-11-05): Now: private beta · Next: version 1 · Then:
  version 1.x (regular releases, more of the engine, more platforms). The internal stages below and in the engine's
  roadmap (the licence work, waves, the repository split) are never named or described on the site.
- the editor (`press_start_editor` exists but the editor wave is ahead), the undo law with it;
- the launcher, new project from a template, save, build, **Windows export** (version 1);
- the optional login nothing requires; the engine works offline;
- the source-available licence text (rate and threshold are the founder's, unset);
- the public repository (at version 1); public CI.

Never claimed or mentioned:
- **Bevy is never named on the site** (the engine is built around it internally; the site does not say so) and the
  words "honest"/"honestly" are not used. Founder, 2026-11-05; `check-content` enforces it.
- **No MCP server exists**; the external-agent door is the editor's brokered API, which is roadmap. Say "your own
  AI; the engine exposes data and verbs".
- **The build lane** (the engine's internal build and test scheduler) is internal tooling and is never mentioned.
- "Unity for AI" is the engine's internal line and is not used publicly.
- No dates, no speed-up numbers, no cross-machine determinism.

## Checklist before a release

1. Run the sync against the engine checkout; read the diff of `counts.json`.
2. Re-read every claim in `CONTENT.md` against the table above; anything that moved from roadmap to true today needs
   its engine document cited in the commit message.
3. Every image has a manifest row naming an accepted golden.
