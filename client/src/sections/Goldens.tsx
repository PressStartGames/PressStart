import { Body } from '../components/Body';
import { Reveal } from '../components/Reveal';
import { field, section } from '../content';
import styles from './Goldens.module.css';

// The contact sheet. Until M3 imports accepted goldens (with provenance rows), six empty crop
// frames carry the placeholder caption from CONTENT.md.
const PLACEHOLDER_COUNT = 6;

export function Goldens() {
  const s = section('goldens');
  return (
    <section id="goldens" className="section" aria-labelledby="goldens-title">
      <div className="column">
        <Reveal className="section-head">
          <h2 id="goldens-title">{field('goldens', 'headline')}</h2>
        </Reveal>
        <Reveal delay={80}>
          <Body blocks={s.blocks} skip={['field']} />
        </Reveal>
      </div>
      <Reveal as="ul" className={`breakout ${styles.sheet}`} delay={160} aria-label="Contact sheet">
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
          <li key={i} className={styles.cell} style={{ '--i': i } as React.CSSProperties}>
            <div className={styles.crop} aria-hidden="true">
              <span className={`${styles.corner} ${styles.tl}`} />
              <span className={`${styles.corner} ${styles.tr}`} />
              <span className={`${styles.corner} ${styles.bl}`} />
              <span className={`${styles.corner} ${styles.br}`} />
            </div>
            <span className={styles.caption}>{field('goldens', 'placeholder-caption')}</span>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
