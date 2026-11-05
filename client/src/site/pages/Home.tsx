import { Link } from 'react-router';
import { field, splitList } from '../../content';
import { BASE, FLAGS } from '../../lib/config';
import { sitePagePath } from '../../routes';
import styles from '../site.module.css';
import { Page } from './Page';

// Placeholder home; phase 2 designs it.
export function Home() {
  const [join = '', engine = ''] = splitList(field('site-home', 'cta'), '|');
  return (
    <Page id="site-home">
      <p className={styles.actions}>
        {FLAGS.joinBeta && (
          <a className={styles.cta} href={`${BASE}beta/`}>
            {join}
          </a>
        )}
        <Link className={styles.link} to={sitePagePath('engine')}>
          {engine}
        </Link>
      </p>
    </Page>
  );
}
