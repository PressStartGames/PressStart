---
name: press-start-react
description: The React standard for every Press Start web app (client = beta + main site, admin console). Use before writing or reviewing any React/TSX, hook, route, component, animation, form or image code in client/ or admin/, and when a lint rule from the shared config fires. Covers bundle size, client fetching, re-renders, rendering, JS performance, react.dev's Rules of React, accessibility, reduced motion, copy/counts/image provenance, budgets, CSS Modules and routing conventions.
---

# The React standard

Stack: Vite + React 19 + React Router 7 (library mode, every route prerendered to static HTML), CSS Modules +
`tokens.css`, TypeScript strict. No Next.js, no RSC, no request-time server rendering. Sources: Vercel's
`react-best-practices` (vercel-labs agent-skills; only the rules that apply to a SPA), react.dev's Rules of
React, and our own rules (CLAUDE.md, `press-start-site`). Lint config: `eslint.shared.js` at the repo root, used
by `client` and `admin` (`reactConfig`) and `server` (`nodeConfig`). **[L]** = enforced by lint; the rest is review.

## 1. Rules of React (react.dev)

- **[L] Components and hooks are pure.** No writes to props, state, refs or module variables during render; no
  `Math.random()`/`Date.now()` in render. Why: React may render twice or skip renders; the Compiler relies on it.
- **[L] Hooks at the top level**, never in conditions, loops or after an early return; only in components/hooks.
- **[L] Never mutate state, props or hook results** (`push`, `sort`, assignment); copy, then set.
- **[L] No `ref.current` reads/writes during render** (except lazy init). Refs are for effects and handlers.
- **[L] No synchronous setState in an effect to mirror props/state** (derived state). Compute it in render;
  reset with a `key` instead of an effect ("You might not need an effect").
- **[L] Don't define components inside components** (state resets every render, breaks the Compiler).
- **Effects sync with external systems** (DOM APIs, observers, timers, sockets, third-party scripts), not events
  or data shaping. "User did X" logic goes in the handler. Always clean up what you start.
- **Keys**: stable ids; never the array index for reorderable lists, never `Math.random()`.
- **[L] Exhaustive deps**: fix the code, don't silence the rule. Primitive deps beat object deps.
- **Lift state to the nearest common parent, no further.** Context only for truly app-wide values.
- **Compiler-friendly code**: plain functions; no manual `useMemo`/`useCallback`/`memo` by default, only with a
  measured reason and a comment. The `react-hooks` 7 Compiler rules are on.

## 2. Bundle size (Vercel, CRITICAL)

- **[L] No barrel/index imports**: import the defining module. Why: tree-shaking and splitting.
- **Route-level code splitting**: routes via `React.lazy`/the router's `lazy`; only the first-paint route is in
  the entry. Initial JS <= 125 KB gzip (measured by hand; not asserted in CI).
- **Load heavy or conditional things on demand** (`import()` for the sim, charts, Turnstile) only when used;
  preload on hover/focus of the trigger.
- **Third-party scripts after load/idle** (analytics, Turnstile, GA after consent), `defer`/`async`.
- **Static import paths only** (`import('./x')`, literal `import.meta.glob`); no computed paths.
- Check the build's size report before adding a dependency; no dependency for a one-liner.

## 3. Client data fetching (Vercel)

- **One fetch layer** (`lib/api.ts`): typed result, `AbortController` on unmount, no fetch during render;
  dedupe identical in-flight requests (add SWR/TanStack only when a second consumer appears).
- **Parallel by default** (`Promise.all`); check cheap sync conditions before awaiting, await late in the branch
  that needs the value. Start requests in the router loader/handler, not after a child mounts.
- **Don't fetch what the build knows.** Content, counts and routes are static data at build time.
- **Global listeners**: register once, `{ passive: true }` for scroll/touch/wheel, clean up.
- **localStorage**: versioned key, minimal data, try/catch every access, never needed for correctness.

## 4. Re-renders (Vercel)

- **Derive, don't sync** (rule 1). Subscribe to the derived boolean (`isNarrow`), not the raw value (`width`).
- **State only handlers read, or values that change every frame** (pointer, scroll progress, timers): a ref or a
  Motion value / CSS variable, not React state.
