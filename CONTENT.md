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
now served under /beta. Layout L1 "Cinematic" (client/src/site/DESIGN.md). Copy follows the press-start-website
skill: present tense only for what is true today, no dates.)*

wordmark: Press Start
skip: Skip to content
nav-label: Site
menu-label: Site menu
menu: Menu
nav: Engine | Showcase | Roadmap | Learn | News | Licensing | About | Community
cta: Join the beta

## site-footer

label: Footer
legal: Privacy | Terms | Cookies
line: A game engine built around Bevy. Version 1 is not public yet.
columns: Engine | Site | Legal
beta: The beta
discord: Discord
discord-line: Talk to the people building the engine.

## site-home

title: Press Start · A game engine an AI can build in, and prove.
description: Press Start is a game engine built around Bevy whose first user is an AI agent: scenes, laws and assets as documents, deterministic replay, and every feature measured against a reference tool.
kicker: Private beta · built around Bevy
headline: A game engine an AI can build in, and prove.
cta: Join the beta | See how it works
small: Version 1 is not public yet. Windows first.
screen-label: the replay · run A and run B
legend: run A | run B, traced over run A
hud: tick | run A | run B | checksums match
caption: An illustration drawn live in your browser, not engine output: one seed, no clock, a fixed tick. Run B is traced over run A from the same seed, and the two never come apart.

Your agent builds the game. The engine shows it was right: same seed, same inputs, same game, every time.

## site-audiences

label: Who it is for
headline: One engine. Four ways in.
tabs-label: Choose who you are
channel: CH

## site-audience-studios

tab: Studios
headline: Flaky tests and unrepeatable bugs, gone by design.
points: Same seed, same game | A failing test fails the same way every time | Pictures checked against accepted goldens

Every random stream comes from one seed. Game logic never reads the clock. The world steps on a fixed tick. So the
bug at tick 340 is the same tick on every run, and anyone on the team, or any agent, can open it.

## site-audience-solo

tab: Solo developers
headline: Build with an agent that can check its own work.
points: Scenes, laws and assets as documents | Answers in numbers first, then pixels | The game is a Rust codebase you own

Your agent writes the scene as data, runs it, and reads back numbers and pictures instead of guessing from a
screenshot. You direct. It builds. The engine says whether it is right.

## site-audience-tooling

tab: AI tooling
headline: An engine that answers questions instead of being screenshotted.
points: Query: the state as data | Capture: frames from a deterministic booth | Control: pause, step, seed, checksum

A running game answers four verbs: query, command, capture and control, plus input through the player's own door.
Bring your own agent. The engine exposes data and verbs, not a model.

## site-audience-bevy

tab: Bevy developers
headline: The missing pieces, built once and measured.
points: Built around Bevy 0.19 | {{crates}} engine crates | {{oracles}} reference tools to match

Terrain, navigation, physics, animation, UI layout, networking and more, as engine crates around Bevy. Each system
is a Bevy plugin plus a document format, held against a reference tool. A game stays a normal Rust codebase.

## site-strengths

label: What it is good at
headline: Four things you can hold us to.
more: How it works

## site-strength-determinism

word: Same game.
headline: Same seed, same inputs, same game.
scope: Today: the same build on the same platform.
screen: two runs, one checksum
head: tick | run A | run B | result
third: run C · another seed
pass: PASS
fail: FAIL

One seed you can write down. No clock, no sleep, a fixed tick. Two runs give the same frame, byte for byte, so a
replay is exact, a test is a fact, and a bug can be handed from one agent to another.

## site-strength-parallel

word: Every core.
headline: All your cores, the same answer.
scope: No speed-up figure is claimed yet. Parallel is at the scheduler, by proof.
screen: eight cores, one answer
lanes: input · physics · navigation · animation · camera · UI · audio · VFX
core: core
gate: same data · order declared
readout: state checksum
cores: 8 cores | 2 cores

Bevy runs your systems across every core. Our gate refuses two systems that touch the same data in no declared
order, and names both. Float sums are ordered. So the answer never depends on how many cores ran it.

## site-strength-oracles

