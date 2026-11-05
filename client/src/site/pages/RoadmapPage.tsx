import { crumbsFor } from '../data';
import { JoinBand } from '../JoinBand';
import { Road } from '../Road';
import styles from './Page.module.css';
import { PageHead } from './PageHead';

// /roadmap: the road's three stops, a line each, no dates. Direction only: internal work in progress
// is never on this page.
export function RoadmapPage() {
  return (
    <>
      <PageHead id="page-roadmap" crumbs={crumbsFor('roadmap')} />
      <section className={`frame ${styles.road}`} aria-labelledby="road-title">
        <Road size="page" titleId="road-title" />
      </section>
      <JoinBand />
    </>
  );
}
