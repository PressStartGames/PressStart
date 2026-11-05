import { StartBand } from '../home/StartBand';
import { PageHero } from '../ui/PageHero';

// /news: a placeholder until there are version notes to post (no notes about internal milestones;
// founder, 2026-11-05).
export function News() {
  return (
    <>
      <PageHero id="page-news" tone="blue" />
      <StartBand />
    </>
  );
}
