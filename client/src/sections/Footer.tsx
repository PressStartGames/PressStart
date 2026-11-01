import { Link } from 'react-router';
import { field, splitList } from '../content';
import { REPO_URL } from '../lib/config';
import styles from './Footer.module.css';

// The footer's link list comes from CONTENT.md ("Press Start · © 2026 · Licence · Privacy · GitHub ·
// Discord · contact"). Items with no destination yet (Discord, contact: PLAN.md §10 question 7)
// render as plain text, never as a dead link.
export function Footer() {
  const items = splitList(field('footer', 'links'));
  const wordmark = field('header', 'wordmark');
  return (
    <footer className={`section ${styles.footer}`} aria-label="Footer">
      <div className="column">
        <ul className={styles.links}>
          {items.map((item) => {
            let node: React.ReactNode = <span className={styles.plain}>{item}</span>;
            if (item === wordmark) {
              node = (
                <Link to="/" className={styles.wordmark}>
                  {item}
                </Link>
              );
            } else if (item === 'Privacy') {
              node = <Link to="/privacy">{item}</Link>;
            } else if (item === 'GitHub') {
              node = (
                <a href={REPO_URL} rel="noopener">
                  {item}
                </a>
              );
            } else if (item === 'Licence') {
              node = (
                <span className={styles.plain} title={field('footer', 'licence-stub')}>
                  {item}
                </span>
              );
            } else if (item === 'Discord' || item === 'contact') {
              node = <span className={styles.pending}>{item}</span>;
            }
            return <li key={item}>{node}</li>;
          })}
        </ul>
        <p className={`small ${styles.line}`}>{field('footer', 'licence-stub')}</p>
        <p className={`small ${styles.line}`}>{field('footer', 'small')}</p>
      </div>
    </footer>
  );
}
