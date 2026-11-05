// The engine's strengths: their pages, their face-button colour (DESIGN.md "Colour") and pixel icon.
// Labels and lines come from each page's CONTENT.md section (`page-<id>`).
import type { SitePageId } from '../../content/schema';
import type { IconName } from './icons';

export type Tone = 'red' | 'amber' | 'blue' | 'green' | 'ink';

export interface Strength {
  id: SitePageId;
  tone: Tone;
  icon: IconName;
}

// In the order of the value strip on the home page (site-values), then the AI surface.
export const STRENGTHS: readonly Strength[] = [
  { id: 'engine-determinism', tone: 'red', icon: 'dice' },
  { id: 'engine-parallel', tone: 'amber', icon: 'chip' },
  { id: 'engine-oracles', tone: 'blue', icon: 'target' },
  { id: 'engine-ownership', tone: 'green', icon: 'key' },
  { id: 'engine-ai', tone: 'ink', icon: 'chat' },
];

export const VALUE_STRENGTHS = STRENGTHS.slice(0, 4);
