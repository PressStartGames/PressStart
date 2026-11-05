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
now served under /beta. Layout L4 "Feature tour" (plans/main-site.md phase 2). Copy follows the
press-start-website skill: present tense only for what is true today, no dates.)*

wordmark: Press Start
skip: Skip to content
nav-label: Site
nav: Engine | Showcase | Roadmap | Learn | News | Licensing | About | Community
cta: Join the beta
menu: Menu

## site-footer

label: Footer
legal: Privacy | Terms | Cookies
line: A game engine for people and the AI agents they work with. Version 1 is not public yet.
columns: The engine | The project | Studio
engine-links: Overview | Determinism | Parallel | Oracles | The AI surface | Ownership
project-links: Showcase | Roadmap | Learn | News
studio-links: About | Licensing | Community | The beta
discord: Join us on Discord
discord-note: Talk to the people building Press Start, and to each other.
signoff: player 1 · ready

## site-home

title: Press Start · A game engine an AI can build in, and prove.
description: Press Start is a game engine written in Rust whose first user is an AI agent: scenes as documents, the same game on every run, every core with the same answer, every picture checked. A tour, one capability at a time.
kicker: A game engine written in Rust
headline: A game engine an AI can build in, and prove.
cta: Join the beta | Take the tour
small: Private beta. Version 1 is not public yet. Windows first.
select-label: select stage
select-readout: world 1
select-prompt: press start

Your agent writes the game as documents, plays it on a fixed tick and checks every picture against one a person
accepted. You direct it, and every step leaves proof you can read.

## site-tour

label: The tour
index-label: Tour index
stage-word: stage
more: Read more
illustration: illustration · drawn in your browser
verbatim: verbatim from the engine
trimmed: from the engine · imports trimmed
engine-word: engine
seed-word: seed
pass: PASS
fail: FAIL

## site-stage-documents

kicker: Write it as data
teaser: Scenes are files, not clicks.
headline: Scenes are files, not clicks.
tab-picture: What it means
tab-code: The request
layers: base · Health 10 / 10 · Tint grey · Name crate | patch 0 · Tint blue | patch 1 · Tint gold · Health max 25 · Name removed
answer-label: the engine's answer
answer: Tint · gold · patch 1 | Health.max · 25 · patch 1 | Health.current · 10 · base | Name · removed · patch 1
sample-caption: An agent asks which patch set each value. The request is copied verbatim from the engine's scene guide, where a test sends it through the real wire and checks this answer.

In most engines a level lives inside the editor, and the only way to change it is to click. In Press Start every
scene, material, rig and menu is a plain document an agent can read and write. A change is a small patch laid on
top, never a rewrite.

The engine checks every document before the game starts, and a refusal names the wrong value and how to fix it.
Ask which patch set a value, and you get an answer, not a guess.

## site-sample-scene

sample-commit: a79664d08601a850a3d9f99730875a05f6f628c3
sample-source: docs/scene-agent.md
sample-lines: 61-81

```json
{
  "method": "pressstart.query.scene_provenance",
  "params": {
    "token": "<session token>",
    "scene": {
      "version": 1,
      "entities": {
        "1": { "components": { "Health": { "current": 10, "max": 10 }, "Tint": "grey" } },
        "2": { "components": { "Name": "crate" }, "parent": 1 }
      }
    },
    "chain": [
      { "ops": [ { "op": "set_component", "entity": 1, "type_name": "Tint", "value": "blue" } ] },
      { "ops": [
        { "op": "set_component", "entity": 1, "type_name": "Tint", "value": "gold" },
        { "op": "set_component", "entity": 1, "type_name": "Health", "value": { "current": 10, "max": 25 } },
        { "op": "remove_component", "entity": 2, "type_name": "Name" }
      ] }
    ]
  }
}
```

## site-stage-determinism

kicker: Same seed, same game
teaser: Run it twice, get the same game.
headline: Run it twice. Get the same game.
small: Today: the same build on the same platform.
modes: Same inputs | Change one input at tick 80
heads: tick | run A | run B
verdict-pass: every line matches
verdict-fail: first difference at tick
scrub-label: Tick
caption: A small simulation drawn in your browser: one seed, a fixed tick, no clock, and a checksum of the whole state every 40 ticks. The engine's own replay checks its checksums the same way.

Most engines play a slightly different game on every run: the frame rate nudges the physics and the dice are
rolled fresh. Press Start rolls every die from one seed you can write down, never reads the clock, and steps the
world on a fixed tick.

