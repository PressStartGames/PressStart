import { useId } from 'react';
import { ARENA, type State } from '../../lib/sim';
import styles from './Stage.module.css';

// The replay simulation (lib/sim.ts) drawn as an arcade stage: a horizon glow, a floor grid in
// perspective, two goals, team one in phosphor, team two in amber, the ball with a short trail.
// `traced` is drawn as a white dashed outline over the bodies (run B from the same seed: it sits exactly
// on run A); `diverged` is drawn in red (run C, which parts from run A). An illustration drawn in the
// browser, never engine output; callers caption it so.
const FLOOR = ARENA.floor;
const VP = { x: ARENA.w / 2, y: FLOOR - 92 };
const H_LINES = [0, 1, 2, 3, 4, 5, 6].map((i) => FLOOR - 92 + i * i * 2.2 + i * 1.2);
const V_LINES = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];
const BODY_H = 50;

function Bodies({ s, kind }: { s: State; kind: 'a' | 'traced' | 'diverged' }) {
  return s.bodies.map((b, i) => {
    const top = FLOOR - BODY_H - b.y;
    const cls = kind === 'a' ? (b.team === 0 ? styles.teamA : styles.teamB) : styles[kind];
    return (
      <g key={i} className={cls}>
        {kind === 'a' && (
          <ellipse
            className={styles.shadow}
            cx={b.x}
            cy={FLOOR + 2}
            rx={Math.max(6, 15 - b.y * 0.12)}
            ry={3}
          />
        )}
        <rect x={b.x - 13} y={top} width={26} height={BODY_H} rx={13} />
        {kind === 'a' && (
          <rect
            className={styles.visor}
            x={b.x + (b.face > 0 ? -1 : -11)}
            y={top + 11}
            width={12}
            height={5}
            rx={2.5}
          />
        )}
      </g>
    );
  });
}

export function Stage({
  state,
  traced,
  diverged,
  trail = [],
  label,
  className,
  scores = true,
}: {
  state: State;
  traced?: State;
  diverged?: State;
  trail?: State[];
  label: string;
  className?: string;
  scores?: boolean;
}) {
  const { ball, score } = state;
  const id = 'stage' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg
      className={[styles.stage, className].filter(Boolean).join(' ')}
      viewBox={`0 0 ${ARENA.w} ${ARENA.h}`}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38e08f" stopOpacity="0" />
          <stop offset="1" stopColor="#38e08f" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38e08f" stopOpacity="0.08" />
          <stop offset="1" stopColor="#0b0d10" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y={FLOOR - 150} width={ARENA.w} height="150" fill={`url(#${id}h)`} />
      <rect x="0" y={FLOOR} width={ARENA.w} height={ARENA.h - FLOOR} fill={`url(#${id}f)`} />
      <g className={styles.grid}>
        {H_LINES.map((y) => (
          <line key={`h${y}`} x1="0" x2={ARENA.w} y1={y} y2={y} />
        ))}
        {V_LINES.map((i) => (
          <line key={`v${i}`} x1={VP.x + i * 30} y1={VP.y} x2={VP.x + i * 150} y2={ARENA.h} />
        ))}
      </g>
      <line className={styles.floor} x1="0" x2={ARENA.w} y1={FLOOR} y2={FLOOR} />
      <g className={styles.goal}>
        <rect x="2" y={FLOOR - 66} width="20" height="66" />
        <rect x={ARENA.w - 22} y={FLOOR - 66} width="20" height="66" />
      </g>
      <line
        className={styles.mid}
        x1={ARENA.w / 2}
        x2={ARENA.w / 2}
        y1={FLOOR - 4}
        y2={FLOOR + 4}
      />
      {diverged && <Bodies s={diverged} kind="diverged" />}
      {diverged && (
        <circle
          className={styles.ballDiverged}
          cx={diverged.ball.x}
          cy={FLOOR - 11 - diverged.ball.y}
          r="11"
        />
      )}
      {trail.map((t, i) => (
        <circle
          key={t.tick}
          className={styles.trail}
          cx={t.ball.x}
          cy={FLOOR - 11 - t.ball.y}
          r={4 + i * 1.4}
          style={{ opacity: 0.1 + i * 0.08 }}
        />
      ))}
      <Bodies s={state} kind="a" />
      <ellipse className={styles.shadow} cx={ball.x} cy={FLOOR + 2} rx={9} ry={2.5} />
      <circle className={styles.ball} cx={ball.x} cy={FLOOR - 11 - ball.y} r="11" />
      {traced && <Bodies s={traced} kind="traced" />}
      {traced && (
        <circle
          className={styles.traced}
          cx={traced.ball.x}
          cy={FLOOR - 11 - traced.ball.y}
          r="14"
        />
      )}
      {scores ? (
        <>
          <text x="34" y="34" className={styles.score}>
            {String(score[0]).padStart(2, '0')}
          </text>
          <text
            x={ARENA.w - 34}
            y="34"
            textAnchor="end"
            className={`${styles.score} ${styles.scoreB}`}
          >
            {String(score[1]).padStart(2, '0')}
          </text>
        </>
      ) : null}
    </svg>
  );
}
