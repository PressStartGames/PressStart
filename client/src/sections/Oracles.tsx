import { Body } from '../components/Body';
import { Reveal } from '../components/Reveal';
import { Screen } from '../components/Screen';
import { field, section, splitList } from '../content';
import styles from './Oracles.module.css';

// Attract mode: the reference tools scroll across a slim screen, one line, phosphor. The list is
// doubled for a seamless loop; the copy is hidden from assistive tech; reduced motion gets a static row.
export function Oracles({ index, label }: { index: string; label: string }) {
  const s = section('oracles');
  const refs = splitList(field('oracles', 'references'));
  const line = refs.map((r) => r.toUpperCase());
  return (
    <section id="oracles" className="section" aria-labelledby="oracles-title">
      <div className="frame row">
        <div className="spine">
          <span className="spine-index">{index}</span>
          <span className="spine-label">{label}</span>
        </div>
        <div>
          <Reveal className={styles.copy}>
            <h2 id="oracles-title" className={styles.title}>
              {field('oracles', 'headline')}
            </h2>
            <div className={`measure ${styles.body}`}>
              <Body blocks={s.blocks} skip={['field']} />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Screen label={field('oracles', 'attract-label')} readout={`${refs.length} tools`}>
              <div className={styles.attract}>
                <ul className={styles.track} aria-label={field('oracles', 'attract-label')}>
                  {line.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <ul className={`${styles.track} ${styles.copyTrack}`} aria-hidden="true">
                  {line.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            </Screen>
            <p className={`small ${styles.small}`}>{field('oracles', 'small')}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
