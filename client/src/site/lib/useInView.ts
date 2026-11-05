import { useEffect, useRef, useState, type RefObject } from 'react';

// True once the element has scrolled into view (an IntersectionObserver, disconnected after the first
// hit). The server renders `false`; the CSS hides an element's initial state only under
// html.js.hydrated, so the no-JS page and the first paint are the final state.
export function useInView<T extends Element>(
  margin = '0px 0px -12% 0px',
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, seen];
}
