import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import { sitePagePath } from '../../routes';
import { pairs } from '../text';
import ui from '../ui.module.css';
import styles from './Road.module.css';

const ID = 'site-road';

// The road in order, no dates: the first stop is lit as "now", the rest wait on a dashed line.
export function Road() {
  const stops = pairs(ID, 'stops');
  return (
    <div className={styles.road}>
      <div className={styles.head}>
        <p className={`${ui.plate} rv`}>{field(ID, 'label')}</p>
        <h2 className={styles.title} data-m="words">
          {field(ID, 'headline')}
        </h2>
      </div>
      <ol className={styles.stops}>
        {stops.map((s, i) => (
          <li
            key={s.key}
            className="rv"
            data-now={i === 0 || undefined}
            style={{ '--d': `${i * 110}ms` } as CSSProperties}
          >
            <span className={styles.dot} aria-hidden="true" />
            <p className={styles.name}>
              {s.key}
              {i === 0 ? <span className={styles.now}>{field(ID, 'now')}</span> : null}
            </p>
            <p className={styles.what}>{s.value}</p>
          </li>
        ))}
      </ol>
      <Link className={`${ui.arrow} rv`} to={sitePagePath('roadmap')}>
        {field(ID, 'link')}
      </Link>
    </div>
  );
}
