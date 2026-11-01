import type { CSSProperties } from 'react';
import { Reveal } from '../components/Reveal';
import { field, section, splitLead } from '../content';
import { Inline } from '../content/inline';
import styles from './Roadmap.module.css';

// A vertical four-stop line, the current stop lit, no dates.
export function Roadmap() {
  const s = section('roadmap');
  const intro = s.blocks.find((b) => b.type === 'p');
  const stops = s.blocks.find((b) => b.type === 'ol');
  const subheadIndex = s.blocks.findIndex((b) => b.type === 'field' && b.key === 'subhead');
  const after = s.blocks.slice(subheadIndex + 1).find((b) => b.type === 'p');
  return (
    <section id="roadmap" className="section" aria-labelledby="roadmap-title">
      <div className="column">
        <Reveal className="section-head" wipe>
          <h2 id="roadmap-title">{field('roadmap', 'headline')}</h2>
        </Reveal>
        {intro?.type === 'p' && (
          <Reveal delay={80}>
            <p>
              <Inline text={intro.text} />
            </p>
          </Reveal>
        )}
        <Reveal as="ol" className={styles.line} delay={160}>
          {stops?.type === 'ol' &&
            stops.items.map((item, i) => {
              const { lead, rest } = splitLead(item);
              const current = i === 0;
              return (
                <li
                  key={lead}
                  className={`${styles.stop} ${current ? styles.current : ''}`}
                  style={{ '--i': i } as CSSProperties}
                  aria-current={current ? 'step' : undefined}
                >
                  <span className={styles.dot} aria-hidden="true" />
                  <div className={styles.stopBody}>
                    <h3 className={styles.lead}>
                      {lead}
                      {current && (
                        <span className={styles.now}>{field('roadmap', 'now-label')}</span>
                      )}
                    </h3>
                    <p>
                      <Inline text={rest} />
                    </p>
                  </div>
                </li>
              );
            })}
        </Reveal>
        <Reveal delay={120} className={styles.beta}>
          <h3>{field('roadmap', 'subhead')}</h3>
          {after?.type === 'p' && (
            <p>
              <Inline text={after.text} />
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
