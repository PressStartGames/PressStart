import { useRef } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { field, splitList } from '../content';
import type { SitePageId } from '../content/schema';
import { BASE, DISCORD_URL, FLAGS } from '../lib/config';
import { sitePagePath } from '../routes';
import styles from './Layout.module.css';
import { PixelIcon } from './ui/PixelIcon';

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
// The footer's three columns, in CONTENT.md's order; 'beta' is the beta's page (outside this area).
const COLUMNS: ReadonlyArray<{ key: string; pages: ReadonlyArray<SitePageId | 'beta'> }> = [
  {
    key: 'engine-links',
    pages: [
      'engine',
      'engine-determinism',
      'engine-parallel',
      'engine-oracles',
      'engine-ai',
      'engine-ownership',
    ],
  },
  { key: 'project-links', pages: ['showcase', 'roadmap', 'learn', 'news'] },
  { key: 'studio-links', pages: ['about', 'licensing', 'community', 'beta'] },
];

// The chassis frame of the main site: skip link, a header with the wordmark, eight pages and the START key
// (a <details> menu on phones that works without JavaScript), <main>, and a dark footer that ends the page
// like the console's screen: the Discord invitation, three link columns, the status line.
export function MainLayout() {
  const nav = splitList(field('site-header', 'nav'), '|');
  const legal = splitList(field('site-footer', 'legal'), '|');
  const columns = splitList(field('site-footer', 'columns'), '|');
  const wordmark = field('site-header', 'wordmark');
  const menuRef = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };
  return (
    <div className={`site ${styles.shell}`}>
      <a href="#main" className="skip-link">
        {field('site-header', 'skip')}
      </a>
      <header className={styles.header}>
        <div className={`frame ${styles.bar}`}>
          <Link to="/" className={styles.wordmark} aria-label={`${wordmark}, home`}>
            <span className={styles.wordmarkLed} aria-hidden="true" />
            {wordmark}
          </Link>
          <nav className={styles.nav} aria-label={field('site-header', 'nav-label')}>
            {NAV_PAGES.map((id, i) => (
              <NavLink key={id} to={sitePagePath(id)}>
                {nav[i] ?? id}
              </NavLink>
            ))}
          </nav>
          <details className={styles.menu} ref={menuRef}>
            <summary className={styles.menuButton}>
              <span className={styles.menuGlyph} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              {field('site-header', 'menu')}
            </summary>
            <nav className={styles.menuPanel} aria-label={field('site-header', 'menu')}>
              {NAV_PAGES.map((id, i) => (
                <NavLink key={id} to={sitePagePath(id)} onClick={closeMenu}>
                  {nav[i] ?? id}
                </NavLink>
              ))}
            </nav>
          </details>
          {FLAGS.joinBeta && (
            <a className={`key ${styles.cta}`} href={`${BASE}beta/`}>
              <span className="key-led" aria-hidden="true" />
              {field('site-header', 'cta')}
            </a>
          )}
        </div>
      </header>
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer} aria-label={field('site-footer', 'label')}>
        <div className={`frame ${styles.footerTop}`}>
          <a className={styles.discord} href={DISCORD_URL} rel="noopener">
            <PixelIcon name="chat" scale={4} className={styles.discordIcon} />
            <span className={styles.discordText}>
              <span className={styles.discordTitle}>{field('site-footer', 'discord')}</span>
              <span className={styles.discordNote}>{field('site-footer', 'discord-note')}</span>
            </span>
            <span className={styles.discordArrow} aria-hidden="true">
              →
            </span>
          </a>
          <div className={styles.columns}>
            {COLUMNS.map((col, c) => {
              const labels = splitList(field('site-footer', col.key), '|');
              return (
                <div key={col.key} className={styles.column}>
                  <h2 className={styles.columnTitle}>{columns[c]}</h2>
                  <ul>
                    {col.pages.map((id, i) => (
                      <li key={id}>
                        {id === 'beta' ? (
                          <a href={`${BASE}beta/`}>{labels[i] ?? id}</a>
                        ) : (
                          <Link to={sitePagePath(id)}>{labels[i] ?? id}</Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
        <div className={`frame ${styles.footerBottom}`}>
          <p className={styles.footerWordmark}>
            <span className={styles.wordmarkLed} aria-hidden="true" />
            {wordmark}
          </p>
          <p className={styles.line}>{field('site-footer', 'line')}</p>
          <ul className={styles.legal}>
            {LEGAL_PAGES.map((id, i) => (
              <li key={id}>
                <Link to={sitePagePath(id)}>{legal[i] ?? id}</Link>
              </li>
            ))}
          </ul>
          <p className={styles.signoff} aria-hidden="true">
            {field('site-footer', 'signoff')}
          </p>
        </div>
      </footer>
    </div>
  );
}
