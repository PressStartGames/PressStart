import { useEffect, useEffectEvent, type RefObject } from 'react';

// Marks an element `data-visible` the first time it scrolls into view (one IntersectionObserver, no
// scroll listener) and calls `onEnter` once. The hidden "before" states live in CSS under
// html.js.hydrated only, so the prerendered page, the no-JS page and reduced motion show the final state.
export function useInView(
  ref: RefObject<HTMLElement | null>,
  onEnter?: () => void,
  rootMargin = '0px 0px -18% 0px',
) {
  const enter = useEffectEvent(() => onEnter?.());
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.dataset.visible = '';
      enter();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        el.dataset.visible = '';
        io.disconnect();
        enter();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
}
