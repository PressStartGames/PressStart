import { useInView } from 'motion/react';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

// Counts a number tile up from 0 once it scrolls into view. The server renders the final value, so
// the no-JS and reduced-motion states are the number itself.
export function useCountUp(
  value: number,
  duration = 1100,
): [RefObject<HTMLElement | null>, number] {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (reduced || !inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, inView, value, duration]);

  return [ref, shown];
}
