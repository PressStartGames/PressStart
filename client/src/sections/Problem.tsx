import type { CSSProperties } from 'react';
import { Body } from '../components/Body';
import { Reveal } from '../components/Reveal';
import { Screen } from '../components/Screen';
import { field, section, splitList } from '../content';
import styles from './Problem.module.css';

// A diagnostic: the old loop as a trace log on a screen. The last step has no measurement, and the
// trace says so.
export function Problem({ index, label }: { index: string; label: string }) {
  const s = section('problem');
  const trace = splitList(field('problem', 'trace'), '|');
  return (
    <section id="problem" className="section" aria-labelledby="problem-title">
      <div className="frame row">
        <div className="spine">
          <span className="spine-index">{index}</span>
          <span className="spine-label">{label}</span>
        </div>
        <div className={styles.grid}>
          <Reveal className={styles.copy}>
            <h2 id="problem-title">{field('problem', 'headline')}</h2>
            <div className={`measure ${styles.body}`}>
              <Body blocks={s.blocks} skip={['field']} />
            </div>
          </Reveal>
          <Reveal className={styles.screenWrap} delay={120}>
            <Screen label={field('problem', 'trace-label')} readout="run 1 of 1">
              <ol className={styles.trace}>
                {trace.map((step, i) => {
                  const last = i === trace.length - 1;
                  return (
                    <li
                      key={step}
                      className={`${styles.step} ${last ? styles.stepLast : ''}`}
                      style={{ '--i': i } as CSSProperties}
                    >
                      <span className={styles.stepNo}>{String(i + 1).padStart(2, '0')}</span>
                      <span className={styles.stepName}>{step}</span>
                      <span className={styles.stepValue}>{last ? '?' : 'ok'}</span>
                    </li>
                  );
                })}
              </ol>
            </Screen>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