word: Measured.
headline: Held against the tools you already trust.
scope: Parity is the bar, and not every feature meets it yet. The misses are recorded.
screen: held against · {{oracles}} reference tools
rows: Physics = Jolt · PhysX | Navigation = Recast | UI layout = Chromium · Yoga | Text = HarfBuzz | Lighting = Mitsuba | Meshes = Blender · Manifold
diff: where we differ: both numbers, written down

We do not grade our own homework. Each subsystem is checked against the tool the industry already trusts. Where we
differ, the difference is a recorded row with both numbers and a reason, never a hidden tolerance.

## site-strength-ownership

word: Yours.
headline: The game is your code.
scope: The licence text is not final; it is published with version 1.
screen: what a game is made of
layers: Your game = a Rust workspace, your repository | Press Start = {{crates}} engine crates | Bevy = 0.19, open source

A game on Press Start is a Rust workspace on Bevy that opens, reads and runs without us. No black box: the engine's
source goes public with version 1, under a source-available licence.

## site-verbs

label: The AI surface
headline: The game answers back.
verbs: Query = Ask for any state. Get data, not a screenshot. | Command = Change the world through one write path. | Capture = Take the frame from a deterministic photo booth. | Control = Pause, step, seed, checksum, inject input.
link: Your own AI, through the player's door

## site-showcase

label: Shot by the engine
headline: Every frame here is a test.
first-title: Team Fights
first-kicker: The first game
first-body: A team shooter made of primitives, on our own map, built on the engine's crates. Its frames join this strip when the engine accepts them.
golden: accepted golden
strip-label: Accepted goldens from the engine's tests

These are accepted goldens: frames the engine renders in its own tests, compared pixel by pixel, and accepted by a
human in a reviewed commit. Evidence, not glamour shots: {{goldens.accepted}} of them so far.

## site-numbers

label: In numbers
headline: Counted, never typed.
tiles: {{crates}} = engine crates | {{catalog.built}} = of {{catalog.total}} things built | {{oracles}} = reference tools | {{goldens.accepted}} = accepted goldens
bar-label: The checklist of everything an engine needs
bar-legend: built | partly built | skipped | not yet

Every number here is counted by a script against the engine's own repository. A thing counts as built only when a
test holds every clause of it, and we publish the misses: {{catalog.partial}} more are partly built.

## site-road

label: Where we are, honestly
headline: The road, in order. No dates.
now: now
stops: Now = The first game, Team Fights, is built on the engine and played. The engine is being readied for the public. | Next = The editor: everything built, reachable by hand and by agent, in one window. | Version 1 = A launcher, a new project from a template, save, build, Windows export. | Then = The public repository under our own licence, and a version every two weeks.
link: The whole road

## site-licence

kicker: Licensing
headline: Free to make and ship. Yours to read.
small: The licence text, the rate and the threshold are not final. They are published with version 1.
cta: Join the beta | Read about licensing
end: Ready, player one?

Press Start will be source-available: use and modify the engine to make and ship games, free below a revenue
threshold, with a royalty above it. Nothing will require a login, and the engine works offline.

## site-not-found

title: Not found · Press Start
description: There is nothing at this address.
kicker: 404
headline: Tick not found.
cta: Back to the start

There is nothing at this address.

## site-placeholder

label: This page is being built
meanwhile: Meanwhile | Read about the engine | Join the beta
next: Next

## page-engine

title: The engine · Press Start
description: What Press Start is: a game engine where every system is a document plus a plugin.
kicker: The engine
headline: Built around Bevy, written as documents.
loop-label: How the engine works
loop: Document = Scenes, laws and assets are files an agent can read and write. | Plugin = Each system is a Bevy plugin that reads its document, validated before the app exists. | World = The game steps on a fixed tick from one seed. | Agent = Your agent asks, edits, looks and steps through four verbs, then writes the next document.
strengths-label: Five strengths
strengths-headline: What the engine is good at, one page each.
numbers-label: The engine in numbers
road-label: Not there yet
road-headline: What the engine does not do yet.
road: The editor, a window to place objects and edit scenes by hand, is on the road. | The launcher, a new project from a template, save, build and Windows export arrive with version 1. | The source-available licence and the public repository arrive with version 1.
road-link: The road, in order

