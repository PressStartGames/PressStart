import { preload } from 'react-dom';
import pixel from '@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff2?url';
import grotesk from '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url';

// Preloads the two faces the first screen paints in (the body/display face and the pixel labels), so
// they arrive with the stylesheet instead of swapping in later and moving the hero (CLS). React emits the
// <link rel="preload"> tags into the prerendered HTML; the URLs are Vite's, the same files fonts.css uses.
export function preloadFonts(): void {
  preload(grotesk, { as: 'font', type: 'font/woff2', crossOrigin: '' });
  preload(pixel, { as: 'font', type: 'font/woff2', crossOrigin: '' });
}
