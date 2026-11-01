import styles from './ReplayStrip.module.css';

// A clearly-placeholder frame: a primitives arena (ground grid, three capsules, a few boxes) whose
// capsules move as a pure function of the tick, so two panels fed the same tick draw the same frame.
// Replaced at M3 by the engine's own booth captures.
export function PlaceholderFrame({ t, label }: { t: number; label: string }) {
  const phase = (t / 128) * Math.PI * 2;
  const capsules = [0, 1, 2].map((i) => {
    const x = 140 + i * 180 + 42 * Math.sin(phase + i * 1.9);
    const hop = Math.abs(Math.sin(phase * 1.5 + i * 1.3));
    const y = 232 - 34 * hop;
    return { x, y, hop, i };
  });
  return (
    <svg
      className={styles.frame}
      viewBox="0 0 640 360"
      role="img"
      aria-label={`${label}: placeholder frame at tick ${t}`}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#161a21" />
          <stop offset="1" stopColor="#0e1014" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c222b" />
          <stop offset="1" stopColor="#11141a" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.55" r="0.6">
          <stop offset="0" stopColor="#3ddc97" stopOpacity="0.22" />
          <stop offset="1" stopColor="#3ddc97" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="360" fill="url(#sky)" />
      <rect y="190" width="640" height="170" fill="url(#floor)" />
      <rect y="150" width="640" height="130" fill="url(#glow)" />
      <g stroke="#262b34" strokeWidth="1">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={`h${i}`} x1="0" x2="640" y1={190 + i * i * 4.7} y2={190 + i * i * 4.7} />
        ))}
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
          <line key={`v${i}`} x1={320 + i * 60} y1="190" x2={320 + i * 170} y2="360" />
        ))}
      </g>
      <g fill="#1f2630" stroke="#2c333e" strokeWidth="1">
        <rect x="60" y="150" width="60" height="60" />
        <rect x="500" y="160" width="46" height="46" />
        <rect x="300" y="166" width="38" height="38" />
      </g>
      {capsules.map(({ x, y, hop, i }) => (
        <g key={i}>
          <ellipse cx={x} cy="246" rx={18 - hop * 6} ry={5 - hop * 2} fill="#000" opacity="0.45" />
          <rect
            x={x - 14}
            y={y - 48}
            width="28"
            height="56"
            rx="14"
            fill={i === 1 ? '#ffb547' : '#3ddc97'}
          />
          <circle cx={x + 5} cy={y - 32} r="3" fill="#0e1014" />
        </g>
      ))}
      <text x="614" y="340" textAnchor="end" className={styles.frameTick}>
        t {String(t).padStart(3, '0')}
      </text>
    </svg>
  );
}
