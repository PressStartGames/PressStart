import { field } from '../../../content';
import { pairs } from '../../text';
import styles from './Visuals.module.css';

const ID = 'site-strength-oracles';

// Held against: each subsystem beside the reference tools it is measured against, names as plain mono
// text (never logos), and the line that says what happens where we differ.
export function Board() {
  const rows = pairs(ID, 'rows');
  return (
    <figure className={styles.screen}>
      <figcaption className={styles.plate}>
        <span>{field(ID, 'screen')}</span>
      </figcaption>
      <ul className={styles.board}>
        {rows.map((r, i) => (
          <li key={r.key} data-at={i / (rows.length + 1)}>
            <span className={styles.sub}>{r.key}</span>
            <span className={styles.leader} aria-hidden="true" />
            <span className={styles.ref}>{r.value}</span>
          </li>
        ))}
      </ul>
      <p className={styles.diff} data-at={1}>
        {field(ID, 'diff')}
      </p>
    </figure>
  );
}
