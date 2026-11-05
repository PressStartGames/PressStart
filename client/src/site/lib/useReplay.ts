import { useEffect, useRef, useState } from 'react';
import { motionOk } from '../../lib/gsap';
import { checksum, SIM, stateAt } from '../../lib/sim';

// The handheld's state machine. The server renders the final frame of run 1 (phase "done"), which is
// also the reduced-motion and no-JS state. With motion allowed the console powers on once (splash),
// plays 240 ticks and stops; START replays the same seed, SELECT moves to the next seed. Each run's
// final checksum is compared with the first run of its seed. Nothing runs between presses.
export const SEEDS = [SIM.seed, 0x1d2c, 0xbe7a, 0x0c0a] as const;
const TICK_MS = 13;
const SPLASH_MS = 1100;

export type Phase = 'splash' | 'running' | 'done';
export type Verdict = 'first' | 'seed' | 'match';

export interface Replay {
  seedIndex: number;
  run: number;
  tick: number;
  phase: Phase;
  verdict: Verdict;
}

const FINAL = (s: number) => checksum(stateAt(SIM.ticks, s));

export function useReplay() {
  const [r, setR] = useState<Replay>({
    seedIndex: 0,
    run: 1,
    tick: SIM.ticks,
    phase: 'done',
    verdict: 'first',
  });
  const runs = useRef(new Map<number, number>());
  const raf = useRef(0);
  const timer = useRef(0);

  function play(seedIndex: number, run: number, verdict: Verdict, splash: boolean) {
    cancelAnimationFrame(raf.current);
    clearTimeout(timer.current);
    if (!motionOk()) {
      setR({ seedIndex, run, tick: SIM.ticks, phase: 'done', verdict });
      return;
    }
    setR({ seedIndex, run, tick: 0, phase: splash ? 'splash' : 'running', verdict });
    const start = () => {
      const t0 = performance.now();
      const frame = (now: number) => {
        const tick = Math.min(SIM.ticks, Math.floor((now - t0) / TICK_MS));
        const done = tick >= SIM.ticks;
        setR((prev) => ({ ...prev, tick, phase: done ? 'done' : 'running' }));
        if (!done) raf.current = requestAnimationFrame(frame);
      };
      raf.current = requestAnimationFrame(frame);
    };
    if (splash) timer.current = window.setTimeout(start, SPLASH_MS);
    else start();
  }

  // Power on once, after the page is idle (the h1 has painted; the first frame is already there).
  useEffect(() => {
    runs.current.set(SEEDS[0], 1);
    if (!motionOk()) return;
    const w = window as Window & typeof globalThis;
    const hasIdle = typeof w.requestIdleCallback === 'function';
    const idle = hasIdle
      ? w.requestIdleCallback(() => play(0, 1, 'first', true), { timeout: 900 })
      : w.setTimeout(() => play(0, 1, 'first', true), 300);
    const rafs = raf;
    const timers = timer;
    return () => {
      if (hasIdle) w.cancelIdleCallback(idle);
      else w.clearTimeout(idle);
      cancelAnimationFrame(rafs.current);
      clearTimeout(timers.current);
    };
  }, []);

  const seed = SEEDS[r.seedIndex] ?? SIM.seed;

  // START: the same seed again; the verdict compares with that seed's first run.
  function start() {
    const n = (runs.current.get(seed) ?? 0) + 1;
    runs.current.set(seed, n);
    play(r.seedIndex, n, n === 1 ? 'seed' : 'match', false);
  }

  // SELECT: the next seed; a seed seen before replays and matches its first run.
  function select() {
    const i = (r.seedIndex + 1) % SEEDS.length;
    const s = SEEDS[i] ?? SIM.seed;
    const n = (runs.current.get(s) ?? 0) + 1;
    runs.current.set(s, n);
    play(i, n, n === 1 ? (i === 0 ? 'first' : 'seed') : 'match', false);
  }

  return {
    ...r,
    seed,
    state: stateAt(r.tick, seed),
    sum: checksum(stateAt(r.tick, seed)),
    final: FINAL(seed),
    start,
    select,
  };
}
