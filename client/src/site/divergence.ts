// Run C for the determinism lab: the same seed as runs A and B, with one different input at tick 140
// (the ball is kicked the other way, so the runs part for good: run C ends 2-1, run A 1-1). Built
// from lib/sim.ts's pure step, so it is the same in every browser and on the server. An illustration
// of the engine's rule, not engine output.
import { SIM, checksum, stateAt, step, type State } from '../lib/sim';

export const DIVERGE_AT = 140;
const trajC: State[] = [];

export function stateC(tick: number): State {
  if (tick < DIVERGE_AT) return stateAt(tick);
  if (!trajC.length) {
    const s = step(stateAt(DIVERGE_AT - 1));
    s.ball = { ...s.ball, vx: -9, vy: 5 };
    trajC.push(s);
  }
  while (trajC.length <= tick - DIVERGE_AT) trajC.push(step(trajC[trajC.length - 1]!));
  return trajC[tick - DIVERGE_AT]!;
}

export interface Probe {
  tick: number;
  same: boolean;
}

// The binary search a replay runs to name the first tick where two runs part: start knowing tick 0
// agrees and the last tick does not, halve the gap until it closes.
export function locate(): { probes: Probe[]; first: number } {
  let lo = 0;
  let hi: number = SIM.ticks;
  const probes: Probe[] = [];
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    const same = checksum(stateAt(mid)) === checksum(stateC(mid));
    probes.push({ tick: mid, same });
    if (same) lo = mid;
    else hi = mid;
  }
  return { probes, first: hi };
}
