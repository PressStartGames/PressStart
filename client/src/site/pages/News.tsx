import { PatchNotes } from '../home/PatchNotes';
import { StartBand } from '../home/StartBand';
import { PageHero } from '../ui/PageHero';
import ui from '../ui/ui.module.css';

// /news: the patch notes in full.
export function News() {
  return (
    <>
      <PageHero id="page-news" tone="blue" />
      <section className={`${ui.sectionTight} ${ui.wrap}`}>
        <PatchNotes />
      </section>
      <StartBand />
    </>
  );
}
