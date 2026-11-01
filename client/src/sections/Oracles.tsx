import { Body } from '../components/Body';
import { Reveal } from '../components/Reveal';
import { field, section, splitList } from '../content';
import styles from './Oracles.module.css';

export function Oracles() {
  const s = section('oracles');
  const refs = splitList(field('oracles', 'references'));
  return (
    <section id="oracles" className="section" aria-labelledby="oracles-title">
      <div className="column">
        <Reveal className="section-head">
          <h2 id="oracles-title">{field('oracles', 'headline')}</h2>
        </Reveal>
        <Reveal delay={80}>
          <Body blocks={s.blocks} skip={['field']} />
        </Reveal>
        <Reveal as="ul" className={styles.refs} delay={160} aria-label="Reference tools">
          {refs.map((r, i) => (
            <li key={r} className={styles.ref} style={{ '--i': i } as React.CSSProperties}>
              {r}
            </li>
          ))}
        </Reveal>
        <Reveal delay={220}>
          <p className={`small ${styles.small}`}>{field('oracles', 'small')}</p>
        </Reveal>
      </div>
    </section>
  );
}
