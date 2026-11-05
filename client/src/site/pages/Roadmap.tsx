import { field, splitLead } from '../../content';
import { Inline } from '../../content/inline';
import { RoadMap } from '../home/RoadMap';
import { StartBand } from '../home/StartBand';
import { items, paragraphs } from '../lib/copy';
import { PageHero } from '../ui/PageHero';
import { SectionHead } from '../ui/SectionHead';
import ui from '../ui/ui.module.css';
import styles from './Roadmap.module.css';

// /roadmap: the overworld with every stage's detail, the decisions already made, what "beta" means.
export function Roadmap() {
  return (
    <>
      <PageHero id="page-roadmap" tone="amber" />
      <section
        className={`${ui.sectionTight} ${ui.wrap}`}
        aria-label={field('site-road', 'kicker')}
      >
        <RoadMap detailed />
      </section>
      <section className={`${ui.section} ${ui.wrap}`} aria-labelledby="decisions-title">
        <SectionHead
          id="decisions-title"
          kicker={field('site-roadmap-decisions', 'kicker')}
          title={field('site-roadmap-decisions', 'headline')}
          tone="blue"
        />
        <ul className={styles.decisions}>
          {items('site-roadmap-decisions').map((text) => {
            const { lead, rest } = splitLead(text);
            return (
              <li key={lead}>
                <h3 className={styles.title}>{lead}</h3>
                <p className={styles.text}>
                  <Inline text={rest} />
                </p>
              </li>
            );
          })}
        </ul>
      </section>
      <section className={`${ui.section} ${ui.wrap}`} aria-labelledby="beta-title">
        <div className={styles.beta}>
          <h2 id="beta-title" className={styles.betaTitle}>
            {field('site-roadmap-beta', 'headline')}
          </h2>
          <p className={styles.betaText}>{paragraphs('site-roadmap-beta')[0]}</p>
        </div>
      </section>
      <StartBand />
    </>
  );
}
