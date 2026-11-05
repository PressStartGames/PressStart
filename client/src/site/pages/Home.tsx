import { Link } from 'react-router';
import { field } from '../../content';
import { sitePagePath } from '../../routes';
import { Features } from '../home/Features';
import { Hero } from '../home/Hero';
import { HiScores } from '../home/HiScores';
import { Involved } from '../home/Involved';
import { RoadMap } from '../home/RoadMap';
import { StartBand } from '../home/StartBand';
import { ValueButtons } from '../home/ValueButtons';
import { paragraphs } from '../lib/copy';
import { SectionHead } from '../ui/SectionHead';
import ui from '../ui/ui.module.css';
import styles from './Home.module.css';

// The home page (DESIGN.md): hero + handheld, the four buttons, features, high scores, the road,
// get involved, PRESS START.
export function Home() {
  return (
    <>
      <Hero />
      <ValueButtons />
      <Features />
      <HiScores />
      <section className={`${ui.section} ${ui.wrap}`} aria-labelledby="road-title">
        <SectionHead
          id="road-title"
          kicker={field('site-road', 'kicker')}
          title={field('site-road', 'headline')}
          lede={paragraphs('site-road')[0]}
          tone="amber"
        />
        <RoadMap />
        <p className={styles.more}>
          <Link className={`${ui.more} ${ui.amber}`} to={sitePagePath('roadmap')}>
            {field('site-road', 'cta')}
            <span className={ui.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        </p>
      </section>
      <Involved />
      <StartBand />
    </>
  );
}
