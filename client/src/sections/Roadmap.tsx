import type { CSSProperties } from 'react';
import { Reveal } from '../components/Reveal';
import { field, section, splitLead } from '../content';
import { Inline } from '../content/inline';
import styles from './Roadmap.module.css';

// Stage markers on a rail: the first LED is lit. No dates.
export function Roadmap({ index, label }: { index: string; label: string }) {
  const s = section('roadmap');
  const intro = s.blocks.find((b) => b.type === 'p');
  const stops = s.blocks.find((b) => b.type === 'ol');
  const subheadIndex = s.blocks.findIndex((b) => b.type === 'field' && b.key === 'subhead');
  const after = s.blocks.slice(subheadIndex + 1).find((b) => b.type === 'p');
  const items = stops?.type === 'ol' ? stops.items : [];
  return (
    <section id="roadmap" className="section" aria-labelledby="roadmap-title">
      <div className="frame row">
        <div className="spine">
          <span className="spine-index">{index}</span>
          <span className="spine-label">{label}</span>
        </div>
        <div>
          <Reveal className={styles.copy}>
            <h2 id="roadmap-title">{field('roadmap', 'headline')}</h2>
            {intro?.type === 'p' && (
              <p className={`measure ${styles.intro}`}>
                <Inline text={intro.text} />
              </p>
            )}
          </Reveal>
          <Reveal
            as="ol"
            className={styles.rail}
            delay={100}
            style={{ '--n': items.length } as CSSProperties}
          >
            {items.map((item, i) => {
              const { lead, rest } = splitLead(item);
              const current = i === 0;
              return (
                <li
                  key={lead}
                  className={styles.stop}
                  data-current={current || undefined}
                  aria-current={current ? 'step' : undefined}
                  style={{ '--i': i } as CSSProperties}
                >
                  <span className={styles.marker} aria-hidden="true">
                    <span className={current ? 'led' : styles.dot} />
                  </span>
                  <span className={styles.stopNo}>
                    {String(i + 1).padStart(2, '0')}
                    {current && <span className={styles.now}>{field('roadmap', 'now-label')}</span>}
                  </span>
                  <h3 className={styles.lead}>{lead}</h3>
                  <p className={styles.rest}>
                    <Inline text={rest} />
                  </p>
                </li>
              );
            })}
          </Reveal>
          <Reveal className={styles.beta} delay={160}>
            <h3>{field('roadmap', 'subhead')}</h3>
            {after?.type === 'p' && (
              <p className="measure">
                <Inline text={after.text} />
              </p>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
