# Press Start — page copy

All words on the site live here, one `## <section-id>` per section, in page order (PLAN.md §8's format:
`headline:`, `kicker:`, `cta:` lines, then Markdown body). Numbers are placeholders filled from
`client/data/counts.json` at build (written by `client/scripts/sync-engine-facts.ts` against the engine repository);
never type a count by hand. First draft from PLAN.md §3 (2026-11-01), shaved on the founder's note of the same day
("less technical, more friendly; keep the proof"); lines in *(italics, parentheses)* are notes to the builder, not
copy. Counts on 2026-11-01: catalog 404 entries, 103 BUILT, 129 PARTIAL, 32 SKIP; 89 crates; 71 reference tools;
189 accepted goldens.

## header

wordmark: Press Start
nav: Build · Proof · Built today · Roadmap · FAQ
cta: Join the beta
menu: Menu
index: 00 boot | 01 fault | 02 spec | 03 procedure | 04 proof | 05 cores | 06 reference | 07 goldens | 08 levels | 09 road | 10 insert | 11 manual

*(The pill is fixed top-right on every scroll position and scrolls to `#signup`. The bar turns translucent after
80 px of scroll.)*

## hero

kicker: Tests, not eyes.
headline: A game engine an AI can build in, and prove.
cta: Join the beta | See what is built ↓

Your agent writes the game as documents, runs it on a fixed tick, and proves every frame against a reference. Same seed, same inputs, same game. Every time.

small: Private beta. Version 1 is not public yet. Windows first.

boot-lines: press start · system check | seed 0x5eed | fixed tick · no clock | input tape · recorded | checksum | verdict
screen-label: main screen · attract mode
ledger-head: rank | tick | run A | run B | result
replay-label: two runs, one game
replay-runs: run A | run B
replay-third: run C · another seed
replay-caption: a small simulation drawn in your browser: one seed, no clock, a fixed tick, a checksum of the state every tick · two runs from the same seed match line for line; a third run from another seed does not
replay-verdict: PASS
replay-fail: FAIL
replay-match: checksums match
replay-event: input tape

*(Visual: "two runs, one game" — two panels of the same simulation state, `run A` / `run B`, over the checksum
rows computed live (`client/src/lib/sim.ts`). It is an illustration of the rule, not engine output; the engine's
own booth capture replaces it when the founder gives the go.)*

## problem

headline: Agents can type code. They cannot see whether the game is right.

trace-label: diagnostic
trace: script | play | screenshot | guess

Ask an agent for a game in an engine built for human hands. It writes a script, presses play, takes a screenshot and
guesses. The frame rate changes the outcome, the random seed is unseeded, and nothing says what "right" means. Two
runs are two different games.

*(Visual: a tangle of three strands — script → play → screenshot → guess — drawn on scroll.)*

## what

headline: An engine whose first user is an agent. You direct it.

spec-label: spec sheet

**Everything is a document.** Scenes, laws and assets are files an agent can read and write. {{crates}} engine
crates cover terrain, shaders, physics, animation, UI, navigation, networking and more.

**The game answers back.** A running game answers four verbs: *query*, *command*, *capture*, *control*. Your agent
asks, edits, looks and steps through the same door a player uses.

**Every feature can fail a test.** Pixel goldens, geometry checks and a reference tool to match. Nothing is taken on
faith.

*(Visual: Document → Plugin → Running world, the wire looping back from the world to the agent. Sources:
docs/00-build-a-game.md §1-2; docs/10-ai-layer.md §2.)*

## build

headline: How an agent builds a game here.

1. **Write the scene as data.** A scene is a base plus patches. A field is set by name, never by a click.
2. **Validate before it runs.** Every document is checked before the app exists. A refusal names the value and the
   fix.
3. **Run it on a fixed tick.** Tick 128 is the same tick on every run, driven by a recorded input tape.
4. **Look with numbers, then pixels.** Query the positions and the state checksum, capture the frame, compare it
   with its golden.

procedure-label: procedure

sample-caption: press_start_testkit's own test, copied from docs/00-build-a-game/test-app.md (imports trimmed)
sample-commit: 45aeffd2a2ecc3b3049819151abfc1c1343fb2aa
sample-source: docs/00-build-a-game/test-app.md
sample-lines: 12-14 | 16-17 | 19 | 20

