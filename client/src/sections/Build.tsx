import { CodeSample } from '../components/CodeSample';
import { Reveal } from '../components/Reveal';
import { field, section, splitLead } from '../content';
import { Inline } from '../content/inline';
import styles from './Build.module.css';

export function Build() {
  const s = section('build');
  const steps = s.blocks.find((b) => b.type === 'ol');
  const code = s.blocks.find((b) => b.type === 'code');
  const commit = field('build', 'sample-commit').slice(0, 7);
  return (
    <section id="build" className="section" aria-labelledby="build-title">
      <div className="column">
        <Reveal className="section-head" wipe>
          <h2 id="build-title">{field('build', 'headline')}</h2>
        </Reveal>
      </div>
      <div className={`breakout ${styles.layout}`}>
        <ol className={styles.steps}>
          {steps?.type === 'ol' &&
            steps.items.map((item, i) => {
              const { lead, rest } = splitLead(item);
              return (
                <Reveal as="li" key={lead} className={styles.step} delay={i * 90}>
                  <span className={styles.num} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className={styles.lead}>{lead}</h3>
                    <p>
                      <Inline text={rest} />
                    </p>
                  </div>
                </Reveal>
              );
            })}
        </ol>
        <Reveal className={styles.code} delay={200}>
          {code?.type === 'code' && (
            <CodeSample
              lang={code.lang}
              text={code.text}
              caption={`${field('build', 'sample-caption')} · ${commit}`}
            />
          )}
          <p className={`small ${styles.footnote}`}>
            <Inline text={field('build', 'footnote')} />
          </p>
        </Reveal>
      </div>
    </section>
  );
}
