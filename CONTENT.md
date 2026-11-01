# Press Start — page copy

All words on the site live here, one `## <section-id>` per section, in page order (PLAN.md §8's format:
`headline:`, `kicker:`, `cta:` lines, then Markdown body). Numbers are placeholders filled from
`client/data/counts.json` at build (written by `client/scripts/sync-engine-facts.ts` against the engine repository);
never type a count by hand. First draft from PLAN.md §3 (2026-11-01); lines in *(italics, parentheses)* are notes
to the builder, not copy. Counts on 2026-11-01: catalog 404 entries, 103 BUILT, 129 PARTIAL, 32 SKIP; 89 crates;
71 reference tools; 189 accepted goldens.

## header

wordmark: Press Start
nav: Build · Determinism · Built today · Roadmap · FAQ
cta: Join the beta

*(The pill is fixed top-right on every scroll position and scrolls to `#signup`. The bar turns translucent after
80 px of scroll.)*

## hero

kicker: Tests, not eyes.
headline: A game engine an AI can build in, and prove.
cta: Join the beta | See what is built ↓

Press Start is built on Bevy. Every scene, law and asset is a document an agent can read and write. Every run
replays to the same tick. Every feature is measured against the industry's own reference tools.

small: Private beta. Version 1 is not public yet. Windows first.

replay-label: two runs, one game
replay-runs: run A | run B
replay-placeholder: placeholder frame and checksums until the engine's booth capture lands
replay-verdict: PASS
replay-match: checksums match

*(Visual: "two runs, one game" — two panels of the same frame, `run A` / `run B`, with matching tick checksums.)*

## problem

headline: Agents can type code. They cannot see whether the game is right.

Ask an agent for a game in an engine built for human hands. It writes a script, presses play, takes a screenshot and
guesses. The frame rate changes the outcome. The random seed is unseeded. Nothing says what "right" means. Two runs
are two different games, so a test is a coin toss and a bug report is a story.

*(Visual: optional hand-drawn tangle of three strands — script → play → screenshot → guess — that straightens on
scroll.)*

## what

headline: An engine whose first user is an agent, and the human sits above it.

**The toolkit.** It covers the pieces Bevy is missing: terrain, shader graphs, VFX, physics materials, input,
animation and rigging, modeling, UI, localisation, save, navigation and AI, networking. There are {{crates}} engine
crates. Each one is a document plus a plugin.

**The wire.** A running game answers four verbs: *query* state, *command* an edit, *capture* a frame, *control*
pause, step, seed, checksum, save and load. Input is injected through the same funnel a player's goes through.

**The proof.** Every feature carries tests that can fail: pixel goldens, geometry legs and a reference tool it is
compared against.

*(Visual: Document → Plugin → Running world, the wire looping back from the world to the agent. Sources:
docs/00-build-a-game.md §1-2; docs/10-ai-layer.md §2.)*

## build

headline: How an agent builds a game here.

1. **Write the scene as data.** A scene is a base plus patches. A field is set with
   `SetField { entity, type_name, field_path, value }`, never by a click.
2. **Validate before it runs.** Every document is checked before the app exists. A refusal names the value and the
   fix.
3. **Run it on a fixed tick.** Tick 128 is the same tick on every run. Drive it from a recorded input tape through
   the player's own input funnel.
4. **Look with numbers, then pixels.** Query the camera pose, the body positions and the state checksum. Capture the
   frame on the reference card and compare it with its golden.
5. **Ask a second agent.** The builder never grades itself. A critic gets the bar and the result, never the
   reasoning.

footnote: The critic step is how the engine itself is built today. Bringing it into the author's flow is part of the
editor road.

sample-caption: press_start_testkit's own leg, copied verbatim from docs/00-build-a-game/test-app.md
sample-commit: 45aeffd2a2ecc3b3049819151abfc1c1343fb2aa
sample-source: docs/00-build-a-game/test-app.md

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

Every random stream comes from one seed you can write down. Game logic may not read the clock or sleep, and the lint
refuses it. The simulation steps only on a fixed tick, and the state that replays read is a declared boundary, not
"the whole world". So a test is a fact, a replay is exact, and "the bug at tick 340" is something one agent can hand
to another. *Scope today: the same build on the same platform.*

