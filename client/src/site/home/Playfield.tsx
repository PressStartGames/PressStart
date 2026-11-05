import { ARENA, type State } from '../../lib/sim';

const FLOOR = ARENA.floor;
const RED = '#ff5a3c';
const BLUE = '#5b7fff';
const GRID = '#38e08f';

// The handheld's screen: one state of the browser simulation (lib/sim.ts) in colour. Team one is red,
// team two blue, the ball cream. Pure: the same state always draws the same picture.
export function Playfield({ state, label }: { state: State; label: string }) {
  const { bodies, ball, score } = state;
  return (
    <svg viewBox={`0 0 ${ARENA.w} ${ARENA.h}`} role="img" aria-label={label}>
      <defs>
        <linearGradient id="l3-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#151b2e" />
          <stop offset="0.75" stopColor="#0c0f17" />
        </linearGradient>
      </defs>
      <rect width={ARENA.w} height={ARENA.h} fill="url(#l3-sky)" />
      <g stroke={GRID} strokeOpacity="0.28" strokeWidth="1">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={`h${i}`}
            x1="0"
            x2={ARENA.w}
            y1={FLOOR - 96 + i * i * 5.6}
            y2={FLOOR - 96 + i * i * 5.6}
          />
        ))}
        {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => (
          <line key={`v${i}`} x1={320 + i * 48} y1={FLOOR - 96} x2={320 + i * 150} y2={ARENA.h} />
        ))}
      </g>
      <line x1="0" x2={ARENA.w} y1={FLOOR} y2={FLOOR} stroke={GRID} strokeWidth="2" />
      <rect x="0" y={FLOOR - 64} width="20" height="64" fill="none" stroke={RED} strokeWidth="3" />
      <rect
        x={ARENA.w - 20}
        y={FLOOR - 64}
        width="20"
        height="64"
        fill="none"
        stroke={BLUE}
        strokeWidth="3"
      />
      {bodies.map((b, i) => {
        const h = 52;
        const top = FLOOR - h - b.y;
        const color = b.team === 0 ? RED : BLUE;
        return (
          <g key={i}>
            <ellipse cx={b.x} cy={FLOOR + 2} rx={14 - b.y * 0.1} ry={3} fill="#000" opacity="0.5" />
            <rect x={b.x - 14} y={top} width="28" height={h} rx="14" fill={color} />
            <rect
              x={b.x - 14}
              y={top}
              width="28"
              height={h}
              rx="14"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.25"
              strokeWidth="2"
            />
            <rect x={b.x + b.face * 4 - 5} y={top + 11} width="10" height="8" rx="3" fill="#fff" />
            <rect x={b.x + b.face * 6 - 2} y={top + 13} width="4" height="4" fill="#0b0d10" />
          </g>
        );
      })}
      <ellipse cx={ball.x} cy={FLOOR + 2} rx={9} ry={2.5} fill="#000" opacity="0.5" />
      <circle cx={ball.x} cy={FLOOR - 11 - ball.y} r="11" fill="#fff4dc" />
      <circle cx={ball.x - 3} cy={FLOOR - 14 - ball.y} r="3.5" fill="#fff" />
      <text
        x="40"
        y="44"
        fill={RED}
        fontFamily="'Press Start 2P', monospace"
        fontSize="22"
        aria-hidden="true"
      >
        {String(score[0]).padStart(2, '0')}
      </text>
      <text
        x={ARENA.w - 40}
        y="44"
        textAnchor="end"
        fill={BLUE}
        fontFamily="'Press Start 2P', monospace"
        fontSize="22"
        aria-hidden="true"
      >
        {String(score[1]).padStart(2, '0')}
      </text>
    </svg>
  );
}
