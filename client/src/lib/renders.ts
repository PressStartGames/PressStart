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
// The crate as the page shows it: the manifest keeps the real name for provenance, the page drops the
// "press_start_" prefix and the engine-internal "_bevy" suffix (CLAUDE.md: Bevy is never named on the site).
export const crateLabel = (crate: string): string =>
  crate.replace(/^press_start_/, '').replace(/_bevy$/, '');

// The contact sheet: raster goldens as responsive pictures, pixel goldens as plain urls.
const pictures = import.meta.glob('../../assets/renders/*.png', {
  eager: true,
  query: '?w=480;900&format=avif;webp;png&as=picture',
  import: 'default',
}) as Record<string, Picture>;

export const featuredFile = manifest.featured as string;
export const stripFiles = manifest.strip as string[];

export function pictureFor(file: string): Picture | undefined {
  return pictures[`../../assets/renders/${file}`];
}

export function isPixelArt(file: string): boolean {
  const row = rowFor(file);
  return !!row && row.width <= 160 && row.height <= 160;
}
