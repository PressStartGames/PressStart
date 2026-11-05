// The copy an experiment swaps, keyed by variant. Copy lives in CONTENT.md: a variant's field is the
// control's key with "-b" appended (site-home: headline / headline-b).
import { field } from '../content';
import { useVariant } from './flags';

/** The h1 of a main-site page: the home headline experiment's variant on the home page, the page's own elsewhere. */
export function useHeadline(sectionId: string): string {
  const variant = useVariant('home-headline');
  return sectionId === 'site-home' && variant === 'variant-b'
    ? field(sectionId, 'headline-b')
    : field(sectionId, 'headline');
}
