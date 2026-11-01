# Advanced web animation: what exists beyond scroll reveals, and what fits this site

Research of 2026-11-02, for the Arcade design (`design/arcade`). The site today animates in four ways: CSS
keyframes on load, CSS/IntersectionObserver reveals on scroll, scroll-driven CSS (`animation-timeline`) for
the paper lift and progress rules, and one JavaScript-driven simulation (the hero). Everything below is a
technique the site does not use yet, with where it would pay off here and what it costs.

## 1. The toolbox in 2026

| Technique | What it is | Cost to ship | Fits here |
|---|---|---|---|
| **GSAP 3.13+ with every plugin free** | The industry timeline engine. ScrollTrigger (scrub, pin, snap), SplitText (per-line/word/char with masking, 14 new features in 3.13), MorphSVG, DrawSVG, MotionPath, Flip, Inertia, ScrollSmoother. Free for commercial use since Webflow bought it (April 2025). | ~30 KB gzip core, plugins 5–15 KB each | Yes: timelines with cause → effect sequencing are exactly what the proof sections need |
| **Motion (formerly Framer Motion) 14** | React-native springs, layout animations, `AnimatePresence`, `animateView()` (View Transitions), `useScroll`/`useVelocity`; Motion+ adds Cursor (magnetic, zones), ScrambleText, Motion Studio (a visual timeline editor that hands code to an agent) | Already a dependency (we use only `useInView`) | Yes for springs on UI; GSAP is stronger for long choreographed timelines |
| **Scroll-driven CSS** (`animation-timeline: scroll()/view()`) | Compositor-driven, no JS, pure CSS keyframes scrubbed by scroll | Free | Already in use; Chrome 115+, Safari 26+, Firefox 159+ (88% global). Keep the `@supports` guard |
| **View Transitions API** (same-document and cross-document) | The browser snapshots old and new DOM and morphs between them (shared-element transitions, page-to-page fades) | Free; Chrome 126+, Safari 18+, Firefox 144+ | For `/` → `/privacy` and the sign-up flip (form → cartridge as one morph) |
| **Canvas image sequence, scroll-scrubbed** | 60–150 pre-rendered frames drawn to a `<canvas>` by scroll progress (the Apple product-page technique; GSAP ships an `imageSequenceScrub` helper). Scrubbing `<video>` is janky because seeks land on keyframes | Frames: ≈18 MB for 90 × 200 KB unless tiered and lazily loaded | Only once the engine has a real booth capture to render frames from |
| **WebGL / WebGPU scenes** (Three.js r17x with `WebGPURenderer` and a WebGL fallback, shaders in TSL; React Three Fiber) | A real 3D scene the scroll moves through; custom GLSL for displacement, bloom, depth of field; glTF + Draco/Meshopt + KTX2 assets; capped DPR, render-on-visible, 2D fallback | 150–400 KB and real engineering; must hit 60 fps on a mid-range phone | A "walk into the booth" hero is the award-site move, but it needs engine renders to be honest |
| **Rive** | Designer-authored vector animation with a state machine the page drives (inputs: hover, scroll, numbers) | ~100–200 KB runtime (WASM); a `.riv` file per animation | For a mascot-grade cabinet or coin; Lottie (~60 KB, playback-only) for simpler loops |
| **Kinetic typography** | SplitText per character; variable-font axes (`wght`, `wdth`, `slnt`) animated per frame or by cursor proximity/scroll velocity with springs; text on a path | Cheap in bytes, but axis changes re-run text layout: fix widths, keep to headlines | Yes: the hero headline and section heads |
| **Pointer-driven physics** | Magnetic buttons, cursor-following spotlights, elastic drags that propagate to neighbours (springs, not easings) | Cheap | Already partly in use (spotlight); magnetic CTA is a natural add |
| **Shader-like effects without WebGL** | CSS `@property` on gradients, `mask`/`clip-path` morphs, `filter` chains, `mix-blend-mode`, Houdini `paint()` | Free | CRT glow, phosphor bloom, chromatic split: all doable in CSS |

Rules the award-site juries and practitioners repeat: animate only `transform`/`opacity`; never scrolljack
(no wheel hijack, keyboard scrolling must work); every state change needs an inverse so scrolling up is
consistent; keep each step's meaning in real DOM text; a reduced-motion user gets the final state; test on a
mid-range Android over cellular; defer the heavy bundle and render meaningful HTML first.

