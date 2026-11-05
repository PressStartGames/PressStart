import { Link } from 'react-router';
import { field } from '../../content';
import styles from '../site.module.css';
import { Page } from './Page';

export function NotFound() {
  return (
    <Page id="site-not-found">
      <p className={styles.actions}>
        <Link className={styles.link} to="/">
          {field('site-not-found', 'cta')}
        </Link>
      </p>
    </Page>
  );
}
