import { ICONS, type IconName } from '../lib/icons';

// A hand-drawn pixel icon as crisp SVG squares. Decorative: the text beside it carries the meaning.
export function PixelIcon({ name, className }: { name: IconName; className?: string }) {
  const map = ICONS[name];
  const h = map.length;
  const w = map[0]?.length ?? 0;
  const cells: Array<{ x: number; y: number; accent: boolean }> = [];
  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === '#' || c === 'o') cells.push({ x, y, accent: c === 'o' });
    }
  });
  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
    >
      {cells.map((c) => (
        <rect
          key={`${c.x}-${c.y}`}
          x={c.x}
          y={c.y}
          width="1.02"
          height="1.02"
          fill={c.accent ? 'var(--icon-accent, currentColor)' : 'currentColor'}
        />
      ))}
    </svg>
  );
}
