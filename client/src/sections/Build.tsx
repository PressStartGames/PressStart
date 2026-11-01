import { useRef } from 'react';
import { CodeSample } from '../components/CodeSample';
import { Reveal } from '../components/Reveal';
import { field, section, splitLead } from '../content';
import { Inline } from '../content/inline';
import { useActiveStep } from '../lib/useActiveStep';
import styles from './Build.module.css';

// The procedure: five numbered steps down the left, the code screen pinned on the right; the step
// nearest the middle of the viewport is lit.
export function Build({ index, label }: { index: string; label: string }) {
  const s = section('build');
  const steps = s.blocks.find((b) => b.type === 'ol');
  const code = s.blocks.find((b) => b.type === 'code');
  const commit = field('build', 'sample-commit').slice(0, 7);
  const listRef = useRef<HTMLOListElement>(null);
  const items = steps?.type === 'ol' ? steps.items : [];
  const active = useActiveStep(listRef, items.length);
  return (
    <section id="build" className="section" aria-labelledby="build-title">
      <div className="frame row">
        <div className="spine">
          <span className="spine-index">{index}</span>
          <span className="spine-label">{label}</span>
        </div>
        <div>
          <Reveal>
            <h2 id="build-title" className={styles.title}>
              {field('build', 'headline')}
            </h2>
          </Reveal>
          <div className={styles.grid}>
            <div>
              <p className="label">{field('build', 'procedure-label')}</p>
              <ol className={styles.steps} ref={listRef}>
                {items.map((item, i) => {
                  const { lead, rest } = splitLead(item);
                  return (
                    <li key={lead} className={styles.step} data-active={i === active || undefined}>
                      <span className={styles.stepNo}>{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h3 className={styles.lead}>{lead}</h3>
                        <p className={styles.rest}>
                          <Inline text={rest} />
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
            <Reveal className={styles.code} delay={120}>
              {code?.type === 'code' && (
                <CodeSample
                  lang={code.lang}
                  text={code.text}
                  caption={`${field('build', 'sample-caption')} · ${commit}`}
                />
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