- **Functional setState** (`setN(n => n + 1)`); **lazy initial state** (`useState(() => costly())`).
- **Interaction logic in event handlers**, not in effects reacting to state the event set.
- **`startTransition`/`useDeferredValue`** for non-urgent updates; prefer `useTransition`'s `isPending` to a
  hand-rolled loading flag.
- **Hoist default non-primitive props and static JSX** to module scope (`const EMPTY: Row[] = []`).
- One effect, one concern: split effects with independent deps.

## 5. Rendering (Vercel)

- **Ternary, not `cond && <X/>`**, when `cond` can be `0` or `''`.
- **`content-visibility: auto`** (+ `contain-intrinsic-size`) on long below-the-fold sections and lists.
- **Animate a wrapper `div`, not the `<svg>`**; reduce SVG path precision (SVGO); big SVGs are files.
- **Resource hints**: `preload` the display font and the LCP image only; `preconnect` the API origin.
- **`<script>` tags `defer`/`async`.** No render-blocking third party.
- **No hydration flicker**: the prerendered HTML is the final state; client-only values (storage) start from
  the server value and update after mount.
- **`<Activity>`** to hide expensive subtrees whose state must survive; otherwise unmount.
- **Batch DOM/CSS writes** through a class or one style update; no read-after-write layout loops.

## 6. JavaScript (Vercel)

- Early return over nesting. `Map`/`Set` for repeated lookups, not `find` in a loop.
- One pass instead of chained `filter().map()` on hot paths; `toSorted()`/`toSpliced()` not in-place `sort()`
  on shared data; min/max by loop, not sort.
- Hoist `RegExp` out of loops and render; cache property access and storage reads in hot loops.
- Defer non-critical work with `requestIdleCallback` (fallback `setTimeout`).

## 7. Advanced (Vercel)

- App-wide init once, at module scope or `main.tsx`, not in a component effect.
- A handler an effect needs but that must not re-trigger it: `useEffectEvent` (never in deps) or a latest-ref.

## 8. Accessibility (WCAG 2.2 AA, axe clean)

- **[L] jsx-a11y recommended.** `tabIndex` only on interactive elements, or on `role="region"` scrollers that
  carry an `aria-label` (axe scrollable-region-focusable).
- **Landmarks** (`header`, `nav`, `main`, `footer`), **exactly one `h1` per route**, headings in order, skip
  link first, visible focus rings (never `outline: none` without a replacement).
- **Visible label on every control**; `button` for actions, `a` for navigation; no click handlers on `div`.
- **Forms**: `role="status"` live region, focus moved to the result/error, errors via `aria-describedby`,
  `autocomplete` attributes.
- **Route change**: set the document title and move focus to the new `h1`/`main`.
- **Contrast**: never dim text with `opacity` (axe blends it); use a token colour. Targets >= 24 px.
- e2e runs axe (WCAG 2.2 AA tags) on every route; a new route or screen brings its axe pass in the same PR.

## 9. Motion

- **Every animation has a `prefers-reduced-motion: reduce` branch showing the final state; the no-JS state is
  that same final state** (hidden initial states only under `html.js`). Use `usePrefersReducedMotion`, CSS media
  queries, or Motion's `useReducedMotion`.
- **Compositor-only** (`transform`, `opacity`); never animate layout properties; the idle state stays still;
  nothing runs on the main thread after the load sequence; hover effects in CSS, not state.
- Each animation shows a fact or guides the eye.

## 10. Content, numbers, images

- **Copy comes from `CONTENT.md`** via the content layer; no prose in TSX. New copy = a new key there, and
  `check-content` passes.
- **Numbers come from `client/data/counts.json`** (the sync script against the engine); never typed by hand.
- **Images** only from the engine's accepted goldens, each with a provenance row; `<picture>` AVIF/WebP via
  `vite-imagetools`, explicit width/height, lazy below the fold, integer scaling + `image-rendering: pixelated`
  for pixel art. No stock images, no other engines' logos. `check-renders` guards this.
