import { useEffect, useState, type RefObject } from 'react';

// Which child of a list is nearest the middle of the viewport: lights the current step of a
// procedure as the reader scrolls. One IntersectionObserver, no scroll listener.
export function useActiveStep(ref: RefObject<HTMLElement | null>, count: number): number {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || count === 0) return;
    const items = Array.from(el.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(items.indexOf(e.target as HTMLElement));
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, [ref, count]);
  return active;
}
