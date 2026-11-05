import type { Ref } from 'react';
import { ARENA, type State } from '../../lib/sim';
import { ballTransform, bodyTransform } from './paint';
import styles from './SuiteConsole.module.css';

const F = ARENA.floor;

// The run, drawn as SVG from a sim state: run A solid, run B as an outline over it. With the same seed
// the outlines sit exactly on the bodies; with another seed they drift apart. The play loop in
// SuiteConsole moves the groups by attribute; this renders the prerendered (final) frame.
export function Arena({ a, b, svgRef }: { a: State; b: State; svgRef: Ref<SVGSVGElement> }) {
  return (
    <svg
      ref={svgRef}
      className={styles.arena}
      viewBox={`0 0 ${ARENA.w} ${ARENA.h}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="arena-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0d10" />
          <stop offset="1" stopColor="#14202b" />
        </linearGradient>
        <linearGradient id="arena-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#123327" />
          <stop offset="1" stopColor="#0b0d10" />
        </linearGradient>
      </defs>
      <rect width={ARENA.w} height={F} fill="url(#arena-sky)" />
      <rect y={F} width={ARENA.w} height={ARENA.h - F} fill="url(#arena-floor)" />
      <g className={styles.grid}>
        {[-480, -320, -160, 0, 160, 320, 480].map((dx) => (
          <line key={dx} x1={320 + dx * 0.4} y1={F} x2={320 + dx * 1.3} y2={ARENA.h} />
        ))}
        <line x1="0" y1={F + 22} x2={ARENA.w} y2={F + 22} />
        <line x1="0" y1={F + 56} x2={ARENA.w} y2={F + 56} />
      </g>
      <line className={styles.floorLine} x1="0" y1={F} x2={ARENA.w} y2={F} />
      <g className={styles.goal}>
        <rect x="8" y={F - 70} width="16" height="70" />
        <rect x={ARENA.w - 24} y={F - 70} width="16" height="70" />
      </g>
      <text className={styles.score} x="40" y="44" data-score="0">
        {String(a.score[0]).padStart(2, '0')}
      </text>
      <text className={styles.score} x={ARENA.w - 40} y="44" textAnchor="end" data-score="1">
        {String(a.score[1]).padStart(2, '0')}
      </text>
      <ellipse
        className={styles.shadow}
        data-shadow=""
        cx={a.ball.x}
        cy={F + 3}
        rx={Math.max(4, 12 - a.ball.y / 12)}
        ry="3"
      />
      {a.bodies.map((body, i) => (
        <g key={i} data-body={`a${i}`} transform={bodyTransform(body.x, body.y)}>
          <rect
            className={body.team === 0 ? styles.teamA : styles.teamB}
            x="-13"
            y="-46"
            width="26"
            height="46"
            rx="13"
          />
          <circle className={styles.eye} cx={body.face * 6} cy="-32" r="3" data-eye="" />
        </g>
      ))}
      {b.bodies.map((body, i) => (
        <g key={i} data-body={`b${i}`} transform={bodyTransform(body.x, body.y)}>
          <rect className={styles.ghost} x="-16" y="-49" width="32" height="52" rx="16" />
        </g>
      ))}
      <g data-ball="a" transform={ballTransform(a.ball.x, a.ball.y)}>
        <circle className={styles.ball} r="9" />
      </g>
      <g data-ball="b" transform={ballTransform(b.ball.x, b.ball.y)}>
        <circle className={styles.ghost} r="13" />
      </g>
    </svg>
  );
}
