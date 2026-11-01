import { ARENA, type State } from '../lib/sim';
import styles from './ReplayStrip.module.css';

// Draws one simulation state in phosphor monochrome: team A solid, team B outlined, a white ball.
// Both halves of the main screen draw the same state, so they are the same picture by construction.
export function ArenaFrame({ state, label }: { state: State; label: string }) {
  const { bodies, ball, score } = state;
  const floor = ARENA.floor;
  return (
    <svg
      className={styles.arena}
      viewBox={`0 0 ${ARENA.w} ${ARENA.h}`}
      role="img"
      aria-label={`${label}: the simulation at tick ${state.tick}, score ${score[0]} to ${score[1]}`}
    >
      <rect width={ARENA.w} height={ARENA.h} fill="#0b0d10" />
      {/* floor grid in perspective */}
      <g stroke="#1e8a58" strokeOpacity="0.45" strokeWidth="1">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={`h${i}`}
            x1="0"
            x2={ARENA.w}
            y1={floor - 96 + i * i * 5.6}
            y2={floor - 96 + i * i * 5.6}
          />
        ))}
        {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => (
          <line key={`v${i}`} x1={320 + i * 48} y1={floor - 96} x2={320 + i * 150} y2={ARENA.h} />
        ))}
      </g>
      <line x1="0" x2={ARENA.w} y1={floor} y2={floor} stroke="#38e08f" strokeWidth="1" />
      {/* goals */}
      <rect
        x="0"
        y={floor - 64}
        width="20"
        height="64"
        fill="none"
        stroke="#38e08f"
        strokeWidth="1.5"
      />
      <rect
        x={ARENA.w - 20}
        y={floor - 64}
        width="20"
        height="64"
        fill="none"
        stroke="#38e08f"
        strokeWidth="1.5"
      />
      {bodies.map((b, i) => {
        const h = 52;
        const yTop = floor - h - b.y;
        const solid = b.team === 0;
        return (
          <g key={i}>
            <ellipse
              cx={b.x}
              cy={floor + 1}
              rx={14 - b.y * 0.1}
              ry={3}
              fill="#38e08f"
              opacity="0.25"
            />
            <rect
              x={b.x - 13}
              y={yTop}
              width="26"
              height={h}
              rx="13"
              fill={solid ? '#38e08f' : '#0b0d10'}
              stroke="#38e08f"
              strokeWidth="2"
            />
            <circle
              cx={b.x + b.face * 5}
              cy={yTop + 15}
              r="2.5"
              fill={solid ? '#0b0d10' : '#38e08f'}
            />
          </g>
        );
      })}
      <ellipse cx={ball.x} cy={floor + 1} rx={9} ry={2.5} fill="#d9e0e6" opacity="0.25" />
      <circle cx={ball.x} cy={floor - 11 - ball.y} r="11" fill="#d9e0e6" />
      <text x="16" y="30" className={styles.arenaScore}>
        {String(score[0]).padStart(2, '0')}
      </text>
      <text x={ARENA.w - 16} y="30" textAnchor="end" className={styles.arenaScore}>
        {String(score[1]).padStart(2, '0')}
      </text>
    </svg>
  );
}
