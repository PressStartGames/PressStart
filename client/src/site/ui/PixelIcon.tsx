import { PIXELS, pixelPath, type PixelName } from './pixels';

// A hand-drawn pixel icon at an integer scale, in the current colour. Decorative unless labelled.
export function PixelIcon({
  name,
  scale = 3,
  className,
}: {
  name: PixelName;
  scale?: number;
  className?: string;
}) {
  const rows = PIXELS[name];
  const w = rows[0]?.length ?? 0;
  const h = rows.length;
  return (
    <svg
      className={['pixel-icon', className].filter(Boolean).join(' ')}
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d={pixelPath(rows)} fill="currentColor" />
    </svg>
  );
}
