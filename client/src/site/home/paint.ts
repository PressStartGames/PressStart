// Drawing helpers for the suite console's arena (Arena.tsx renders the frame; paint() moves it).
import { ARENA, type State } from '../../lib/sim';

const F = ARENA.floor;

export function bodyTransform(x: number, y: number): string {
  return `translate(${x} ${F - y})`;
}

export function ballTransform(x: number, y: number): string {
  return `translate(${x} ${F - y - 9})`;
}

// Moves the prerendered SVG to a pair of states by attribute (no React render per frame).
export function paint(svg: SVGSVGElement, a: State, b: State) {
  for (const [run, s] of [
    ['a', a],
    ['b', b],
  ] as const) {
    s.bodies.forEach((body, i) => {
      const g = svg.querySelector(`[data-body="${run}${i}"]`);
      g?.setAttribute('transform', bodyTransform(body.x, body.y));
      if (run === 'a') g?.querySelector('[data-eye]')?.setAttribute('cx', String(body.face * 7));
    });
    svg
      .querySelector(`[data-ball="${run}"]`)
      ?.setAttribute('transform', ballTransform(s.ball.x, s.ball.y));
  }
  const shadow = svg.querySelector('[data-shadow]');
  shadow?.setAttribute('cx', String(a.ball.x));
  shadow?.setAttribute('rx', String(Math.max(4, 12 - a.ball.y / 12)));
  svg.querySelectorAll('[data-score]').forEach((t) => {
    const side = Number(t.getAttribute('data-score'));
    t.textContent = String(a.score[side as 0 | 1]).padStart(2, '0');
  });
}
