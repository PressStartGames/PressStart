import { Link } from 'react-router';
import { field, section } from '../../content';
import { CatalogBoard } from '../CatalogBoard';
import { href } from '../data';
import { Road } from '../Road';
import ui from '../ui.module.css';
import styles from './Status.module.css';

const S = 'site-home-status';

// Where we are: the catalog by area (synced) and the road's three stops, direction only, no dates.
export function Status() {
  const body = section(S).blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []));
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
          <div>
            <Road />
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
