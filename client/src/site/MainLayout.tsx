import { Link, NavLink, Outlet } from 'react-router';
import { counts, field, splitList } from '../content';
import type { SitePageId } from '../content/schema';
import { BASE, DISCORD_URL, FLAGS } from '../lib/config';
import { sitePagePath } from '../routes';
import styles from './Layout.module.css';
import { STRENGTHS } from './lib/strengths';
import ui from './ui/ui.module.css';

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
const PROJECT_PAGES: readonly SitePageId[] = ['roadmap', 'news', 'showcase', 'learn'];
const STUDIO_PAGES: readonly SitePageId[] = ['about', 'licensing', 'community'];

function NavLinks({ labels }: { labels: string[] }) {
  return (
    <ul className={styles.navList}>
      {NAV_PAGES.map((id, i) => (
        <li key={id}>
          <NavLink to={sitePagePath(id)} className={styles.navLink}>
            {labels[i] ?? id}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

// The frame of every main-site page: skip link, header (wordmark, nav, the beta button), <main>, footer.
export function MainLayout() {
  const nav = splitList(field('site-header', 'nav'), '|');
  const navLabel = (id: SitePageId) => nav[NAV_PAGES.indexOf(id)] ?? id;
  const legal = splitList(field('site-footer', 'legal'), '|');
  const groups = splitList(field('site-footer', 'groups'), '|');
  const wordmark = field('site-header', 'wordmark');
  const label = field('site-header', 'nav-label');
  const joinBeta = FLAGS.joinBeta ? (
    <a className={`${ui.btn} ${ui.btnRed} ${ui.btnSmall} ${styles.cta}`} href={`${BASE}beta/`}>
      {field('site-header', 'cta')}
    </a>
  ) : null;
  return (
    <div className={styles.shell}>
      <a href="#main" className="skip-link">
        {field('site-header', 'skip')}
      </a>
      <header className={styles.header}>
        <div className={`${ui.wrap} ${styles.bar}`}>
          <Link to="/" className={styles.wordmark} aria-label={`${wordmark}, home`}>
            <span className={styles.power} aria-hidden="true" />
            {wordmark}
          </Link>
          <nav className={styles.nav} aria-label={label}>
            <NavLinks labels={nav} />
          </nav>
          {joinBeta}
          <details className={styles.menu}>
            <summary className={styles.menuButton}>
              <span className={styles.menuIcon} aria-hidden="true" />
              {field('site-header', 'menu')}
            </summary>
            <nav className={styles.menuPanel} aria-label={label}>
              <NavLinks labels={nav} />
            </nav>
          </details>
        </div>
      </header>
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer} aria-label={field('site-footer', 'label')}>
        <div className={`${ui.wrap} ${styles.footerInner}`}>
          <div>
            <Link to="/" className={styles.footerWordmark}>
              <span className={styles.power} aria-hidden="true" />
              {wordmark}
            </Link>
            <p className={styles.footerLine}>{field('site-footer', 'line')}</p>
            <p className={styles.synced}>
              {field('site-footer', 'synced')} <code>{counts.engineCommit.slice(0, 7)}</code>
            </p>
          </div>
          <div className={styles.footerCols}>
            <div>
              <h2 className={styles.colHead}>{groups[0]}</h2>
              <ul>
                <li>
                  <Link to={sitePagePath('engine')}>{navLabel('engine')}</Link>
                </li>
                {STRENGTHS.map((s) => (
                  <li key={s.id}>
                    <Link to={sitePagePath(s.id)}>{field(`page-${s.id}`, 'kicker')}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className={styles.colHead}>{groups[1]}</h2>
              <ul>
                {PROJECT_PAGES.map((id) => (
                  <li key={id}>
                    <Link to={sitePagePath(id)}>{navLabel(id)}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className={styles.colHead}>{groups[2]}</h2>
              <ul>
                {STUDIO_PAGES.map((id) => (
                  <li key={id}>
                    <Link to={sitePagePath(id)}>{navLabel(id)}</Link>
                  </li>
                ))}
                <li>
                  <a href={DISCORD_URL} rel="noopener">
                    {field('site-footer', 'discord')}
                  </a>
                </li>
                {FLAGS.joinBeta ? (
                  <li>
                    <a href={`${BASE}beta/`}>{field('site-header', 'cta')}</a>
                  </li>
                ) : null}
              </ul>
            </div>
            <div>
              <h2 className={styles.colHead}>{groups[3]}</h2>
              <ul>
                {LEGAL_PAGES.map((id, i) => (
                  <li key={id}>
                    <Link to={sitePagePath(id)}>{legal[i] ?? id}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
