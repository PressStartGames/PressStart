import type { CSSProperties } from 'react';
import { counts, field } from '../content';
import styles from './CatalogBoard.module.css';
import { list, rows } from './data';
import { reveal } from './motion';

const KINDS = ['built', 'partial', 'skip', 'rest'] as const;

// The engine's catalog by area, synced from counts.json: one stacked bar per area (built, partial,
// skipped, not yet) and the totals line. Used by the home page's status board and by /engine.
export function CatalogBoard() {
  const labels = new Map(rows('site-home-status', 'areas').map(([id = '', l = '']) => [id, l]));
  const legend = list('site-home-status', 'legend');
  const areas = counts.catalog.areas
    .map((a) => ({ ...a, rest: a.total - a.built - a.partial - a.skip }))
    .sort((x, y) => y.built / y.total - x.built / x.total); // a fresh array from map()
  return (
    <div className={styles.board} ref={reveal}>
      <ul className={styles.legend} aria-hidden="true">
        {KINDS.map((k, i) => (
          <li key={k} data-kind={k}>
            {legend[i]}
          </li>
        ))}
      </ul>
      <ul className={styles.areas}>
        {areas.map((a, i) => {
          const [name = a.id, what = ''] = (labels.get(a.id) ?? a.id).split(' · ');
          return (
            <li key={a.id} className={styles.area} style={{ '--n': i } as CSSProperties}>
              <span className={styles.name}>
                {name}
                <span className={styles.what}>{what}</span>
              </span>
              <span className={styles.bar} aria-hidden="true">
                {KINDS.map((k) =>
                  a[k] > 0 ? <span key={k} data-kind={k} style={{ flexGrow: a[k] }} /> : null,
                )}
              </span>
              <span className={styles.count}>
                <strong>{a.built}</strong> / {a.total} {legend[0]}
              </span>
            </li>
          );
        })}
      </ul>
      <p className={styles.total}>{field('site-home-status', 'total')}</p>
    </div>
  );
}
