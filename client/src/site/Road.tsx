import type { CSSProperties } from 'react';
import { field } from '../content';
import { rows } from './data';
import { reveal } from './motion';
import styles from './Road.module.css';

const S = 'site-road';

// The road: three stops (now, next, then), a line each, no dates, the first one lit. Direction only;
// internal work in progress never appears here. On the home page's status board and on /roadmap
// (`size="page"`, the larger cut).
export function Road({ size = 'board', titleId }: { size?: 'board' | 'page'; titleId?: string }) {
  const stops = rows(S, 'stops');
  const Head = size === 'page' ? 'h2' : 'h3';
  return (
    <div className={styles.road} data-size={size}>
      <Head id={titleId} className={styles.head}>
        {field(S, 'label')}
      </Head>
      <ol className={styles.stops} ref={reveal}>
        {stops.map(([when = '', name = '', what = ''], i) => (
          <li
            key={name}
            className={styles.stop}
            data-now={i === 0 ? '' : undefined}
            style={{ '--n': i } as CSSProperties}
          >
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.when}>{when}</span>
            <span className={styles.name}>{name}</span>
            <span className={styles.what}>{what}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
