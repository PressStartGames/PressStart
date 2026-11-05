import { ARENA, type State } from '../../lib/sim';
import styles from './Arena.module.css';

// One state of the browser simulation (lib/sim.ts), drawn flat in two phosphors: team A solid in the
// stage's colour, team B outlined, the ball in white. An illustration, never engine output.
export function Arena({ state, label }: { state: State; label: string }) {
  const { bodies, ball } = state;
  const floor = ARENA.floor;
  return (
    <svg
      className={styles.arena}
      viewBox={`0 40 ${ARENA.w} ${ARENA.h - 40}`}
      role="img"
      aria-label={`${label} · ${state.tick}`}
    >
      <g className={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={`h${i}`}
            x1="0"
            x2={ARENA.w}
            y1={floor + 10 + i * i * 9}
            y2={floor + 10 + i * i * 9}
          />
        ))}
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
          <line key={`v${i}`} x1={320 + i * 70} y1={floor} x2={320 + i * 130} y2={ARENA.h} />
        ))}
      </g>
      <line className={styles.floor} x1="0" x2={ARENA.w} y1={floor} y2={floor} />
      <rect className={styles.goal} x="0" y={floor - 64} width="18" height="64" />
      <rect className={styles.goal} x={ARENA.w - 18} y={floor - 64} width="18" height="64" />
      {bodies.map((b, i) => {
        const h = 52;
        const top = floor - h - b.y;
        const solid = b.team === 0;
        return (
          <g key={i} className={solid ? styles.teamA : styles.teamB}>
            <rect x={b.x - 14} y={top} width="28" height={h} rx="14" />
            <rect
              className={styles.eye}
              x={b.x + b.face * 5 - 3}
              y={top + 12}
              width="6"
              height="6"
            />
          </g>
        );
      })}
      <circle className={styles.ball} cx={ball.x} cy={floor - 11 - ball.y} r="11" />
    </svg>
  );
}
