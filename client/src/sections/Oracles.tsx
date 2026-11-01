import { Body } from '../components/Body';
import { Reveal } from '../components/Reveal';
import { field, section, splitList } from '../content';
import styles from './Oracles.module.css';

// The reference tools as plain mono text in a slow marquee (no logos). The list is duplicated once
// for a seamless loop; the copy is hidden from assistive tech, and reduced motion gets a static row.
export function Oracles() {
  const s = section('oracles');
  const refs = splitList(field('oracles', 'references'));
  return (
    <section id="oracles" className={`section ${styles.oracles}`} aria-labelledby="oracles-title">
      <div className="column">
        <Reveal className="section-head" wipe>
          <h2 id="oracles-title">{field('oracles', 'headline')}</h2>
        </Reveal>
        <Reveal delay={80}>
          <Body blocks={s.blocks} skip={['field']} />
        </Reveal>
      </div>
      <Reveal className={styles.marquee} delay={160}>
        <ul className={styles.track} aria-label="Reference tools">
          {refs.map((r) => (
            <li key={r} className={styles.ref}>
              {r}
            </li>
          ))}
        </ul>
        <ul className={`${styles.track} ${styles.copy}`} aria-hidden="true">
          {refs.map((r) => (
            <li key={r} className={styles.ref}>
              {r}
            </li>
          ))}
        </ul>
      </Reveal>
      <div className="column">
        <Reveal delay={220}>
          <p className={`small ${styles.small}`}>{field('oracles', 'small')}</p>
        </Reveal>
      </div>
    </section>
  );
}
