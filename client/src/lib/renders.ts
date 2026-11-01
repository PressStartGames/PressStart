// The published engine renders (client/assets/renders/, every file with a manifest row). Raster
// goldens go through vite-imagetools (AVIF, WebP, PNG at two widths); pixel-art goldens are served
// as-is and scaled by integer factors in CSS.
import manifest from '../../assets/renders/manifest.json';

export interface Picture {
  sources: Record<string, string>;
  img: { src: string; w: number; h: number };
}

export interface RenderRow {
  file: string;
  engineCommit: string;
  crate: string;
  test: string;
  sourcePath: string;
  kind: 'golden' | 'booth';
  width: number;
  height: number;
  sha256: string;
}

export const renders = manifest.images as RenderRow[];
export const rowFor = (file: string): RenderRow | undefined => renders.find((r) => r.file === file);

// The hero's frames: one per tick, keyed by file name (replay.json names them).
export const heroFrames = Object.fromEntries(
  Object.entries(
    import.meta.glob('../../assets/renders/rig2d-character-tick-*.png', {
      eager: true,
      query: '?url',
      import: 'default',
    }),
  ).map(([path, url]) => [path.split('/').pop() ?? path, url as string]),
) as Record<string, string>;

// The contact sheet: raster goldens as responsive pictures, pixel goldens as plain urls.
const pictures = import.meta.glob('../../assets/renders/*.png', {
  eager: true,
  query: '?w=480;900&format=avif;webp;png&as=picture',
  import: 'default',
}) as Record<string, Picture>;

export const sheetFiles = manifest.sheet as string[];

export function pictureFor(file: string): Picture | undefined {
  return pictures[`../../assets/renders/${file}`];
}

export function isPixelArt(file: string): boolean {
  const row = rowFor(file);
  return !!row && row.width <= 160 && row.height <= 160;
}
