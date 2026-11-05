import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { field, section } from '../../content';
import { CatalogBoard } from '../CatalogBoard';
import { href, rows } from '../data';
import { reveal } from '../motion';
import ui from '../ui.module.css';
import styles from './Status.module.css';

const S = 'site-home-status';

// Where we are, honestly: the catalog by area (synced) and the road in order, without dates.
export function Status() {
  const body = section(S).blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []));
  const road = rows(S, 'road');
  return (
    <section className={`${ui.section} ${styles.status}`} aria-labelledby="status-title">
      <div className="frame">
        <div className={styles.head}>
          <p className={ui.kicker}>{field(S, 'kicker')}</p>
          <h2 id="status-title" className={ui.h2}>
            {field(S, 'headline')}
          </h2>
          <div className={ui.lede}>
            {body.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
        </div>
        <div className={styles.grid}>
          <CatalogBoard />
          <div className={styles.road}>
            <h3 className={styles.roadHead}>{field(S, 'road-label')}</h3>
            <ol className={styles.stops} ref={reveal}>
              {road.map(([stop = '', what = ''], i) => (
                <li
                  key={stop}
                  className={styles.stop}
                  data-now={i === 0 ? '' : undefined}
                  style={{ '--n': i } as CSSProperties}
                >
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.stopName}>
                    {stop}
                    {i === 0 ? <span className={styles.now}>{field(S, 'now')}</span> : null}
                  </span>
                  <span className={styles.stopWhat}>{what}</span>
                </li>
              ))}
            </ol>
            <Link className={ui.textLink} to={href('roadmap')}>
              {field(S, 'link')}
              <span className={ui.arrow} aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