Same seed, same inputs, same frame. So a test is a fact, a replay is exact, and "the bug at tick 340" is something
one agent can hand to another.

## site-stage-parallel

kicker: Every core, one answer
teaser: All your cores, the same answer.
headline: All your cores. The same answer.
cores: 8 cores | 4 cores | 2 cores
lanes: input · physics · navigation · animation · camera · UI · audio · VFX
core-word: core
gate: same data · order declared
readout: state checksum
same: same
small: We have not measured a speed-up yet, so we do not quote one.
caption: An illustration: the same systems dealt onto 8, 4 or 2 cores. The checksum comes from the browser simulation above, and it does not move.

A game's systems run across every core of the machine, and Press Start keeps it that way: nothing is slowed to
one thread to make it repeatable.

When two systems touch the same data, the engine insists on an order and refuses to build until one is declared,
naming both. Sums are added in a fixed order. So the game you replay does not depend on how many cores ran it.

## site-stage-goldens

kicker: Pictures are tests
teaser: Every picture is checked, pixel by pixel.
headline: Every picture is checked, pixel by pixel.
wipe-label: Compare this run with the golden
candidate: this run
golden: the golden
verdict: PASS · 0 px differ
steps: shot on one reference graphics card | compared pixel by pixel | accepted by a person, in a reviewed commit
strip-label: the same character, three ticks
caption: Accepted goldens from the engine's 2D rig tests, shown at their own pixels and scaled without smoothing. The engine has {{goldens.accepted}} accepted goldens today.

When the engine draws something in a test, the frame is compared with a golden: a picture a person looked at and
accepted. If the picture changes, the test fails and leaves the new frame beside the old one for a person to judge.

A tool can suggest a golden. It can never accept one.

## site-stage-oracles

kicker: Held to a reference
teaser: Measured against the tools you trust.
headline: Measured against the tools you already trust.
ours: Press Start
theirs: the reference
pairs: Physics = Jolt · PhysX | Navigation = Recast | UI layout = Chromium · Yoga | Text shaping = HarfBuzz | Lighting = Mitsuba | Meshes = Blender · Manifold
count: {{oracles}} reference tools in all
small: Parity is the bar. Not every feature meets it yet, and the misses are recorded.
caption: Reference tools are named as plain text. They are compared against and never ship in the engine.

We do not grade our own homework. Each part of the engine is held against the tool the industry already relies on
for it, on the same scenes.

Where our answer differs, the difference is written down with both numbers and a reason, and the disagreement is
settled toward the reference.

## site-stage-ai

kicker: The game answers back
teaser: Four verbs any agent can use.
headline: The game answers back.
verbs: query = Ask for the state, and get a complete answer. | command = Change it through the one door, journaled and stamped with its tick. | capture = Take a picture from a fixed photo booth. | control = Pause, step, seed, checksum, save, load.
screen-label: four verbs
tick-word: tick
journal-word: journal
captured: captured
query-out: {bodies} bodies · ball at {x}, {y} · score {a} : {b}
command-out: ball placed at the centre · {journal} #{n}
capture-out: {captured} · id {id}
control-out: stepped to {tick} {t} · checksum {sum}
caption: An illustration: the engine's four verbs played on the small browser simulation. The verbs are the engine's; the game is a sketch.

An agent cannot squint at a screenshot and know the game is right. So a running Press Start game answers four
verbs: *query*, *command*, *capture* and *control*.

Your agent asks for the state, changes it through one door, takes a picture and steps time, on the same surface the
engine's own tests use. You bring the AI. The engine brings data and verbs.

## site-stage-ownership

kicker: Your code
teaser: Plain Rust, and it is yours.
headline: Your game is your code.
small: On the road: the public repository under our own source-available licence, at version 1.
sample-caption: One of the engine's own tests, imports trimmed: a fixed-step app runs three ticks a frame, so ten frames are thirty ticks.

A game on Press Start is a normal Rust codebase, and it is yours. {{crates}} engine crates bring what a game
needs: terrain, physics, animation, UI, navigation, networking and more.

Nothing hides behind a menu. The engine is tested the way your game will be: by code that runs, steps and asserts.

## site-sample-test

sample-commit: 45aeffd2a2ecc3b3049819151abfc1c1343fb2aa
sample-source: docs/00-build-a-game/test-app.md
sample-lines: 35-55

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

## site-built

