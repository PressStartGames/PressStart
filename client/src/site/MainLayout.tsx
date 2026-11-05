import { Link, NavLink, Outlet } from 'react-router';
import { CookieSettings } from '../components/CookieSettings';
import { field, splitList } from '../content';
import type { SitePageId } from '../content/schema';
import { BASE, FLAGS } from '../lib/config';
import { sitePagePath } from '../routes';
import styles from './site.module.css';

// The nav's labels in CONTENT.md map, in order, to these pages.
const NAV_PAGES: readonly SitePageId[] = [
  'engine',
  'showcase',
  'roadmap',
  'learn',
  'news',
  'licensing',
  'about',
  'community',
];
const LEGAL_PAGES: readonly SitePageId[] = ['privacy', 'terms', 'cookies'];

// Placeholder frame for the main site; phase 2 designs it (see ./index.tsx).
export function MainLayout() {
  const nav = splitList(field('site-header', 'nav'), '|');
  const legal = splitList(field('site-footer', 'legal'), '|');
  const wordmark = field('site-header', 'wordmark');
  const joinBeta = FLAGS.joinBeta && (
    <a className={styles.cta} href={`${BASE}beta/`}>
      {field('site-header', 'cta')}
    </a>
  );
  return (
    <div className={styles.shell}>
      <a href="#main" className="skip-link">
        {field('site-header', 'skip')}
      </a>
      <header className={styles.header}>
        <div className={`frame ${styles.bar}`}>
          <Link to="/" className={styles.wordmark} aria-label={`${wordmark}, home`}>
            <span className="led" aria-hidden="true" />
            {wordmark}
          </Link>
          <nav className={styles.nav} aria-label={field('site-header', 'nav-label')}>
            {NAV_PAGES.map((id, i) => (
              <NavLink key={id} to={sitePagePath(id)}>
                {nav[i] ?? id}
              </NavLink>
            ))}
          </nav>
          {joinBeta}
        </div>
      </header>
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer} aria-label={field('site-footer', 'label')}>
        <div className={`frame ${styles.footerInner}`}>
          <p className="mono">{field('site-footer', 'line')}</p>
          <ul className={styles.legal}>
            {LEGAL_PAGES.map((id, i) => (
              <li key={id}>
                <Link to={sitePagePath(id)}>{legal[i] ?? id}</Link>
              </li>
            ))}
            <CookieSettings item />
          </ul>
        </div>
      </footer>
    </div>
  );
}
