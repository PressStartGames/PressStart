import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import { sitePagePath } from '../../routes';
import { pad, pairs } from '../text';
import ui from '../ui.module.css';
import styles from './Verbs.module.css';

const ID = 'site-verbs';

// The four verbs a running game answers, set as four giant words with one line each.
export function Verbs() {
  return (
    <section className={`act-light ${styles.section}`} aria-labelledby="verbs-title">
      <div className="frame">
        <div className={styles.head}>
          <p className={`${ui.plate} rv`}>{field(ID, 'label')}</p>
          <h2 id="verbs-title" className={styles.title} data-m="words">
            {field(ID, 'headline')}
          </h2>
        </div>
        <ol className={styles.verbs}>
          {pairs(ID, 'verbs').map((v, i) => (
            <li key={v.key} className="rv" style={{ '--d': `${i * 90}ms` } as CSSProperties}>
              <span className={styles.n}>{pad(i + 1)}</span>
              <span className={styles.verb}>{v.key}</span>
              <span className={styles.line}>{v.value}</span>
            </li>
          ))}
        </ol>
        <Link className={`${ui.arrow} ${styles.link} rv`} to={sitePagePath('engine-ai')}>
          {field(ID, 'link')}
        </Link>
      </div>
    </section>
  );
}
