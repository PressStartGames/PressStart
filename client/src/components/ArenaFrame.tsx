import { ARENA, type State } from '../lib/sim';
import styles from './ReplayStrip.module.css';

// Draws one simulation state: a lit arena, two teams of capsules, a ball. Both hero panels draw
// the same state, so they are the same picture by construction. Pure SVG, no raster.
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
      <defs>
        <linearGradient id="arena-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#151b26" />
          <stop offset="1" stopColor="#0b0e14" />
        </linearGradient>
        <linearGradient id="arena-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b222d" />
          <stop offset="1" stopColor="#0e1218" />
        </linearGradient>
        <radialGradient id="arena-glow" cx="0.5" cy="1" r="0.7">
          <stop offset="0" stopColor="#3ddc97" stopOpacity="0.28" />
          <stop offset="1" stopColor="#3ddc97" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cap-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cf0bf" />
          <stop offset="1" stopColor="#23b377" />
        </linearGradient>
        <linearGradient id="cap-amber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd08a" />
          <stop offset="1" stopColor="#e39a2e" />
        </linearGradient>
        <radialGradient id="ball-fill" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#c9c0ff" />
          <stop offset="1" stopColor="#6b5cf0" />
        </radialGradient>
      </defs>
      <rect width={ARENA.w} height={ARENA.h} fill="url(#arena-sky)" />
      <rect y={floor - 110} width={ARENA.w} height={170} fill="url(#arena-floor)" />
      <rect y={floor - 160} width={ARENA.w} height={220} fill="url(#arena-glow)" />
      <g stroke="#263040" strokeWidth="1">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={`h${i}`}
            x1="0"
            x2={ARENA.w}
            y1={floor - 110 + i * i * 6.5}
            y2={floor - 110 + i * i * 6.5}
          />
        ))}
        {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => (
          <line key={`v${i}`} x1={320 + i * 50} y1={floor - 110} x2={320 + i * 150} y2={ARENA.h} />
        ))}
      </g>
      {/* goals */}
      <rect x="0" y={floor - 70} width="22" height="70" fill="#3ddc97" opacity="0.18" />
      <rect x={ARENA.w - 22} y={floor - 70} width="22" height="70" fill="#ffb547" opacity="0.18" />
      <line x1="22" x2="22" y1={floor - 70} y2={floor} stroke="#3ddc97" strokeWidth="2" />
      <line
        x1={ARENA.w - 22}
        x2={ARENA.w - 22}
        y1={floor - 70}
        y2={floor}
        stroke="#ffb547"
        strokeWidth="2"
      />
      {/* bodies, back to front by x */}
      {bodies.map((b, i) => {
        const h = 54;
        const yTop = floor - h - b.y;
        const squash = b.y === 0 && Math.abs(b.vx) > 2 ? 1.06 : 1;
        return (
          <g key={i}>
            <ellipse
              cx={b.x}
              cy={floor + 2}
              rx={16 - b.y * 0.12}
              ry={5 - b.y * 0.04}
              fill="#000"
              opacity="0.5"
            />
            <rect
              x={b.x - 14 * squash}
              y={yTop}
              width={28 * squash}
              height={h}
              rx="14"
              fill={b.team === 0 ? 'url(#cap-green)' : 'url(#cap-amber)'}
            />
            <circle cx={b.x + b.face * 6} cy={yTop + 16} r="3" fill="#0b0e14" />
          </g>
        );
      })}
      <ellipse
        cx={ball.x}
        cy={floor + 2}
        rx={10 - ball.y * 0.03}
        ry={3}
        fill="#000"
        opacity="0.45"
      />
      <circle cx={ball.x} cy={floor - 12 - ball.y} r="12" fill="url(#ball-fill)" />
      <text x="20" y="32" className={styles.arenaScore}>
        {score[0]}
      </text>
      <text
        x={ARENA.w - 20}
        y="32"
        textAnchor="end"
        className={`${styles.arenaScore} ${styles.arenaScoreB}`}
      >
        {score[1]}
      </text>
    </svg>
  );
}