subhead: Parallel, and still deterministic.

Bevy runs systems across every core. Our gate refuses two systems that touch the same data in no declared order, and
it names both. A parallel sum must be ordered or order-independent, never "whatever the scheduler did".

*(Visual: a tick ruler 0 → 340 with two identical checksum columns — the hero's component, static.)*

## oracles

headline: Every feature has a reference it must match.

We do not grade our own homework. Physics is held against Jolt and PhysX, navigation against Recast, UI layout
against Chromium and Yoga, text shaping against HarfBuzz, lighting against Mitsuba, mesh repair against Blender and
Manifold. Where we differ, the difference is a written row with both numbers and a reason, never a hidden tolerance.
The speed bar is parity: at or under the reference's time.

small: Parity is the bar we hold every feature to. Not every feature meets it yet. The misses are recorded.

references: Jolt · PhysX · Recast · Chromium · Yoga · HarfBuzz · Mitsuba · Blender · Manifold

*(Visual: the reference names as plain mono text. No logos.)*

## goldens

headline: Pictures are tests too.

Every picture the engine draws in a test is shot on one reference card and compared with a golden, a frame a human
accepted in a reviewed commit. A tool can propose a new golden. It can never accept one. A blank or one-colour frame
is refused before any verdict.

placeholder-caption: accepted golden · not yet imported

*(Visual: a contact sheet of 6-9 accepted goldens — sprite, shader, UI, terrain — each captioned with its test name
in mono. Until M3 imports them, six empty crop frames carry `placeholder-caption`.)*

## built

headline: What is built today, counted.

tiles: {{catalog.total}} entries in the catalog · {{catalog.built}} BUILT · {{catalog.partial}} partly built ·
{{crates}} engine crates · {{oracles}} reference tools · {{goldens.accepted}} accepted goldens

Our catalog lists {{catalog.total}} things a game engine needs, from terrain to crash reports. An entry counts as
BUILT only when every clause of it is held by a landed test. {{catalog.built}} are BUILT today and
{{catalog.partial}} are partly built. {{catalog.skip}} are deliberately skipped, each with its reason. The rest are
written down and visibly unbuilt, because a list you cannot forget is the point.

proof: The first game, *Team Fights*, a small team shooter made of primitives, is built on these crates.

bar-legend: BUILT | PARTIAL | SKIP | not yet

*(Visual: the six tiles plus one thin stacked bar — BUILT / PARTIAL / SKIP / not yet — summing to
{{catalog.total}}. A Team Fights frame only once it is an accepted golden.)*

## roadmap

headline: Where we are, honestly.

Press Start is not public yet. This is the road to version 1, in order:

1. **Now:** the licence clean-up, where every module is rewritten from public documents only, and the editor (an
   editor window and a game window, by hand and by AI side by side, play and inspect).
2. **Version 1:** a launcher, a new project from a template, save, build, Windows export. An account is optional,
   and nothing requires one. The engine works fully offline.
3. **Then:** the major performance pain points, one full release gate, and the public repository under our own
   source-available licence.
4. **After:** a version every two weeks, the remaining gaps, more platforms.

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
state-existing: You are already on the list.
state-invalid: That address does not look right.
state-error: Something failed on our side. Try again.
success-card: Player 1 ready
coming-soon: Sign-ups open soon. *(Shown when no endpoint is configured.)*

consent: We store your email, and your answer if you give one, only to send beta access and release news. One click
unsubscribes and deletes it. [Privacy](/privacy)

## faq

headline: Questions.

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
   our game-authoring guide. *(Confirm with the founder before publishing.)*
7. **How much will it cost?** Using and shipping is free below a revenue threshold. The threshold and the rate are
   set with the licence text.
8. **When?** When version 1 passes its release gate. We do not publish dates we have not earned.

## footer

links: Press Start · © 2026 · Licence · Privacy · GitHub · Discord · contact

licence-stub: Licence: source-available, published with version 1.

small: Built on Bevy. Bevy is an independent open-source project; we are not affiliated.

*(GitHub links to this website's repository until the engine is public. Discord and the contact address wait on
PLAN.md §10 question 7.)*

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
