// Small helpers over the browser simulation (lib/sim.ts) for the tour's proofs. Pure, so the server, the
// client and every browser agree; nothing here is engine output.
import { motionOk } from '../../lib/gsap';
import { SIM, checksum, initial, stateAt, step, type State } from '../../lib/sim';

export { checksum, stateAt, step, SIM };
export type { State };

// Run B with one input changed at `at`: body 1 jumps on that tick. Everything before `at` is run A.
const variants = new Map<number, State[]>();
export function variantAt(tick: number, at: number): State {
  if (tick < at) return stateAt(tick);
  let traj = variants.get(at);
  if (!traj) {
    const s = stateAt(at);
    const bodies = s.bodies.map((b, i) => (i === 1 ? { ...b, vy: 7, y: b.y + 1 } : b));
    traj = [{ ...s, bodies }];
    variants.set(at, traj);
  }
  while (traj.length <= tick - at) traj.push(step(traj[traj.length - 1]!));
  return traj[tick - at]!;
}

export function stepN(s: State, n: number): State {
  let out = s;
  for (let i = 0; i < n; i++) out = step(out);
  return out;
}

export function centreBall(s: State): State {
  return { ...s, ball: { ...initial(s.seed).ball, y: 60 } };
}

// Runs `frame(t)` with t from 0 to 1 over `ms` on animation frames, once; returns a cancel. With reduced
// motion (or ?nomotion) it jumps straight to the end.
export function tween(ms: number, frame: (t: number) => void): () => void {
  if (!motionOk()) {
    frame(1);
    return () => {};
  }
  let raf = 0;
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    frame(t);
    if (t < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
