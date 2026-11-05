// The main site's motion helpers. Everything here runs only in the browser, after hydration; the
// prerendered HTML is always the final state (= no-JS = reduced motion).
//
//   reveal      a ref callback: sets data-visible once the element scrolls into view (site.css and
//               base.css hide `.reveal` / `[data-reveal]` until then, only under html.js.hydrated)
//   onceInView  runs a callback the first time an element is in view
//   countUp     counts an element's number up from zero (text only, tabular figures, no layout shift)
import { motionOk } from '../lib/gsap';

type Callback = () => void;
const callbacks = new WeakMap<Element, Callback>();
let observer: IntersectionObserver | null = null;

function io(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const cb = callbacks.get(e.target);
        callbacks.delete(e.target);
        observer?.unobserve(e.target);
        cb?.();
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  );
  return observer;
}

export function onceInView(el: Element, cb: Callback): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    cb();
    return () => {};
  }
  callbacks.set(el, cb);
  io().observe(el);
  return () => {
    callbacks.delete(el);
    observer?.unobserve(el);
  };
}

// <section ref={reveal}>: React 19 ref callback with cleanup.
export function reveal(el: HTMLElement | null): void | (() => void) {
  if (!el) return;
  return onceInView(el, () => {
    el.dataset.visible = '';
  });
}

// Counts the element's text (digits only) up from zero once it is in view.
export function countUp(el: HTMLElement | null): void | (() => void) {
  if (!el || !motionOk()) return;
  const target = Number(el.textContent?.replace(/[^\d]/g, '') ?? '');
  if (!Number.isFinite(target) || target <= 0) return;
  let raf = 0;
  const stop = onceInView(el, () => {
    const start = performance.now();
    const dur = 1100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    el.textContent = '0';
    raf = requestAnimationFrame(tick);
  });
  return () => {
    stop();
    cancelAnimationFrame(raf);
    el.textContent = String(target);
  };
}
