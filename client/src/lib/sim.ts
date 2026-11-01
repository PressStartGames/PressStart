// A small deterministic simulation, drawn in the browser by the hero's "two runs, one game" strip.
// It is an illustration of the engine's rule, not engine output: one seed, no clock, a fixed tick,
// and a checksum of the state at every tick. Run A and run B step the same function from the same
// seed, so their checksums match line for line; a run from another seed diverges at once.
// Everything here is pure and integer-quantised, so the server, the client and every browser agree.

export const ARENA = { w: 640, h: 360, floor: 272 } as const;
export const SIM = { ticks: 240, rowEvery: 40, seed: 0x5eed } as const;
export const ROW_TICKS = Array.from(
  { length: SIM.ticks / SIM.rowEvery + 1 },
  (_, i) => i * SIM.rowEvery,
);

export interface Body {
  x: number;
  y: number; // 0 = on the floor; positive = in the air
  vx: number;
  vy: number;
  team: 0 | 1;
  face: 1 | -1;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface State {
  tick: number;
  seed: number;
  rng: number;
  bodies: Body[];
  ball: Ball;
  score: [number, number];
  event: string | null; // what happened on this tick, for the caption
}

// xorshift32, kept in the state so a step is a pure function of the previous state.
function next(rng: number): number {
  let x = rng | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}

export function initial(seed: number = SIM.seed): State {
  let rng = (seed ^ 0x9e3779b9) >>> 0 || 1;
  const bodies: Body[] = [];
  for (let i = 0; i < 4; i++) {
    rng = next(rng);
    const team = (i % 2) as 0 | 1;
    bodies.push({
      x: team === 0 ? 110 + i * 40 : 450 + i * 20,
      y: 0,
      vx: 0,
      vy: 0,
      team,
      face: team === 0 ? 1 : -1,
    });
  }
  return {
    tick: 0,
    seed,
    rng,
    bodies,
    ball: { x: 320, y: 40, vx: 0, vy: 0 },
    score: [0, 0],
    event: null,
  };
}

const q = (v: number) => Math.round(v * 16) / 16; // sixteenths: stable across platforms

export function step(s: State): State {
  let rng = s.rng;
  const tick = s.tick + 1;
  let event: string | null = null;
  const ball: Ball = { ...s.ball };
  const score: [number, number] = [s.score[0], s.score[1]];

  // Ball: gravity, floor bounce, walls.
  ball.vy = q(ball.vy - 0.35);
  ball.x = q(ball.x + ball.vx);
  ball.y = q(ball.y + ball.vy);
  if (ball.y < 0) {
    ball.y = 0;
    ball.vy = q(-ball.vy * 0.6);
    ball.vx = q(ball.vx * 0.92);
  }
  if (ball.x < 24 || ball.x > ARENA.w - 24) {
    const left = ball.x < 24;
    score[left ? 1 : 0] += 1;
    event = left ? 'goal · amber' : 'goal · green';
    ball.x = 320;
    ball.y = 60;
    ball.vx = 0;
    ball.vy = 0;
  }

  const bodies = s.bodies.map((b, i) => {
    const nb: Body = { ...b };
    // Chase the ball with a little seeded jitter; the jitter comes from the state's own stream.
    rng = next(rng);
    const jitter = ((rng % 7) - 3) * 0.08;
    // Each body keeps its own spot around the ball, so the teams spread instead of bunching.
    const spot = [-34, 34, -82, 82][i] ?? 0;
    const dir = Math.sign(ball.x + spot - nb.x) || nb.face;
    nb.vx = q(nb.vx * 0.86 + dir * (0.55 + i * 0.05) + jitter);
    nb.x = q(Math.min(ARENA.w - 40, Math.max(40, nb.x + nb.vx)));
    nb.face = dir as 1 | -1;
    // Jump when the ball is overhead and close.
    if (nb.y === 0 && Math.abs(ball.x - nb.x) < 30 && ball.y > 24 && (rng & 3) === 0) {
      nb.vy = 6.5;
      event = event ?? `jump · ${nb.team === 0 ? 'green' : 'amber'}`;
    }
    nb.vy = q(nb.vy - 0.45);
    nb.y = q(Math.max(0, nb.y + nb.vy));
    if (nb.y === 0 && nb.vy < 0) nb.vy = 0;
    // Kick: touching the ball sends it the way the body faces.
    if (Math.abs(ball.x - nb.x) < 22 && Math.abs(ball.y - nb.y) < 34) {
      ball.vx = q(nb.face * (5.5 + (rng % 3)));
      ball.vy = q(4 + (rng % 4));
      event = `kick · ${nb.team === 0 ? 'green' : 'amber'}`;
    }
    return nb;
  });

  // A scripted input on tick 120: the same recorded input tape plays on every run.
  if (tick === 120) {
    const b = bodies[0];
    if (b) {
      b.vy = 7;
      b.y = q(b.y + 1);
    }
    event = 'input tape · jump';
  }

  return { tick, seed: s.seed, rng, bodies, ball, score, event };
}

// FNV-1a over the quantised state, two 32-bit lanes -> 16 hex characters.
export function checksum(s: State): string {
  const parts: number[] = [s.tick, s.rng, s.score[0], s.score[1]];
  for (const b of s.bodies) parts.push(b.x * 16, b.y * 16, b.vx * 16, b.vy * 16, b.team, b.face);
  parts.push(s.ball.x * 16, s.ball.y * 16, s.ball.vx * 16, s.ball.vy * 16);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193 ^ s.seed;
  for (const p of parts) {
    const v = Math.round(p) | 0;
    for (let k = 0; k < 4; k++) {
      const byte = (v >>> (k * 8)) & 0xff;
      h1 = Math.imul(h1 ^ byte, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ byte, 0x01000193) >>> 0;
    }
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

const caches = new Map<number, State[]>();

// The state at a tick, from a cached trajectory (the same seed always yields the same states).
export function stateAt(tick: number, seed: number = SIM.seed): State {
  let traj = caches.get(seed);
  if (!traj) {
    traj = [initial(seed)];
    caches.set(seed, traj);
  }
  while (traj.length <= tick) traj.push(step(traj[traj.length - 1]!));
  return traj[tick]!;
}

export interface Row {
  tick: number;
  a: string;
  b: string;
}

// The checksum rows the strip prints: run A and run B are the same function from the same seed.
export function rows(seed: number = SIM.seed): Row[] {
  return ROW_TICKS.map((tick) => {
    const h = checksum(stateAt(tick, seed));
    return { tick, a: h, b: h };
  });
}
