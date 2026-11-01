import { Body } from '../components/Body';
import { Reveal } from '../components/Reveal';
import { Screen } from '../components/Screen';
import { field, section } from '../content';
import { rows } from '../lib/sim';
import styles from './Determinism.module.css';

// The statement, and the ledger again, still: a small screen with the first six checksum rows.
export function Determinism({ index, label }: { index: string; label: string }) {
  const s = section('determinism');
  const list = rows().slice(0, 6);
  return (
    <section id="determinism" className="section" aria-labelledby="determinism-title">
      <div className="frame row">
        <div className="spine">
          <span className="spine-index">{index}</span>
          <span className="spine-label">{label}</span>
        </div>
        <div className={styles.grid}>
          <Reveal className={styles.copy}>
            <h2 id="determinism-title">{field('determinism', 'headline')}</h2>
            <div className={`measure ${styles.body}`}>
              <Body blocks={s.blocks} fieldsAs={{ subhead: 'h3' }} />
            </div>
          </Reveal>
          <Reveal className={styles.screenWrap} delay={120}>
            <Screen label={field('hero', 'replay-label')} readout={`${list.length} ticks`}>
              <div
                className={styles.ledger}
                role="region"
                aria-label={field('determinism', 'headline')}
                tabIndex={0}
              >
                <div className={styles.head} aria-hidden="true">
                  <span>tick</span>
                  <span>run A</span>
                  <span>run B</span>
                  <span />
                </div>
                {list.map((r) => (
                  <div key={r.tick} className={styles.row}>
                    <span className={styles.tick}>{String(r.tick).padStart(3, '0')}</span>
                    <span className={styles.hash}>{r.a}</span>
                    <span className={styles.hash}>{r.b}</span>
                    <span className={styles.eq} aria-label="matches">
                      =
                    </span>
                  </div>
                ))}
              </div>
            </Screen>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