{{crates}} engine crates cover what Bevy leaves out. Every system is a document plus a plugin, validated before
the app exists, and every one of them can fail a test.

## page-engine-determinism

title: Determinism · Press Start
description: Same seed, same inputs, same game, on the same build and the same platform.
kicker: Determinism
headline: Same seed, same inputs, same game.
lab-label: The replay, tick by tick
lab-headline: Drag through the run.
lab-intro: Run A and run B start from the same seed. Run C starts from the same seed too, with one different input at tick 140: the ball is kicked the other way.
lab-tick: Tick
lab-play: Play the run
lab-pause: Pause
lab-runc: Show run C
lab-head: tick | run A | run B | run C
lab-search: Locating the first difference
lab-check: check tick
lab-same: same
lab-differs: differs
lab-found: first differing tick
lab-caption: An illustration drawn live in your browser, not engine output. The search runs here, step by step, the way the engine's replay names the first tick where two runs part.
bans-label: The rules
bans-headline: Four things game logic may not do.
bans: Read the clock = The time of day differs on every run. Game logic gets the fixed tick instead. | Sleep = A pause lasts as long as the machine decides. The tick does not wait. | Roll unseeded dice = Every random stream comes from one seed you can write down. | Trust a hashed order = A container whose order the process decides is the classic replay killer.
bans-note: These are refused when the code is compiled, not caught in review.
tape-label: The replay
tape-headline: A replay names the build it was made on.
tape-fields: seed | starting snapshot | input tape | command journal
tape-refusal: refused: build differs
scope-label: The honest scope
scope: Same build, same platform. A claim across machines waits for its own gate.
next: Next: all your cores, the same answer

One seed, no wall clock, no sleep, a fixed tick and a checksum at the boundary. The same seed and the same inputs
give the same frame, byte for byte. So a test is a fact, a replay is exact, and the bug at tick 340 is a tick you can
hand to someone else.

A replay is a seed, a starting snapshot, an input tape and a command journal. Its header names the build, the
profile and the features it was made with. Loading it anywhere else is refused, naming the first field that
differs, instead of quietly drifting apart at tick 3.

## page-engine-parallel

title: Parallel · Press Start
description: Systems run in parallel, and the answer stays the same.
kicker: Parallel
headline: All your cores, the same answer.

Any two systems that touch the same data are ordered, or proven disjoint; every floating-point reduction is
ordered. No speed-up figure is claimed. This page is a placeholder.

## page-engine-oracles

title: Oracles · Press Start
description: Every feature measured against a reference tool the industry already trusts.
kicker: Oracles
headline: Measured against a reference.

{{oracles}} reference tools check the engine's subsystems. Parity is the bar, not an achievement. This page is a
placeholder.

## page-engine-ai

title: The AI surface · Press Start
description: A running game answers four verbs: query, command, capture, control.
kicker: The AI surface
headline: Your own AI, through the player's door.

A running game answers four verbs: *query*, *command*, *capture*, *control*, plus input injection. The engine
exposes data and verbs; you bring the agent. This page is a placeholder.

## page-engine-ownership

title: Ownership · Press Start
description: A game on Press Start is your own Rust code.
kicker: Ownership
headline: The game is your code.

A game on Press Start is a Rust workspace you own. The source-available licence is on the road; its terms are not
written yet. This page is a placeholder.

## page-showcase

title: Showcase · Press Start
description: Games built on Press Start, shown only through the engine's own renders.
kicker: Showcase
headline: Made with Press Start.

The first game, Team Fights, is built on the engine's crates. Its pictures appear here once the engine accepts
them.

## page-roadmap

title: Roadmap · Press Start
description: The road to version 1, in order, without dates.
kicker: Roadmap
headline: The road, in order.

The road in order, each stage with its state, re-synced from the engine. Until this page is built, the beta's page
carries it: [the road](/beta/#roadmap).

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

The plan is a source-available licence and an optional login that nothing requires. The terms are not written yet.

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

The community links will be listed here. Today, the way in is the beta: [join the beta](/beta/).

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