- Wording rules (no "Unity for AI", no promised dates, present tense only for what is true today) live in
  `press-start-website`; read it before touching a claim.

## 11. Performance budgets (CI-asserted, `lighthouserc.json`)

Lighthouse mobile >= 95 / 100 / 100 / 100; LCP <= 2.0 s; CLS <= 0.02; TBT <= 150 ms; initial JS <= 125 KB gzip;
first view <= 1.2 MB. Reserve space (width/height, `aspect-ratio`, font fallback metrics). The h1 is the LCP
element and paints in the prerendered HTML.

## 12. Styling, routing, structure

- **CSS Modules + `tokens.css` custom properties.** No Tailwind, no CSS-in-JS, no hard-coded colour or spacing a
  token covers. `Name.module.css` next to `Name.tsx`.
- **Routes**: React Router library mode; every route prerendered (`<route>/index.html`) and in the prerender
  route table; not-found -> `404.html`; no hash routing; `basename` follows `VITE_BASE`.
- **Per-route meta** (title, description, canonical, OG) declared with the route so the prerendered HTML carries
  it, never only set in an effect.
- **Route-level splitting**: each route module lazy except the first-paint route.
- **File shape**: one component per file, PascalCase; hooks `useX`; **[L]** no import cycles (`import-x/no-cycle`,
  depth 4), no self-imports, no duplicate imports; **[L]** component files export only components
  (`react-refresh`, client); **[L]** typescript-eslint recommended (no `any`, no unused vars; `_` prefix ignores).

## Excluded (Vercel rules that do not apply to a Vite SPA with prerendering)

- Server-side performance, all Next.js/RSC: `server-auth-actions`, `server-cache-react`, `server-cache-lru`,
  `server-dedup-props`, `server-hoist-static-io`, `server-no-shared-module-state`, `server-serialization`,
  `server-parallel-fetching`, `server-parallel-nested-fetching`, `server-after-nonblocking`.
- Server/streaming waterfalls: `async-api-routes`, `async-suspense-boundaries` (streaming SSR; plain Suspense for
  lazy routes is fine), `async-dependencies` (needs the `better-all` library; use `Promise.all`).
- Next-specific forms: `bundle-dynamic-imports` (`next/dynamic`; we use `React.lazy`), `bundle-analyzable-paths`
  (file tracing; kept only as "static import paths"), `rendering-hydration-suppress-warning` (we prerender the
  final state, no expected mismatches), `rendering-hydration-no-flicker` as an inline-script recipe (kept only as
  the principle above).
- Replaced by the React Compiler: `rerender-memo`, `rerender-memo-with-default-value` (kept only as "hoist"),
  `rerender-simple-expression-in-memo`, `rerender-dependencies`/`rerender-split-combined-hooks` (kept as one-liners).
- Not a mandate (micro-optimisations, only on measured hot paths): `js-index-maps`, `js-cache-property-access`,
  `js-cache-function-results`, `js-cache-storage`, `js-combine-iterations`, `js-length-check-first`,
  `js-hoist-regexp`, `js-min-max-loop`, `js-set-map-lookups`, `js-flatmap-filter`, `js-batch-dom-css`,
  `rendering-svg-precision`, `rendering-animate-svg-wrapper` (kept as brief reminders in 5 and 6),
  `client-swr-dedup` (SWR optional), `advanced-event-handler-refs`, `advanced-use-latest` (covered by
  `useEffectEvent`), `rerender-use-ref-transient-values` (kept in 4).

## What lint enforces (shared config, `eslint.shared.js`)

`eslint-plugin-react-hooks` 7 `recommended` (rules-of-hooks, exhaustive-deps, the Compiler rules), `jsx-a11y`
recommended (+ the tabindex option above), `import-x` (`no-cycle` depth 4, `no-self-import`, `no-duplicates`),
`no-restricted-imports` for barrel/index imports, `react-refresh`, typescript-eslint recommended. Not linted
(review): everything not tagged **[L]**; copy/counts/images (their own scripts), budgets (Lighthouse CI),
reduced motion (e2e `motion.spec.ts`).
