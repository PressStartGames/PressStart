import type { CSSProperties } from 'react';
import { field } from '../../content';
import { rows } from '../data';
import { reveal } from '../motion';
import ui from '../ui.module.css';
import styles from './Audience.module.css';

const S = 'site-home-audience';

// Who it is for: four audiences, one line each, as player-select slots.
export function Audience() {
  const items = rows(S, 'items');
  return (
    <section className={`${ui.section} ${styles.audience}`} aria-labelledby="audience-title">
      <div className="frame">
        <p className={ui.kicker}>{field(S, 'kicker')}</p>
        <h2 id="audience-title" className={ui.h2}>
          {field(S, 'headline')}
        </h2>
        <ul className={styles.list}>
          {items.map(([who = '', why = ''], i) => (
            <li
              key={who}
              className={styles.item}
              data-reveal=""
              ref={reveal}
              style={{ '--d': `${i * 90}ms` } as CSSProperties}
            >
              <span className={styles.slot} aria-hidden="true">
                P{i + 1}
              </span>
              <span className={styles.who}>{who}</span>
              <span className={styles.why}>{why}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
