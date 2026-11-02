// GSAP, loaded lazily after hydration so first paint and the no-JS page are untouched. Every
// caller checks motionOk() first: no motion for reduced-motion users; nothing runs on the server.
import type { gsap as GsapType } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';
import type { SplitText as SplitTextType } from 'gsap/SplitText';
import { useEffect } from 'react';

export interface Gsap {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
  SplitText: typeof SplitTextType;
}

let loading: Promise<Gsap> | null = null;
let loadingScroll: Promise<Gsap> | null = null;

export function loadGsap(scroll = false): Promise<Gsap> {
  if (!loading) {
    loading = Promise.all([import('gsap'), import('gsap/SplitText')]).then(([core, split]) => {
      core.gsap.registerPlugin(split.SplitText);
      return {
        gsap: core.gsap,
        SplitText: split.SplitText,
        ScrollTrigger: null as unknown as typeof ScrollTriggerType,
      };
    });
  }
  if (!scroll) return loading;
  if (!loadingScroll) {
    loadingScroll = loading.then(async (g) => {
      const st = await import('gsap/ScrollTrigger');
      g.gsap.registerPlugin(st.ScrollTrigger);
      g.ScrollTrigger = st.ScrollTrigger;
      return g;
    });
  }
  return loadingScroll;
}

// `?nomotion` switches the GSAP layer off (a debugging aid for measuring what it costs).
export function motionOk(): boolean {
  return (
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !window.location.search.includes('nomotion')
  );
}

export function finePointer(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );
}

export function desktop(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches;
}

// Runs `setup` inside a gsap.context once GSAP is loaded (after the browser is idle), and reverts
// everything the context created on unmount. `setup` may return a cleanup of its own.
export function useGsap(
  setup: (g: Gsap, ctx: ReturnType<typeof GsapType.context>) => void | (() => void),
  deps: ReadonlyArray<unknown> = [],
  when: () => boolean = motionOk,
  scroll = false,
) {
  useEffect(() => {
    if (!when()) return;
    let cancelled = false;
    let ctx: ReturnType<typeof GsapType.context> | null = null;
    let cleanup: void | (() => void);
    const idle =
      'requestIdleCallback' in window
        ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: 1500 })
        : (cb: () => void) => window.setTimeout(cb, 50);
    idle(() => {
      void loadGsap(scroll).then((g) => {
        if (cancelled) return;
        ctx = g.gsap.context(() => {
          cleanup = setup(g, ctx!);
        });
      });
    });
    return () => {
      cancelled = true;
      if (typeof cleanup === 'function') cleanup();
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
