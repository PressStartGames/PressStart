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

Press Start is built on Bevy. Your agent writes the game as documents, runs it on a fixed tick, and proves every
frame against a reference. Same seed, same inputs, same game. Every time.

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
crates cover what Bevy leaves out: terrain, shaders, physics, animation, UI, navigation, networking and more.

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

sample-caption: press_start_testkit's own test, copied verbatim from docs/00-build-a-game/test-app.md
sample-commit: 45aeffd2a2ecc3b3049819151abfc1c1343fb2aa
sample-source: docs/00-build-a-game/test-app.md
sample-lines: 15-17 | 19-20 | 22 | 23

```rust
use bevy::app::FixedUpdate;
use bevy::ecs::resource::Resource;
use bevy::ecs::system::ResMut;
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

Bevy runs your game's systems across every core of the machine, and Press Start keeps it that way: nothing is
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

headline: Where we are, honestly.

Press Start is not public yet. This is the road to version 1, in order:

1. **Version 1:** a launcher, a new project from a template, save, build, Windows export. No account required, and
   it works fully offline.
2. **Then:** the big performance pain points, one full release gate, and the public repository under our own
   source-available licence.
3. **After:** a version every two weeks, the remaining gaps, more platforms.

now-label: now

subhead: What "beta" means.

You get an invitation when version 1 opens, and earlier builds if we open a private preview. We email you about
access and major releases only.

*(Visual: a vertical four-stop line, the current stop lit, no dates.)*

## signup

headline: Join the beta.

We will email you when your invite is ready. Nothing else, unless you ask.

field-email: Email
field-role: What do you build? (optional)
field-role-options: Games with AI agents | AI tools | Bevy projects | Something else
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
4. **Is it a Bevy fork?** No. It is built around Bevy 0.19: each system is a Bevy plugin plus our own document
   formats, and a game is a normal Rust codebase you own.
5. **Which platforms?** Windows first at version 1. More platforms follow.
6. **How much will it cost?** Using and shipping is free below a revenue threshold. The threshold and the rate are
   set with the licence text.
7. **When?** When version 1 passes its release gate. We do not publish dates we have not earned.

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
now served under /beta. Layout L3 "Community engine" (client/src/site/DESIGN.md). Copy follows the
press-start-website skill: present tense only for what is true today, roadmap items tagged as such, no dates
ahead, no speed-up figure, never the build lane.)*

wordmark: Press Start
skip: Skip to content
nav-label: Site
nav: Engine | Showcase | Roadmap | Learn | News | Licensing | About | Community
cta: Join the beta
menu: Menu

## site-footer

label: Footer
legal: Privacy | Terms | Cookies
groups: The engine | The project | The studio | Legal
discord: Discord
line: A game engine built around Bevy. Version 1 is not public yet.
synced: Every number on this site is read from the engine's own repository by a script. Last sync {{syncedAt}}, engine commit

## site-home

title: Press Start · A game engine an AI can build in, and prove.
description: Press Start is a game engine built around Bevy that you and your AI build games in: scenes as documents, a fixed tick, exact replays, and every feature measured against a reference tool.
kicker: Player 1: you. Player 2: your AI.
headline: A game engine an AI can build in, and prove.
cta: Join the beta | Explore the engine
small: Private beta. Version 1 is not public yet.

Your AI writes the game as documents. Press Start runs it on a fixed tick and checks every frame against a
reference, so you can see what it built, and trust it. The code stays yours: real Rust, built around Bevy.

## site-handheld

brand: Press Start
sticker: same seed · same game
splash: PRESS START
start: Start
select: Select
start-label: Replay the same seed
select-label: Try another seed
seed: seed
tick: tick
run: run
screen-aria: The illustrated game at tick
verdict-first: Run 1 recorded. Press START to play it again.
verdict-match: Same checksum as run 1. Same game.
verdict-seed: New seed, new game, new checksum.
stamp-first: rec
stamp-seed: new
stamp-match: = run 1
caption: An illustration drawn in your browser, not engine output: one seed, a fixed tick, a checksum of the whole state every tick. Press START and the replay lands on the same checksum.

## site-values

label: Four things nobody else ships

1. **Deterministic.** Same seed, same inputs, same game. Every time.
2. **All cores.** Systems run in parallel, and the answer stays the same.
3. **Measured.** Held against {{oracles}} reference tools the industry trusts.
4. **Yours.** A game is real Rust on Bevy. You own the code.

## site-features

kicker: What it is like
headline: Made for building games with an AI.
today: Today
road: On the road
states: today | today | today | today | road | road
verbs: query · the complete state | command · one journaled write path | capture · the same picture, every time | control · pause, step, seed, checksum
docs: scene | material | rig | ui
ticks: run 1 | run 2 | the bug at tick 340
pixels: the golden | this run | 0 px differ
modes: Plan | Manual | Full access
offline: no account · no connection

An engine is usually a pile of menus a human clicks. This one answers questions, keeps every change as data,
and tells you exactly what is built and what is not.

1. **Talk to your game.** Your own AI asks the running game questions and gets complete answers. Four verbs:
   query, command, capture, control.
2. **Everything is a document.** Scenes, materials, rigs and UI are files with one exact byte form. Your AI reads
   and writes them, and so can you.
3. **Bugs that stay put.** Same seed and same inputs give the same frame, byte for byte, on the same build. The
   bug at tick 340 is one you can hand to someone else.
4. **Pictures are tests.** Every picture a test draws is compared with a golden a human accepted. A tool can
   propose one. It can never accept one.
5. **A normal editor, with an AI beside it.** Place objects and edit scenes by hand, or let an agent plan, propose
   or build, and keep every change one undo away.
6. **No login. Works offline.** Accounts will be optional. The engine, the editor and the launcher will work
   without one, and without a connection.

## site-scores

kicker: Built today
headline: The engine's high scores.
board: hi-score · synced from the engine
score: score
name: name

Every number here is read from the engine's own repository by a script. Nobody types them in, and the misses
are on the board too.

1. {{crates}} | engine crates | of our own Rust, built around Bevy
2. {{oracles}} | reference tools | the industry's own tools we measure against
3. {{goldens.accepted}} | accepted pictures | goldens a human accepted, shot on one reference card
4. {{catalog.built}} | features built | of {{catalog.total}} on our checklist of everything an engine needs
5. {{catalog.partial}} | partly built | each with its missing parts named: we count the misses

## site-road

kicker: The road
headline: Where we are, honestly.
states: cleared | now | next | ahead
here: you are here
cta: See the whole road

Press Start is not public yet. This is the road to version 1, in order, each stage with its state today. No
dates: we do not publish dates we have not earned.

1. cleared | Team Fights, stage 1 | The first game on the engine. | A bot-vs-bot team shooter made of primitives, on our own map, built on the engine's crates under the same process as the engine. The founder played it; his findings are the first work of stage 2.
2. now | The licence wave | Rewriting what came from restricted sources. | Every module that was transcribed from a restricted engine source is deleted and rewritten from public papers and API pages, with a similarity gate that refuses a rewrite still carrying the deleted text. It is the one hard dependency of a public release.
3. next | The editor wave | Everything built, reachable in the editor. | New game, edit by hand and by AI, play: an editor window and a game window, and an agent panel on the same wire. No new engine feature, only the whole normal flow.
4. ahead | The repository split | The engine as its own repository. | The engine is published as its own repository on a fresh history, cleaned for the public. It runs after the licence wave.
5. ahead | The version 1 cut | A launcher, templates, save, build, Windows export. | A launcher, a new project from a template, save, build and Windows export. No account required, and it works fully offline.
6. ahead | Texture codecs | The texture codec suite. | The texture codec suite comes after the editor.
7. now | Speed and memory | The big pain points, paid down. | Speed measured against each reference and paid down to parity where it hurts most, with memory held to its own gate. The memory work is already under way.
8. ahead | Version 1, public | One gate, then the public release. | One full release gate over a frozen tree, then version 1 public under our own source-available licence, and a new version every two weeks after it.

## site-news

kicker: Patch notes
headline: What landed lately.
cta: All patch notes
now-label: in progress
now: The licence wave and the memory work are under way.

1. 2026-11-03 | Road | The editor wave's first row | The editor must open any project: the first piece of the editor wave is written down.
2. 2026-11-02 | Road | The repository split, planned | The engine will be published as its own repository on a fresh history, after the licence wave.
3. 2026-10-30 | Game | Team Fights, stage 1, is done | The first game on the engine, a bot-vs-bot team shooter made of primitives on our own map, Sandcourt. The founder played it.
4. 2026-10-26 | Engine | Cleanup 2.0 closed | Every finding of the engine's own quality gate, fixed at the root.
5. 2026-10-25 | Engine | First-person control | The pieces a first-person shooter needed: first-person control, and AI that moves to a point over the navmesh.

## site-involved

kicker: Get involved
headline: Come build with us.

The repository goes public with version 1, under a source-available licence. Until then, the beta and Discord are the way in.

1. Join the beta | The way in today. One email when your invite is ready, nothing else unless you ask. | Join the beta
2. Say hello on Discord | Ask questions, follow along and meet the people building it. | Join the Discord
3. Follow the road | Every stage to version 1 with its state, and the patch notes as things land. | See the road
4. Read how it works | The engine one strength at a time, in plain words. | Explore the engine

## site-start

headline: Press Start
cta: Join the beta
alt: Explore the engine

You bring the game and your AI. We bring an engine that keeps score honestly. Join the beta and we will email you
when your invite is ready.

## site-placeholder

lock: level locked
doors: Open now

## site-not-found

title: Not found · Press Start
description: There is nothing at this address.
kicker: 404
headline: Tick not found.
cta: Back to the start
diff: expected · a page | got · nothing at this address | first difference · this URL

There is nothing at this address. The page you want is probably on the one road we have.

## page-engine

title: The engine · Press Start
description: What Press Start is: a game engine built around Bevy, every system a document plus a plugin, built so you and your AI can prove what you made.
kicker: The engine
headline: Built around Bevy, written as documents.

{{crates}} engine crates cover what Bevy leaves out: terrain, shaders, physics, animation, UI, navigation,
networking and more. Every system is a document plus a plugin, checked before the app exists, so your AI can read
it, change it and prove it.

## site-engine-stack

label: the stack
layers: Your game · a Rust workspace you own | Press Start · {{crates}} engine crates | Bevy · the ECS, renderer and app underneath

## site-engine-loop

kicker: How a game is made here
headline: Write it. Run it. Prove it. Own it.

1. Write | A scene is a base plus patches. A field is set by name, never by a click, and every document is checked before the game runs.
2. Run | One seed, a fixed tick, no clock. Tick 128 is the same tick on every run, driven by a recorded input tape.
3. Prove | Numbers first, then pixels: query the state and its checksum, capture the frame, compare it with its golden.
4. Own | A game is a Rust workspace on Bevy. It opens, reads and plays without us.

## site-engine-strengths

kicker: Five strengths
headline: What it is good at.
cta: Read more

## site-engine-verbs

kicker: The AI surface
headline: Four verbs, one door.

The engine exposes data and verbs. You bring your own AI, and it works through the same door a player uses.

1. query | Ask the running game about its declared state, and get a complete answer.
2. command | Change it through journaled, tick-stamped commands: the one write path.
3. capture | Take pictures from a deterministic photo booth: the same frame, every time.
4. control | Pause, step, seed, checksum, save, load, and inject input through the player's own funnel.

## site-engine-caveats

kicker: Stated plainly
headline: What is not there yet.

1. Determinism holds on the same build and the same platform. A cross-machine claim waits for its own gate.
2. No multi-core speed-up figure has been measured. Speed is recorded per subsystem against each reference, misses included.
3. {{catalog.built}} of {{catalog.total}} checklist features are built to every clause; {{catalog.partial}} are partly built, with the missing parts named.
4. The editor, the launcher and Windows export are on the road to version 1. Version 1 is not public yet.
5. The source-available licence is drafted, not final.

## page-engine-determinism

title: Determinism · Press Start
description: Same seed, same inputs, same game, on the same build and the same platform.
kicker: Deterministic
headline: Same seed, same inputs, same game.

One seed, no wall clock, no sleep, a fixed tick and a checksum at the boundary. Replay is exact on the same build
and the same platform, so a test is a fact and a bug can be handed from one person to another. This page is being
built.

## page-engine-parallel

title: All cores · Press Start
description: Systems run in parallel on every core, and the answer stays the same: how Press Start keeps a parallel game deterministic.
kicker: All cores
headline: All your cores, the same answer.

Bevy runs a game's systems across every core of the machine. Press Start keeps them there, and makes sure the
answer never depends on which core finished first.

## site-parallel-board

label: core board · illustration
cores: core 1 | core 2 | core 3 | core 4
systems: input | physics | navigation | animation | camera | UI | audio | VFX
gate: gate · physics before camera
caption: An illustration of the rule, not a trace from the engine: systems spread over the cores, and the two that touch the same data run in a declared order.

## site-parallel-floats

kicker: Why threads usually change the answer
headline: Add the same numbers in another order.
numbers: 0.1 | 0.2 | 0.3
left: left to right
right: right to left
equal: equal
differ: not equal
live: Plain floating-point math, the way every CPU does it.

Computers round after every addition, so the order of a sum matters down to the last bit. When threads finish in a
different order on every run, the sum comes out a little different every run: the game is still correct, and it is
no longer the same game. A replay drifts; a test flakes.

## site-parallel-rules

kicker: The rules
headline: Four rules keep the answer still.

1. **Order, or proof.** Any two systems that touch the same data run in a declared order, or their disjointness is proven in a reviewed policy file. The gate refuses an unordered pair and names both systems.
2. **Ordered sums.** Every floating-point reduction is ordered. Only work that is order-independent on the exact bits, like integer sums, counts and writes to distinct slots, runs free.
3. **No racing commands.** Parallel command buffers are banned: the order their commands apply in would depend on the thread count.
4. **Measure before switching on.** The parallel physics solver stays off until our own conformance tests measure what it does to the checksum.

## site-parallel-case

kicker: A worked case
headline: The first game, ordered at the root.

When the first game, Team Fights, was built, the gate found every pair of its systems that touched the same data
in no declared order, in the game's own systems and in the engine's. Each one was ordered at its root. None was
silenced.

## site-parallel-claims

kicker: What we do not claim
headline: The small print, in large type.

1. No multi-core speed-up figure has been measured. We pay for ordered sums on purpose: a replay that diverges is not a faster replay, it is a broken one.
2. Parallelism lives at the system scheduler, by proof. Data-parallel loops inside a system are allowed one call site at a time, and none is allowed today.
3. Same build, same platform. A cross-machine claim waits for its own gate.

## site-strength-nav

label: More strengths

## page-engine-oracles

title: Measured · Press Start
description: Every feature measured against a reference tool the industry already trusts.
kicker: Measured
headline: Measured against a reference.

{{oracles}} reference tools check the engine's subsystems: physics, navigation, UI layout, text, lighting, meshes
and more. Where we differ, the difference is written down with both numbers. Parity is the bar, not an
achievement. This page is being built.

## page-engine-ai

title: The AI surface · Press Start
description: A running game answers four verbs: query, command, capture, control.
kicker: The AI surface
headline: Your own AI, through the player's door.

A running game answers four verbs: *query*, *command*, *capture*, *control*, plus input injection. The engine
exposes data and verbs; you bring the AI. This page is being built.

## page-engine-ownership

title: Yours · Press Start
description: A game on Press Start is Rust code on Bevy that you own.
kicker: Yours
headline: The game is your code.

A game on Press Start is a Rust workspace on Bevy that opens, reads and plays without us. The source-available
licence is on the road; its terms are not final yet. This page is being built.

## page-showcase

title: Showcase · Press Start
description: Games built on Press Start, shown only through the engine's own renders.
kicker: Showcase
headline: Made with Press Start.

The first game, Team Fights, is built on the engine's crates. Its pictures appear here once the engine accepts
them.

## page-roadmap

title: Roadmap · Press Start
description: The road to version 1, in order, each stage with its state, without dates.
kicker: Roadmap
headline: The road, in order.

Press Start is not public yet. This is the road to version 1, in the founder's order, each stage with its state
today. No dates: we do not publish dates we have not earned.

## site-roadmap-decisions

kicker: Already decided
headline: The decisions you should know.

1. **Source-available, in Unreal's shape.** The repository goes public at version 1. Use and change the engine to make and ship games, with a royalty only above a revenue threshold. The rate and the threshold are set with the licence text.
2. **Nothing requires a login.** Accounts will be optional. The engine, the editor and the launcher will work fully offline.
3. **Windows first.** Other platforms come after version 1.
4. **No servers of ours inside your game.** No relay, lobby or matchmaker hosted by us: a game's online play is its own dedicated server.

## site-roadmap-beta

headline: What "beta" means.

You get an invitation when version 1 opens, and earlier builds if we open a private preview. We email you about
access and major releases only.

## page-learn

title: Learn · Press Start
description: How a game is built on Press Start.
kicker: Learn
headline: Build a game.

Guides will live here. The shape of a game today: documents, a fixed tick, a reference to prove against, and four
verbs for your AI.

## page-news

title: Patch notes · Press Start
description: What landed in Press Start lately, and what is under way.
kicker: News
headline: Patch notes.

What landed in the engine lately, newest first, read from the engine's own records. Version notes start with
version 1.

## page-licensing

title: Licensing · Press Start
description: How Press Start will be licensed.
kicker: Licensing
headline: Source-available, with version 1.

The plan is a source-available licence in Unreal's shape: free to make and ship games, a royalty only above a
revenue threshold, and an optional login that nothing requires. The terms are not final yet.

## page-about

title: About · Press Start
description: The mission and the method behind Press Start.
kicker: About
headline: Tests, not eyes.

Press Start is a game engine built around Bevy, made so that you and your AI can build a game and prove it. Every
feature can fail a test; the misses are counted and published.

## page-community

title: Community · Press Start
description: Where to find the people building Press Start.
kicker: Community
headline: Come build with us.

The way in today is the beta, and the conversation is on Discord. Both doors are below.

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
