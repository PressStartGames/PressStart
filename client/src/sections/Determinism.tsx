import { Body } from '../components/Body';
import { Reveal } from '../components/Reveal';
import { field, replay, section } from '../content';
import styles from './Determinism.module.css';

// The hero's component, static: a tick ruler with two identical checksum columns.
export function Determinism() {
  const s = section('determinism');
  const rows = replay.rows.slice(0, 6);
  return (
    <section id="determinism" className="section" aria-labelledby="determinism-title">
      <div className="column">
        <Reveal className="section-head" wipe>
          <h2 id="determinism-title">{field('determinism', 'headline')}</h2>
        </Reveal>
        <Reveal delay={80} className={styles.body}>
          <Body blocks={s.blocks} fieldsAs={{ subhead: 'h3' }} />
        </Reveal>
        <Reveal
          className={styles.ruler}
          delay={160}
          role="region"
          aria-label={field('determinism', 'headline')}
          tabIndex={0}
        >
          <div className={styles.rulerHead} aria-hidden="true">
            <span>tick</span>
            <span>run A</span>
            <span>run B</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.tick}
              className={styles.rulerRow}
              style={{ '--i': i } as React.CSSProperties}
            >
              <span className={styles.tick}>{String(r.tick).padStart(3, '0')}</span>
              <span className={styles.hash}>{r.a}</span>
              <span className={styles.hash}>{r.b}</span>
              <span className={styles.eq} aria-label="matches">
                =
              </span>
            </div>
          ))}
          <p className={`small ${styles.note}`}>{field('hero', 'replay-caption')}</p>
        </Reveal>
      </div>
    </section>
  );
}
