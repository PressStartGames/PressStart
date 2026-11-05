import type { CSSProperties } from 'react';
import { counts, field } from '../../content';
import { list, pairs, paragraphs } from '../text';
import ui from '../ui.module.css';
import styles from './Numbers.module.css';

const ID = 'site-numbers';

// The synced counts as four big tiles (they count up once in view on desktop) and the catalog as one
// stacked bar: built, partly built, skipped, not yet. Every value comes from data/counts.json.
export function Numbers({ label }: { label?: string }) {
  const c = counts.catalog;
  const rest = c.total - c.built - c.partial - c.skip;
  const segs = [c.built, c.partial, c.skip, rest];
  const legend = list(ID, 'bar-legend');
  return (
    <div className={styles.numbers}>
      <div className={styles.head}>
        <p className={`${ui.plate} rv`}>{label ?? field(ID, 'label')}</p>
        <h2 id="numbers-title" className={styles.title} data-m="words">
          {field(ID, 'headline')}
        </h2>
        <p className={`${styles.lede} rv`}>{paragraphs(ID)[0]}</p>
      </div>
      <ul className={styles.tiles} data-m="count">
        {pairs(ID, 'tiles').map((t, i) => (
          <li key={t.value} className="rv" style={{ '--d': `${i * 80}ms` } as CSSProperties}>
            <span className={styles.big} data-count={t.key}>
              {t.key}
            </span>
            <span className={styles.what}>{t.value}</span>
          </li>
        ))}
      </ul>
      <figure className={`${styles.bar} rv`} data-m="bar">
        <figcaption className={styles.barLabel}>
          <span>{field(ID, 'bar-label')}</span>
          <span className={styles.total}>{c.total}</span>
        </figcaption>
        <div className={styles.track}>
          {segs.map((n, i) => (
            <span
              key={legend[i] ?? i}
              className={styles.seg}
              data-seg
              data-kind={i}
              style={{ flexGrow: n }}
            />
          ))}
        </div>
        <ul className={styles.legend}>
          {segs.map((n, i) => (
            <li key={legend[i] ?? i} data-kind={i}>
              <b>{n}</b> {legend[i]}
            </li>
          ))}
        </ul>
      </figure>
    </div>
  );
}
