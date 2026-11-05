import { glyphPath, type GLYPHS } from './pixels';

// A 12 x 12 pixel glyph in the current colour; decorative (the text beside it carries the meaning).
export function PixelIcon({
  name,
  size = 24,
  className,
}: {
  name: keyof typeof GLYPHS;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <path d={glyphPath(name)} fill="currentColor" />
    </svg>
  );
}
