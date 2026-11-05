import { useRef, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import { sitePagePath } from '../../routes';
import { VerbConsole } from '../proofs/VerbConsole';
import { pairs, stage } from '../tour/stages';
import { Code } from '../ui/Code';
import { PixelIcon } from '../ui/PixelIcon';
import { Prose } from '../ui/Prose';
import { useInView } from '../ui/useInView';
import styles from './EngineAi.module.css';
import page from './Page.module.css';
import { PageHead } from './PageHead';

const VERB_COLOR: Record<string, string> = {
  query: 'var(--st-cyan)',
  command: 'var(--st-orange)',
  capture: 'var(--st-pink)',
  control: 'var(--st-lime)',
};

// /engine/ai, the designed strength page: the console first (play the verbs), then each verb in
// depth (command with its verbatim request), "ask it what it can do", "the door stays at your desk",
// and the editor's chat, labelled as the road. Ends with the neighbouring strengths.
export function EngineAi() {
  const s = stage('ai');
  const verbs = pairs(field('site-ai-verbs', 'details'));
  const rows = useRef<HTMLDivElement>(null);
  useInView(rows);
  return (
    <div style={{ '--accent': s.color } as CSSProperties}>
      <PageHead id="page-engine-ai" icon={s.icon} color={s.color} />

      <section
        className={`frame ${page.section} ${styles.play}`}
        aria-label={field('site-stage-ai', 'screen-label')}
      >
        <VerbConsole />
      </section>

      <section className={`frame ${page.section}`} aria-labelledby="verbs-title">
        <div className={page.sectionHead}>
          <p className={page.kicker}>{field('site-ai-verbs', 'kicker')}</p>
          <h2 id="verbs-title" className={page.h2}>
            {field('site-ai-verbs', 'headline')}
          </h2>
        </div>
        <div className={styles.verbs} ref={rows} data-io>
          {verbs.map(([verb, text], i) => (
            <article
              key={verb}
              className={`${styles.verb} io-rise`}
              style={{ '--c': VERB_COLOR[verb], '--i': i } as CSSProperties}
            >
              <h3 className={styles.verbName}>{verb}</h3>
              <p className={styles.verbText}>{text}</p>
              {verb === 'command' && (
                <div className={styles.sample}>
                  <Code
                    sample="site-sample-command"
                    caption={field('site-ai-verbs', 'sample-caption')}
                    label={field('site-tour', 'verbatim')}
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className={`frame ${page.section}`}>
        <div className={styles.pair}>
          <div className={styles.card} aria-labelledby="manifest-title" role="group">
            <PixelIcon name="doc" scale={4} className={styles.cardIcon} />
            <p className={page.kicker}>{field('site-ai-manifest', 'kicker')}</p>
            <h2 id="manifest-title" className={styles.cardTitle}>
              {field('site-ai-manifest', 'headline')}
            </h2>
            <Prose id="site-ai-manifest" className={page.prose} />
          </div>
          <div className={styles.card} aria-labelledby="door-title" role="group">
            <PixelIcon name="key" scale={4} className={styles.cardIcon} />
            <p className={page.kicker}>{field('site-ai-door', 'kicker')}</p>
            <h2 id="door-title" className={styles.cardTitle}>
              {field('site-ai-door', 'headline')}
            </h2>
            <Prose id="site-ai-door" className={page.prose} />
          </div>
        </div>
      </section>

      <section className={`frame ${page.section}`} aria-labelledby="road-title">
        <div className={styles.road}>
          <p className={styles.roadTag}>
            <PixelIcon name="flag" scale={2} />
            {field('site-ai-road', 'kicker')}
          </p>
          <h2 id="road-title" className={page.h2}>
            {field('site-ai-road', 'headline')}
          </h2>
          <Prose id="site-ai-road" className={page.prose} />
          <Link className="more" to={sitePagePath('roadmap')}>
            {field('site-road', 'roadmap-link')}
            <span className="more-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