```rust
use press_start_test_app::{advance, fixed_step_app};

#[derive(Resource, Default)]
struct TickCount(u64);

fn count_ticks(mut count: ResMut<TickCount>) {
    count.0 += 1;
}

#[test]
fn three_fixed_steps_a_frame_are_thirty_after_ten_frames() {
    let mut app = fixed_step_app(3);
    app.init_resource::<TickCount>();
    app.add_systems(FixedUpdate, count_ticks);

    app.update(); // priming: Startup runs, zero fixed steps
    assert_eq!(app.world().resource::<TickCount>().0, 0);

    advance(&mut app, 10);
    assert_eq!(app.world().resource::<TickCount>().0, 30);
}
```

*(Visual: the code sample above as selectable text. It is copied verbatim from the engine on the day it is
written and its commit is recorded in `sample-commit`. Do not invent API.)*

## determinism

headline: Same seed, same inputs, same frame.

Every random stream comes from one seed you can write down. Game logic may not read the clock or sleep. The
simulation steps on a fixed tick. So a replay is exact, a test is a fact, and "the bug at tick 340" is something one
agent can hand to another. *Today: the same build on the same platform.*

*(Visual: the hero's tick ruler with two identical hash columns, static.)*

## parallel

kicker: every core
headline: All your cores. The same answer.

Press Start runs your game's systems across every core of the machine, and nothing is
slowed to a single thread to make it reproducible. Our gate refuses two systems that touch the same data in no
declared order, and names both. A parallel sum must be ordered or order-independent, never "whatever the scheduler
did". So the replay does not depend on how many cores ran it.

subhead: Proven on integrated graphics.

Every picture the engine proves is shot on an Intel UHD 770, the integrated graphics of an office desktop, and no
other card is allowed. If it holds there, it holds on the machines players actually own.

lanes: input · physics · navigation · animation · camera · UI · audio · VFX
core-label: core
gate-label: gate · order declared
readout-label: state checksum
readout-cores: 8 cores | 2 cores

*(Visual: eight core lanes filling with system blocks in parallel; two blocks on different lanes that touch the
same data get caught by the gate and ordered; then the same checksum reads out for 8 cores and for 2. Sources:
docs/15-determinism-parallelism.md; docs/00-build-a-game.md §3 for the reference card.)*

## oracles

headline: Measured against the tools you already trust.

We do not grade our own homework. Physics is held against Jolt and PhysX, navigation against Recast, UI against
Chromium and Yoga, text against HarfBuzz, lighting against Mitsuba, meshes against Blender and Manifold. Where we
differ, the difference is written down with both numbers.

small: Parity is the bar. Not every feature meets it yet, and the misses are recorded.

references: Jolt · PhysX · Recast · Chromium · Yoga · HarfBuzz · Mitsuba · Blender · Manifold

attract-label: held against

*(Visual: the reference names as plain mono text in a slow marquee. No logos.)*

## goldens

headline: Pictures are tests too.

Every picture the engine draws in a test is compared with a golden: a frame a human accepted in a reviewed commit.
A tool can propose a golden. It can never accept one.

review-candidate: this run
review-golden: the golden
review-verdict: PASS · 0 px differ
review-steps: shot on one reference card | compared pixel by pixel | a human accepted it in a reviewed commit
strip-label: more accepted goldens
sheet-caption: the engine's {{goldens.accepted}} accepted goldens are test evidence, not screenshots: small, plain, shot with the noisy features off

*(Visual: one featured golden in a review frame (a wipe between "this run" and "the golden", verdict PASS, the
three steps as a mono checklist), then a small filmstrip of five more. The files and their provenance rows live in
`client/assets/renders/`; `manifest.featured` and `manifest.strip` pick them.)*

## built

headline: What the engine covers, and how much of it is built.

tiles: {{crates}} engine crates · {{catalog.built}} of {{catalog.total}} things built · {{oracles}} reference tools

We keep a checklist of everything a game engine needs: {{catalog.total}} things, from terrain to crash reports,
in seven areas. A thing counts as built only when a test holds it. Here is where each area stands today.

area-labels: world = World building · scenes, terrain, procgen, 2D, navigation | simulation = Simulation · physics, input, cameras, performance | rendering = Rendering · lighting, pipelines, shaders, textures | asset-creation = Asset creation · modeling, rigging, animation, pipeline | game-services = Game services · audio, UI, save, localisation, VFX | networking-export = Reach · networking, export, platforms | missing-domains = Beyond the usual · things no engine ships, written down anyway
area-unit: built
insert-title: how to play
stage-label: stage

proof: The first game, *Team Fights*, a small team shooter made of primitives, is built on these crates.

bar-legend: BUILT | PARTIAL | SKIP | not yet

*(Visual: the six tiles plus one thin stacked bar — BUILT / PARTIAL / SKIP / not yet — summing to
{{catalog.total}}. A Team Fights frame only once it is an accepted golden.)*

## roadmap

headline: Where we are.

Press Start is not public yet. The direction, in order:

1. **Private beta:** the engine is built and tested in private, and the list is open.
2. **Version 1:** a launcher, a new project from a template, save, build, Windows export. No account required, and
   it works fully offline.
3. **Version 1.x:** regular releases, more of the engine, more platforms.

now-label: now

subhead: What "beta" means.

You get an invitation when version 1 opens, and earlier builds if we open a private preview. We email you about
access and major releases only.

*(Visual: a vertical three-stop line, the current stop lit, no dates. Direction only: never name internal
work in progress.)*

## signup

headline: Join the beta.

We will email you when your invite is ready. Nothing else, unless you ask.

field-email: Email
field-role: What do you build? (optional)
field-role-options: Games with AI agents | AI tools | Rust games | Something else
cta: Request access
busy: Sending…
state-success: Check your inbox to confirm.
state-success-list: You are on the list.
state-existing: You are already on the list.
state-invalid: That address does not look right.
state-error: Something failed on our side. Try again.
success-card: Player 1 ready
coming-soon: Sign-ups open soon. *(Shown when no endpoint is configured.)*
slot-label: insert cartridge
ready-label: player 1

consent: We store your email, and your answer if you give one, only to send beta access and release news. One click
unsubscribes and deletes it. [Privacy](/beta/privacy)

## faq

headline: Questions.

manual-label: manual

1. **Is it open source?** It will be source-available. The repository goes public at version 1, under our own
   licence: free to make and ship games, with a royalty only above a revenue threshold.
2. **Do I need an account?** No. An account will be optional, and nothing in the engine, editor or launcher will
   require one.
3. **Which AI does it work with?** Your own. The engine exposes data and verbs, not a model. *(Keep this line until
   the editor's agent door is specified; do not name a vendor.)*
4. **Which platforms?** Windows first at version 1. More platforms follow.
5. **How much will it cost?** Using and shipping is free below a revenue threshold. The threshold and the rate are
   set with the licence text.
6. **When?** When version 1 passes its release gate. We do not publish dates we have not earned.

## footer

links: Press Start · © 2026 · Licence · Privacy · GitHub · Discord · contact

licence-stub: Licence: source-available, published with version 1.

*(GitHub links to this website's repository until the engine is public. Discord links to the community server
(https://discord.gg/XrmRJ5p2Xf, `DISCORD_URL` in client/src/lib/config.ts); the contact address waits on PLAN.md §10 question 7.)*

## privacy

headline: Privacy.

small: Last updated 2026-11-01.

**What we store.** Your email address, your answer to "What do you build?" if you gave one, the version of the
consent text you agreed to and the time you agreed. Nothing else: no IP address, no user agent, no cookies, no
trackers.

**Why.** To send you beta access and Press Start release news. That is the only use. The lawful basis is your
consent.

**Who processes it.** Cloudflare stores the list (a D1 database) and serves the sign-up; Resend sends the
confirmation and the news. Neither receives anything beyond what is needed to do that.

**How long.** Until you unsubscribe, or 30 days after version 1 ships if you never confirmed your address.

**Your choices.** One click in any email we send unsubscribes you and deletes your row. You can also ask for a
copy or a deletion by writing to the contact address in the footer.

## confirmed

kicker: Confirmed.
headline: Player 1 ready.

Your address is confirmed. We will email you when your invite is ready, and about major releases. Nothing else,
unless you ask.

cta: Back to the site

## not-found

kicker: 404
headline: Tick not found.

There is nothing at this address. The page you want is probably on the one road we have.

cta: Back to the site

## site-header

*(The main site at pressstartgames.net, from here to the end of the file. Every section above is the beta's page,
now served under /beta. Layout L2 "Platform suite" (client/src/site/DESIGN.md). Copy follows the
press-start-website skill: present tense only for what is true today, no dates.)*

wordmark: Press Start
skip: Skip to content
nav-label: Site
nav: Engine | Resources | Company
cta: Join the beta
menu: Menu
close: Close menu
home: Press Start, home

## site-nav

*(The mega-menu. Each entry is `page-id = label = one line`; the page ids are the routes in
client/src/content/schema.ts. The Engine panel groups its entries by the three moves.)*

moves: Build as data | Prove | Own the code
move-notes: Write the game as files an agent can read | Show it is right, with numbers | Keep the code, and the game
engine-build: engine-ai = The AI surface = Four verbs your agent uses to ask, edit, look and step
engine-prove: engine-determinism = Determinism = Same seed, same inputs, same game | engine-parallel = Parallel = All your cores, the same answer | engine-oracles = Oracles = Held against the tools the industry trusts
engine-own: engine-ownership = Ownership = The game is a Rust workspace you own | licensing = Licensing = Source-available, with version 1
overview: engine = The engine = Written as documents, proven by tests. Start here for the whole map.
resources: learn = Learn = The shape of a game on Press Start | roadmap = Roadmap = Private beta now, version 1 next, then 1.x | showcase = Showcase = The first game, Team Fights | news = News = Version notes, once there are versions
company: about = About = The mission and the method | community = Community = Discord, and the people building it | licensing = Licensing = How the engine will be licensed
beta: Private beta · Version 1 is not public yet. Join to hear first.

## site-footer

label: Footer
legal: Privacy | Terms | Cookies
line: The engine an AI builds games in. Version 1 is not public yet.
map-label: Site map
columns: Engine | Prove | Resources | Company
synced: Counts synced from the engine at commit
discord: Discord
discord-note: Talk with the people building Press Start

## site-home

title: Press Start · A game engine an AI can build in, and prove.
description: Press Start is a game engine whose first user is an AI agent: the game written as documents, a replay that is exact, and every feature measured against a reference tool.
kicker: Private beta · Windows first
headline: A game engine an AI can build in, and prove.
cta: Join the beta | Explore the engine

Your agent writes the game as documents, runs it on a fixed tick and proves every frame against a reference.
Same seed, same inputs, same game, and the code stays yours.

## site-home-console

*(The hero's suite console: three panes wired left to right. The run and the checksums are computed in the
browser by client/src/lib/sim.ts; it is an illustration of the engine's rule, not engine output.)*

label: the suite · an illustration
panes: the document | the run | the proof
doc-name: two-a-side.game
doc-check: ✓ checked before the run starts
doc-lines: game = two-a-side | seed = 0x5eed | clock = none | tick = fixed | players = 4 | input tape = tick 120 · jump
ledger-head: tick | run A | run B
pass: PASS
fail: FAIL
verdict-pass: replay exact · every tick matches
verdict-fail: another seed · the runs part at once
replay: Run it again
reseed: Try another seed
caption: Drawn in your browser: a small simulation stepped from one seed on a fixed tick, with a checksum of the state at every tick. Same seed, same checksums. Change the seed and the proof fails, as it should.

## site-home-facts

*(Every number is a placeholder synced from the engine; never typed.)*

label: In numbers, synced from the engine
items: {{crates}} = engine crates = from terrain to networking, built | {{catalog.built}} = things built = of the {{catalog.total}} an engine needs | {{oracles}} = reference tools = that hold the engine to account | {{goldens.accepted}} = accepted goldens = pictures that are tests

## site-home-moves

kicker: One engine, three moves
headline: Build it as data. Prove it. Own it.

Most engines are built for a human with a mouse. Press Start is built so that an agent can do the work and
you can trust what it did: the game is files, the proof is numbers, and the code stays yours.

items: build = Build as data = Scenes, rules and assets are documents. Your agent reads and writes them; the running game answers back. | prove = Prove = Every feature can fail a test. Replays are exact, threads keep their order, and a reference tool checks the result. | own = Own the code = A game is a Rust workspace you own. It opens, reads and runs without us.

## site-home-build

kicker: 01 · Build as data
headline: Everything is a document. The game answers back.

A scene is a file, not a pile of clicks: a base plus patches, every field set by name and checked before
the game starts. A refusal names the value and the fix. {{crates}} engine crates cover the systems a game needs:
terrain, physics, animation, UI, navigation, networking and more.

A running game answers four verbs. Your agent asks, edits, looks and steps through the same door a player
uses. You bring the AI; the engine exposes the data and the verbs.

verbs: query = Ask = Where is the ball, and who is closest to it? = The whole state, as data: every position, the score, and the checksum of this tick. | command = Edit = Move the left goal two metres back. = Done as one command, written to the journal and stamped with its tick. | capture = Look = Show me tick 128 from the side camera. = A frame from the deterministic photo booth, addressed by its tick: the same picture every time. | control = Step = Pause, step ten ticks, then press jump for player one. = Paused, stepped, and the jump injected through the player's own input.
console-label: four verbs · in plain words
console-note: An illustration of what each verb does, not the wire format.
you: you
game: game
link: The AI surface

## site-home-prove

kicker: 02 · Prove
headline: Tests, not eyes.

An agent cannot see whether a game is right, so the engine says it in numbers. Four kinds of evidence, each
with its own page.

cards: engine-determinism = Same seed, same game = One seed, no clock, a fixed tick. Two runs give the same checksum on every tick, on the same build and platform. | engine-parallel = All cores, one answer = Systems run in parallel. Two that touch the same data must be ordered, and the gate names both. | engine-oracles = Held to a reference = Physics, navigation, UI, text and lighting are checked against the tools the industry trusts. | engine-oracles = Pictures are tests = Every frame a test draws is compared with a golden a human accepted. A tool can propose one, never accept it.
lanes: input | physics | animation | camera | UI
gate: ordered
references: Jolt · PhysX · Recast · Chromium · Yoga · HarfBuzz · Mitsuba · Blender · Manifold
golden: an accepted golden | compared pixel for pixel
small: Parity with each reference is the bar, not a claim. The misses are written down with both numbers.

## site-home-own

kicker: 03 · Own the code
headline: The game is your code.

A game on Press Start is a plain Rust workspace: it opens, reads and runs without us. A bug a game finds is
fixed in the engine, at its root, never patched around in your code.

today-label: True today
today: A plain Rust workspace | Every system a plugin plus a document | Bugs fixed in the engine, at the root
road-label: On the road, with version 1
road: Source-available: free to make and ship, a royalty only above a threshold | An optional account; nothing requires a login | Works fully offline · Windows first
cart-label: your game
cart-lines: Rust workspace | your repository | yours to ship
link: Ownership and licensing

## site-home-status

kicker: Where we are
headline: Version 1 is not public yet. Here is how far it is.

We keep a checklist of everything a game engine needs: {{catalog.total}} things in seven areas. A thing counts as
built only when a test holds every clause of it. We publish the misses too.

areas: world = World · terrain, scenes, navigation | simulation = Simulation · physics, input, cameras | rendering = Rendering · lighting, shaders, textures | asset-creation = Assets · modeling, rigging, animation | game-services = Services · UI, audio, save, localisation | networking-export = Reach · networking, export | missing-domains = Beyond the usual · what the first game needed
legend: built | partial | skipped | not yet
total: {{catalog.built}} built · {{catalog.partial}} partial · {{catalog.skip}} skipped · of {{catalog.total}}
link: The whole road

## site-road

*(The road, three stops, a line each: on the home page's status board and on /roadmap. Direction only, no
dates; internal work in progress is never named here.)*

label: The road · no dates
stops: Now = Private beta = The engine is built and tested in private, and the list is open. | Next = Version 1 = A launcher, a new project from a template, save, build, Windows export. No account required; works offline. | Then = Version 1.x = Regular releases, more of the engine, more platforms.

## site-home-audience

kicker: Made for
headline: Who it is for.

items: Studios and solo developers = who want an AI to do real work on a real game, and need to trust what it did. | Teams burned by flaky tests = who want a fixed tick, a seed, and a replay that is exact by construction. | Rust developers = who want the pieces a game needs, built once, measured against the industry's tools, and owned as Rust. | Builders of AI tools for games = who need an engine that answers questions instead of being screenshotted.

## site-home-next

items: learn = Learn = Build a game = The shape of a game today: documents, a fixed tick, a reference to prove against, and four verbs for your agent. Guides follow. = See the shape | licensing = Licensing = Free to make and ship = Source-available, with a royalty only above a revenue threshold. The terms are written with version 1. = How it will work | community = Community = Come build with us = Talk with the people building the engine on Discord. The way into the engine itself is the beta. = Join the Discord

## site-home-join

headline: Press start.

The beta opens with version 1. Leave your email on the beta page and we will write when your invite is ready.
Nothing else.

cta: Join the beta | Read the roadmap
off: The beta list is not open right now. The roadmap says where we are.

## site-not-found

title: Not found · Press Start
description: There is nothing at this address.
kicker: 404
headline: Tick not found.
cta: Back to the start

There is nothing at this address. The site map below has every page we have.

## site-stub

*(The frame around every page that is not designed yet.)*

label: This page is being written
today: What you can read today
links: engine | engine-oracles | roadmap
crumbs: Breadcrumb

## page-engine

title: The engine · Press Start
description: What Press Start is: the engine an AI builds games in, every system a document plus a plugin, every feature able to fail a test.
kicker: The engine
headline: An engine written as documents.

Press Start is a game engine with an AI agent as its first user. {{crates}} engine crates cover the
systems a game needs, from terrain to networking. Every system is a document plus a plugin, checked before
the game starts; every feature can fail a test; the game you build is Rust code you own.

## site-engine

*(The /engine page below its header: the three moves as chapters, the catalog, the ledger.)*

chapters: build = Build as data = The game is written as documents: scenes, rules, materials, rigs and UI, all data with one canonical byte form. A running game answers four verbs. | prove = Prove = Every claim has a test behind it: an exact replay, an ordered schedule, a reference tool, a golden picture. | own = Own the code = A game is a Rust workspace you own. What the engine depends on is vendored, patched and owned.
pages-label: Read the detail
covers-label: What the engine covers
covers: A checklist of {{catalog.total}} things a game engine needs, in seven areas. Built means a test holds every clause.
ledger-label: True today, and on the road
today: {{crates}} engine crates, from terrain to networking | Every system a document plus a plugin, validated before the app exists | Four verbs: query, command, capture, control, plus input injection | Exact replay on the same build and platform | Held against {{oracles}} reference tools | Pictures checked against {{goldens.accepted}} accepted goldens | The first game, Team Fights, built on the crates
road: A launcher, a new project from a template, save, build, Windows export | No account required; works fully offline | The source-available licence, with version 1
today-head: True today
road-head: On the road · no dates

## page-engine-determinism

title: Determinism · Press Start
description: Same seed, same inputs, same game, on the same build and the same platform.
kicker: Determinism
headline: Same seed, same inputs, same game.

One seed, no wall clock, no sleep, a fixed tick and a checksum at the boundary. Replay is exact on the same build
and the same platform. This page is being written; the engine overview has the short version.

## page-engine-parallel

title: Parallel · Press Start
description: Systems run in parallel, and the answer stays the same.
kicker: Parallel
headline: All your cores, the same answer.

Any two systems that touch the same data are ordered, or proven disjoint; every floating-point sum is ordered. No
speed-up figure is claimed. This page is being written; the engine overview has the short version.

## page-engine-oracles

title: Oracles · Press Start
description: Every feature measured against a reference tool the industry already trusts, with the differences written down.
kicker: 02 · Prove · Oracles
headline: Measured against a reference.

We do not grade our own homework. Each part of the engine is held against a tool the industry already trusts:
{{oracles}} of them. Where we differ, the difference is written down with both numbers and a reason, never
hidden in a tolerance.

## site-oracles

*(The /engine/oracles page below its header. Reference tools are named as plain mono text only, never logos.)*

steps-label: How an oracle works
steps: Same scene, both sides = The engine and the reference tool run the same scene, outside the shipped game. | Both numbers, written down = The outputs are compared. A difference becomes a recorded row with both numbers and a reason. | The reference wins = A disagreement is resolved toward the reference, never by widening a tolerance.
board-label: The reference board
board-head: what is checked | held against
board: physics = Jolt · PhysX | navigation = Recast | UI layout = Chromium · Yoga | text shaping = HarfBuzz | lighting = Mitsuba | meshes = Blender · Manifold | plurals = ICU | textures = ImageMagick
board-note: Plain names, no logos. The tools check the engine during development; none of them ships in your game.
rules-label: Two rules
rules: Parity is the bar = Matching the reference is the target, for the output and for the speed. Not every part meets it yet, and the misses are recorded rows. | Same threads, or no comparison = Speed is measured at the reference's own thread count, on a recorded machine state. Anything else would be cheating.
golden-label: Pictures are held too
golden: Every picture the engine draws in a test is compared with a golden, shot on one reference card, pixel for pixel. A tool can propose a golden; only a human accepts one, in a reviewed commit.
golden-caption: An accepted golden from the engine's terrain crate, shown as it is: test evidence, not a screenshot.
provenance: crate | test | engine commit
next-label: More in Prove
next: engine-determinism | engine-parallel

## page-engine-ai

title: The AI surface · Press Start
description: A running game answers four verbs: query, command, capture, control.
kicker: The AI surface
headline: Your own AI, through the player's door.

A running game answers four verbs: *query*, *command*, *capture*, *control*, plus input injection. The engine
exposes data and verbs; you bring the agent. This page is being written; the home page shows the four verbs.

## page-engine-ownership

title: Ownership · Press Start
description: A game on Press Start is your own Rust code.
kicker: Ownership
headline: The game is your code.

A game on Press Start is a Rust workspace you own. The source-available licence is on the road; its terms are not
written yet. This page is being written.

## page-showcase

title: Showcase · Press Start
description: Games built on Press Start, shown only through the engine's own renders.
kicker: Showcase
headline: Made with Press Start.

The first game, Team Fights, a small team shooter made of primitives, is built on the engine's crates. Its
pictures appear here once the engine accepts them as goldens; until then we show nothing rather than a mock-up.

## page-roadmap

title: Roadmap · Press Start
description: Where Press Start is going: private beta now, version 1 next, then 1.x.
kicker: Roadmap
headline: The road, in order.

Where Press Start is going: three stops, a line each, no dates.

## page-learn

title: Learn · Press Start
description: How a game is built on Press Start.
kicker: Learn
headline: Build a game.

Guides will live here. The shape of a game today: documents, a fixed tick, a reference to prove against, and four
verbs for your agent.

## page-news

title: News · Press Start
description: Version notes and news from Press Start.
kicker: News
headline: News.

Version notes will be posted here once there are versions. Nothing is posted yet.

## page-licensing

title: Licensing · Press Start
description: How Press Start will be licensed.
kicker: Licensing
headline: Source-available, with version 1.

The plan: version 1 comes with our own source-available licence. Free to make and ship games, with a
royalty only above a revenue threshold, and an optional login that nothing requires. The terms are not written yet.

## page-about

title: About · Press Start
description: The mission and the method behind Press Start.
kicker: About
headline: Tests, not eyes.

Press Start is a game engine whose first user is an AI agent. Every feature can fail a test; the
misses are counted and published.

## page-community

title: Community · Press Start
description: Where to find the people building Press Start.
kicker: Community
headline: Come build with us.

Talk with the people building Press Start on Discord. The way into the engine itself is the beta: [join the beta](/beta/).

## page-privacy

title: Privacy · Press Start
description: The site's privacy notice.
kicker: Legal
headline: Privacy.

The site-wide privacy notice is being written. The beta sign-up's notice is here: [beta privacy](/beta/privacy).

## page-terms

title: Terms · Press Start
description: The site's terms of use.
kicker: Legal
headline: Terms.

The site's terms are being written.

## page-cookies

title: Cookies · Press Start
description: The cookies this site sets.
kicker: Legal
headline: Cookies.

This site sets no cookies.