kicker: Built today
teaser: Every feature counted, misses included.
headline: What is built, counted by a tool.
legend: built | partly there | not yet
of: of
areas: world = World building · scenes, terrain, 2D, navigation | simulation = Simulation · physics, input, cameras | rendering = Rendering · lighting, shaders, textures | asset-creation = Asset creation · modeling, rigging, animation | game-services = Game services · audio, UI, save, localisation | networking-export = Reach · networking, export, platforms | missing-domains = Beyond the usual · what no engine ships, written down anyway

We keep a checklist of everything a full game engine needs: {{catalog.total}} features, from terrain to crash
reports. A feature counts as built only when a test holds every line of its description, and the tally is made by a
tool, never by hand.

Today {{catalog.built}} are built and {{catalog.partial}} are partly there, with the missing parts named. We publish
the misses.

## site-road

kicker: The road
teaser: Where we are, with no dates.
headline: Where we are.
stops: Now = The engine and its first game, Team Fights, built and tested in private. | Version 1 = A launcher, a new project from a template, save, build, Windows export. No account needed, and it works offline. | Then = The big performance pain points, one full release gate, and the public repository under our own source-available licence. | After = A version every two weeks, the remaining gaps, more platforms.
now: you are here
join-title: Want in early?
join-body: Join the beta and we email you when version 1 opens. Nothing else, unless you ask.
join-cta: Join the beta
roadmap-link: The whole road

Press Start is not public yet. This is the road to version 1, in order. We publish dates only when we have earned
them.

## site-engine-steps

kicker: How it works
headline: How a game is made here.
label: procedure
lit: 12-14 | 16-17 | 19 | 20
sample-caption: One of the engine's own tests, from its guide to a test app, imports trimmed.

1. **Write the scene as data.** A scene is a base plus patches. A field is set by name, never by a click.
2. **Check it before it runs.** Every document is validated before the app exists. A refusal names the value and
   the fix.
3. **Run it on a fixed tick.** A tick is the same tick on every run, driven by a recorded input tape.
4. **Look with numbers, then pixels.** Ask for the state and its checksum, capture the frame, compare it with its
   golden.

## site-engine-strengths

kicker: Five strengths
headline: Five things it does differently.
cards: engine-determinism = Same seed, same game = One seed, a fixed tick and no clock, so a replay is exact. | engine-parallel = Every core, one answer = Systems run in parallel and conflicts are ordered, so the answer never moves. | engine-oracles = Held to a reference = Each part is measured against the tool the industry already trusts. | engine-ai = The game answers back = Query, command, capture, control: four verbs for your own AI. | engine-ownership = Your code = A game is a normal Rust codebase, and it is yours.

## site-engine-box

kicker: In the box
headline: What a game needs, in the box.
families: Scenes = documents, prefabs, patches | Assets = meshes, textures, materials, glTF | Rendering = shaders, sprites, terrain | Physics = bodies, colliders, materials | Characters = controllers, animation, rigs | Camera = rigs and shake | Input = actions, bindings, one input funnel | Interface = layouts, menus, localisation | Audio = events and buses | Effects = particles | Navigation and AI = navmesh, crowds, behaviour trees | Save and network = save slots, networking as a document

{{crates}} engine crates, in families. Each system is a document plus a plugin: the document holds the data
and its rules, the plugin puts it in the app.

## site-engine-numbers

label: The engine in numbers
tiles: {{crates}} = engine crates | {{catalog.built}} = features built, of {{catalog.total}} | {{oracles}} = reference tools | {{goldens.accepted}} = accepted goldens
synced: synced from the engine at commit

## site-ai-verbs

kicker: Four verbs
headline: One surface for people, tests and agents.
details: query = Boundary state, schemas, the registry of what is saved and checksummed, every tool's manifest. A complete answer, or a loud refusal. | command = The one write path. Commands are declared per tool; an undeclared command is refused, never quietly run. Each one is journaled and stamped with its tick. | capture = Addressed pictures from a deterministic photo booth on one reference card. A turntable is a capture sequence: open the model and rotate it. | control = Pause, step any number of ticks, seed, checksum now, save, load, and input injected through the same funnel a player's input takes.
sample-caption: The command an agent sends to place a prefab in a scene, verbatim from the engine's scene guide.

## site-sample-command

sample-commit: a79664d08601a850a3d9f99730875a05f6f628c3
sample-source: docs/scene-agent.md
sample-lines: 251-259