## 2. What "advanced" would mean for this site, in order of payoff

1. **A choreographed hero timeline (GSAP + SplitText).** Today the headline rises and the simulation
   runs. Instead: the cabinet powers on (a CRT "degauss" flash, scanlines settle), the headline is typed in
   per character with a chromatic split that resolves, the kicker arrives as the last BIOS line, then the
   attract mode starts and the ledger fills. One timeline, one master clock, scrub-able in Motion Studio or
   GSAP's timeline tools. This replaces three unrelated CSS animations with one story.
2. **Pin-and-scrub proof sections (ScrollTrigger pin + scrub).** "How an agent builds a game": pin the
   code plate, scrub through the four steps as the reader scrolls, each step lighting its lines in the code
   and moving the arena state. "Every core": scrub the systems landing on the lanes under the reader's own
   scroll, the gate catching the pair mid-scroll, the checksum resolving at the end. Scrub makes the reader
   the clock, which is the engine's own idea.
3. **The sign-up as a View Transition.** The form morphs into the cartridge (shared-element transition on
   the card's outline), the coin drops, the cartridge seats. Same for `/` → `/confirmed`.
4. **Kinetic type on the "PROVE" word and section heads.** Variable-font weight pulled by cursor
   proximity (Unbounded has a weight axis), the neon gradient driven by the same spring.
5. **Magnetic CTA and inertial rail.** The fixed "Join the beta" pill pulls toward the cursor (Motion+
   Cursor or a 20-line spring); the stages rail eases with scroll velocity.
6. **A real 3D booth (later).** When the engine produces a booth capture, a scroll-scrubbed frame
   sequence (cheap) or a Three.js scene (expensive) of the cabinet. Not before: the site publishes only
   engine output and honest illustrations.

## 3. Costs and guards

- Bundle: GSAP core + ScrollTrigger + SplitText ≈ 45 KB gzip. Current JS is ≈106 KB; the site's budget
  question (90 KB in CLAUDE.md) is already open with the founder. Load GSAP after hydration (`import()` on
  idle) so first paint is unchanged.
- Lighthouse: pinned sections and long timelines are fine for Speed Index as long as the first viewport
  settles within ~2 s; the hero timeline should finish its "power on" inside that window and leave the
  attract mode to start on visibility, as today.
- Accessibility: every timeline gets a reduced-motion branch that jumps to the end state; pinning must
  not trap keyboard scrolling; SplitText output must keep an `aria-label` with the whole sentence.
- No-JS: the prerendered HTML stays the final state; GSAP only runs forward from it.

## Sources

- GSAP free, plugins included: https://github.com/greensock/GSAP · https://webflow.com/blog/gsap-becomes-free · https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/ · https://artofstyleframe.com/blog/gsap-2026-free-license-whats-new/
- Image-sequence scrub helper: https://gsap.com/docs/v3/HelperFunctions/helpers/imageSequenceScrub · https://scrollhaus.ai/blog/image-sequence-scroll-animation-canvas/ · https://dev.to/alki/video-on-scroll-in-elementor-why-scrubbing-an-mp4-stutters-and-what-to-do-instead-156l
- Scrollytelling patterns and caveats: https://scrollytelling.ai/scrollytelling-design-patterns/
- Three.js/WebGL award sites and techniques: https://www.utsubo.com/blog/best-threejs-websites-2026 · https://www.hontran.dev/blog/webgl-website-examples · https://www.awwwards.com/websites/three-js/
- Rive vs Lottie: https://lottiefiles.com/blog/lottie-animations/lottiefiles-or-rive · https://yokaify.com/blog/rive-vs-lottie · https://www.pkgpulse.com/guides/lottie-vs-rive-vs-css-animations-web-animation-formats-2026
- Motion library news: https://motion.dev/magazine · https://motion.dev/magazine/introducing-motion-studio · https://motion.dev/docs/changelog
- Scroll-driven animation support: https://caniuse.com/mdn-css_properties_animation-timeline · https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline · https://modern-css.com/whats-new-in-css-2026/
- Kinetic typography: https://freefrontend.com/split-text-js/ · https://studiomeyer.io/en/blog/kinetische-typografie · https://www.skills.sh/avnehsbhatia/ultraui/variable-font-animation
