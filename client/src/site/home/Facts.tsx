import type { CSSProperties } from 'react';
import { field } from '../../content';
import { rows } from '../data';
import { countUp, reveal } from '../motion';
import styles from './Facts.module.css';

// The synced counts, each with what it means. Numbers come from counts.json through CONTENT.md.
export function Facts() {
  const items = rows('site-home-facts', 'items');
  return (
    <section className={styles.facts} aria-labelledby="facts-title">
      <div className="frame">
        <h2 id="facts-title" className={styles.label}>
          {field('site-home-facts', 'label')}
        </h2>
        <ul className={styles.list}>
          {items.map(([n = '', label = '', note = ''], i) => (
            <li
              key={label}
              className={styles.item}
              data-reveal=""
              ref={reveal}
              style={{ '--d': `${i * 90}ms` } as CSSProperties}
            >
              <span className={styles.n} ref={countUp}>
                {n}
              </span>
              <span className={styles.what}>{label}</span>
              <span className={styles.note}>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