```json
{
  "method": "pressstart.command.apply",
  "params": {
    "token": "<session token>",
    "issuer": "agent:me",
    "command": "spawn_prefab",
    "payload": { "doc": "main.json", "prefab": "crate" }
  }
}
```

## site-ai-manifest

kicker: Ask it
headline: Ask it what it can do.

Every tool lists its commands in a manifest. A command with no manifest entry fails the tool's build, and so does
an entry with no command behind it. So "what can this engine do?" is a question with a complete answer, never a
guess.

## site-ai-door

kicker: One door
headline: The door stays at your desk.

The wire is a development tool. A shipped game never carries it, so the verbs your agent uses while you build are
not a way into your players' machines.

## site-ai-road

kicker: On the road
headline: With the editor: a chat beside the game.

The editor is the next big stage. The plan is a normal editor window and game window, with one chat beside them in
three modes. Planning reads and ends in a plan written in your words. Manual proposes and waits for your yes. Full
access builds, while a second agent judges the result against the plan.

Every change, by a click or by an agent, will be one undo away.

## site-stub

screen-label: stage locked
screen-line: under construction
meanwhile: Meanwhile, the tour covers it
tour: Take the tour
home: Back to the start

## site-not-found

title: Not found · Press Start
description: There is nothing at this address.
kicker: 404
headline: Tick not found.
cta: Back to the start
screen: continue?

There is nothing at this address. The tour starts at the beginning.

## page-engine

title: The engine · Press Start
description: What Press Start is: a game engine written in Rust, every system a document plus a plugin, checked before the game runs.
kicker: The engine
headline: An engine written as documents.

Press Start is a game engine written in Rust, with an AI agent as its first user. Every system is a document
plus a plugin, checked before the app exists, and every feature can fail a test.

## page-engine-determinism

title: Determinism · Press Start
description: Same seed, same inputs, same game, on the same build and the same platform.
kicker: Determinism
headline: Same seed, same inputs, same game.

One seed, no wall clock, no sleep, a fixed tick and a checksum of the state. A replay is exact on the same build
and the same platform. The full page is being written; the tour shows it working today.

## page-engine-parallel

title: Parallel · Press Start
description: Systems run in parallel, and the answer stays the same.
kicker: Parallel
headline: All your cores, the same answer.

Any two systems that touch the same data are ordered, or proven not to collide; every floating-point sum is added in
a fixed order. No speed-up figure is claimed. The full page is being written; the tour shows it today.

## page-engine-oracles

title: Oracles · Press Start
description: Every feature measured against a reference tool the industry already trusts.
kicker: Oracles
headline: Measured against a reference.

{{oracles}} reference tools check the engine's parts. Parity is the bar, not an achievement, and the misses are
recorded. The full page is being written; the tour shows the method today.

## page-engine-ai

title: The AI surface · Press Start
description: A running game answers four verbs: query, command, capture, control. You bring the AI; the engine brings data and verbs.
kicker: The AI surface
headline: Your own AI, through the player's door.

A running game answers four verbs: *query*, *command*, *capture* and *control*, with input injected through the
same funnel a player uses. The engine exposes data and verbs; you bring the agent.

## page-engine-ownership

title: Ownership · Press Start
description: A game on Press Start is plain Rust code, and it is yours.
kicker: Ownership
headline: The game is your code.

A game on Press Start is a Rust workspace, and it is yours. The source-available licence is on the road; its
terms are not written yet. The full page is being written.

## page-showcase

title: Showcase · Press Start
description: Games built on Press Start, shown only through the engine's own renders.
kicker: Showcase
headline: Made with Press Start.

The first game, Team Fights, a small team shooter made of primitives, is built on the engine's crates. Its pictures
appear here once the engine accepts them as goldens.

## page-roadmap

title: Roadmap · Press Start
description: The road to version 1, in order, without dates.
kicker: Roadmap
headline: The road, in order.

The road in order, each stage with its state, re-synced from the engine. Until this page is built, the home page
carries the short version: [the road](/#road).

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

Version notes will be posted here. Nothing is posted yet.

## page-licensing

title: Licensing · Press Start
description: How Press Start will be licensed.
kicker: Licensing
headline: Source-available, with version 1.

The plan is a source-available licence: free to make and ship games, with a royalty only above a revenue
threshold, and an optional login that nothing requires. The terms are not written yet.

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

The way in today is the beta: [join the beta](/beta/). Talk to us on Discord; the link is in the footer of every
page.

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
