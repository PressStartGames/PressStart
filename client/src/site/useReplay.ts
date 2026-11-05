import { useEffect, useState, type RefObject } from 'react';
import { motionOk } from '../lib/gsap';
import { SIM } from '../lib/sim';

const RAMP = 0.1; // the first tenth of the run accelerates from rest

// The attract loop: the tick runs 0 -> SIM.ticks while the element is in view, holds the finished
// run, then plays again. Out of view it pauses where it is. The server value (and the value for
// reduced motion and no JS) is the finished run; only tick changes reach React.
export function useReplay(
  ref: RefObject<HTMLElement | null>,
  { runMs = 9000, holdMs = 3200, startMs = 500 } = {},
): number {
  const [tick, setTick] = useState<number>(SIM.ticks);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionOk()) return;
    let raf = 0;
    let timer = 0;
    let inView = false;
    let phase: 'idle' | 'run' | 'paused' | 'hold' = 'idle';
    let elapsed = 0;
    let start = 0;
    let last = -1;

    const frame = (now: number) => {
      elapsed = now - start;
      const lin = Math.min(1, elapsed / runMs);
      const t = lin < RAMP ? (lin * lin) / RAMP : lin;
      const nt = Math.round(t * SIM.ticks);
      if (nt !== last) {
        last = nt;
        setTick(nt);
      }
      if (lin < 1) {
        raf = requestAnimationFrame(frame);
        return;
      }
      phase = 'hold';
      timer = window.setTimeout(() => {
        if (inView) begin();
        else phase = 'idle';
      }, holdMs);
    };
    const begin = () => {
      phase = 'run';
      start = performance.now();
      last = -1;
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        inView = !!e?.isIntersecting;
        if (inView && phase === 'idle') {
          phase = 'hold';
          timer = window.setTimeout(begin, startMs);
        } else if (inView && phase === 'paused') {
          phase = 'run';
          start = performance.now() - elapsed;
          raf = requestAnimationFrame(frame);
        } else if (!inView && phase === 'run') {
          cancelAnimationFrame(raf);
          phase = 'paused';
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [ref, runMs, holdMs, startMs]);

  return tick;
}
