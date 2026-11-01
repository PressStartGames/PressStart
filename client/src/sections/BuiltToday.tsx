import type { CSSProperties } from 'react';
import { Body } from '../components/Body';
import { NumberTile } from '../components/NumberTile';
import { Reveal } from '../components/Reveal';
import { counts, field, section, splitList } from '../content';
import { Inline } from '../content/inline';
import styles from './BuiltToday.module.css';

// "404 entries in the catalog" -> { value: 404, label: "entries in the catalog" }
function tile(text: string): { value: number; label: string } {
  const m = /^(\d+)\s+(.*)$/.exec(text);
  return { value: Number(m?.[1] ?? 0), label: m?.[2] ?? text };
}

export function BuiltToday() {
  const s = section('built');
  const tiles = splitList(field('built', 'tiles')).map(tile);
  const legend = splitList(field('built', 'bar-legend'), '|');
  const { total, built, partial, skip } = counts.catalog;
  const rest = total - built - partial - skip;
  const segments = [
    { n: built, cls: styles.segBuilt },
    { n: partial, cls: styles.segPartial },
    { n: skip, cls: styles.segSkip },
    { n: rest, cls: styles.segRest },
  ];
  return (
    <section id="built" className="section" aria-labelledby="built-title">
      <div className="column">
        <Reveal className="section-head" wipe>
          <h2 id="built-title">{field('built', 'headline')}</h2>
        </Reveal>
      </div>
      <Reveal className={`breakout ${styles.tiles}`} delay={60}>
        {tiles.map((t, i) => (
          <NumberTile key={t.label} value={t.value} label={t.label} accent={i === 1} />
        ))}
      </Reveal>
      <div className="column">
        <Reveal className={styles.barWrap} delay={140}>
          <div
            className={styles.bar}
            role="img"
            aria-label={
              segments.map((seg, i) => `${legend[i] ?? ''} ${seg.n}`).join(', ') + ` of ${total}`
            }
          >
            {segments.map((seg, i) => (
              <span
                key={i}
                className={`${styles.seg} ${seg.cls}`}
                style={{ '--w': `${(seg.n / total) * 100}%`, '--i': i } as CSSProperties}
              />
            ))}
          </div>
          <ul className={styles.legend} aria-hidden="true">
            {segments.map((seg, i) => (
              <li key={i} className={styles.legendItem}>
                <span className={`${styles.swatch} ${seg.cls}`} />
                {legend[i]} <b>{seg.n}</b>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={200} className={styles.text}>
          <Body blocks={s.blocks} skip={['field']} />
          <p className={styles.proof}>
            <Inline text={field('built', 'proof')} />
          </p>
          <p className={`mono ${styles.synced}`}>
            synced {counts.syncedAt} · engine {counts.engineCommit.slice(0, 7)}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
