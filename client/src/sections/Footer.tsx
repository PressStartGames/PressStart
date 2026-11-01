import { Link } from 'react-router';
import { field, splitList } from '../content';
import { REPO_URL } from '../lib/config';
import styles from './Footer.module.css';

// The bottom plate. Items with no destination yet (Discord, contact) render as plain text.
export function Footer() {
  const items = splitList(field('footer', 'links'));
  const wordmark = field('header', 'wordmark');
  return (
    <footer className={styles.footer} aria-label="Footer">
      <div className="frame">
        <ul className={styles.links}>
          {items.map((item) => {
            let node: React.ReactNode = <span>{item}</span>;
            if (item === wordmark) {
              node = (
                <Link to="/" className={styles.wordmark}>
                  <span className="led" aria-hidden="true" />
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
              node = <span title={field('footer', 'licence-stub')}>{item}</span>;
            }
            return <li key={item}>{node}</li>;
          })}
        </ul>
        <p className={`mono ${styles.line}`}>{field('footer', 'licence-stub')}</p>
      </div>
    </footer>
  );
}
