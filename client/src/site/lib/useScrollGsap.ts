import { useEffect, useState } from 'react';
import { motionOk, useGsap, type Gsap } from '../../lib/gsap';

// The GSAP scroll layer (ScrollTrigger, SplitText) for what sits below the fold: it loads only once the
// visitor scrolls, presses a key or touches the page, so a visit that never scrolls (and the first
// paint) never pays for it. Until then everything is in its final, server-rendered state.
export function useScrollGsap(
  setup: Parameters<typeof useGsap>[0],
  when: () => boolean = motionOk,
): void {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!when()) return;
    const events = ['scroll', 'keydown', 'pointerdown', 'touchstart', 'wheel'] as const;
    const arm = () => {
      setArmed(true);
      for (const e of events) window.removeEventListener(e, arm);
    };
    for (const e of events) window.addEventListener(e, arm, { passive: true });
    // A page opened already scrolled (a reload, an anchor) is armed on the next frame.
    const raf = window.scrollY > 0 ? requestAnimationFrame(arm) : 0;
    return () => {
      cancelAnimationFrame(raf);
      for (const e of events) window.removeEventListener(e, arm);
    };
  }, [when]);
  useGsap(setup, [armed], () => armed && when(), true);
}

export type { Gsap };
