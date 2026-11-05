import { Link } from 'react-router';
import { field } from '../../content';
import ui from '../ui.module.css';
import styles from './Page.module.css';
import { PageHead } from './PageHead';

// Anything unknown outside /beta (prerendered to 404.html). The footer's site map lists every page.
export function NotFound() {
  return (
    <PageHead id="site-not-found">
      <p className={styles.actions}>
        <Link className={`${ui.btn} ${ui.primary}`} to="/">
          {field('site-not-found', 'cta')}
        </Link>
      </p>
    </PageHead>
  );
}
