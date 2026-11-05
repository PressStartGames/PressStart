import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { field, splitList } from '../content';
import type { SitePageId } from '../content/schema';
import { BASE, FLAGS } from '../lib/config';
import { sitePagePath } from '../routes';
import { Motion } from './Motion';
import styles from './Layout.module.css';

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
const ENGINE_PAGES: readonly SitePageId[] = [
  'engine-determinism',
  'engine-parallel',
  'engine-oracles',
  'engine-ai',
  'engine-ownership',
];
const LEGAL_PAGES: readonly SitePageId[] = ['privacy', 'terms', 'cookies'];

// The letterbox: a dark bar on top (wordmark, the eight pages, "Join the beta"), a dark closing credit
// at the bottom. On phones the pages fold into a <details> menu, which opens without JavaScript.
export function MainLayout() {
  const { pathname } = useLocation();
  const nav = splitList(field('site-header', 'nav'), '|');
  const legal = splitList(field('site-footer', 'legal'), '|');
  const [colEngine = '', colSite = '', colLegal = ''] = splitList(
    field('site-footer', 'columns'),
    '|',
  );
  const wordmark = field('site-header', 'wordmark');
  const links = NAV_PAGES.map((id, i) => (
    <NavLink key={id} to={sitePagePath(id)}>
      {nav[i] ?? id}
    </NavLink>
  ));
  const joinBeta = FLAGS.joinBeta ? (
    <a className={styles.cta} href={`${BASE}beta/`}>
      <span className={styles.ctaLed} aria-hidden="true" />
      {field('site-header', 'cta')}
    </a>
  ) : null;

  return (
    <div className={styles.shell}>
      <a href="#main" className="skip-link">
        {field('site-header', 'skip')}
      </a>
      <header className={styles.header}>
        <div className={styles.bar}>
          <Link to="/" className={styles.wordmark} aria-label={`${wordmark}, home`}>
            <span className="led" aria-hidden="true" />
            {wordmark}
          </Link>
          <nav className={styles.nav} aria-label={field('site-header', 'nav-label')}>
            {links}
          </nav>
          {joinBeta}
          <details className={styles.menu} key={pathname}>
            <summary>{field('site-header', 'menu')}</summary>
            <nav className={styles.menuNav} aria-label={field('site-header', 'menu-label')}>
              {links}
            </nav>
          </details>
        </div>
      </header>
      <main id="main" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className={styles.footer} aria-label={field('site-footer', 'label')}>
        <div className={`frame ${styles.cols}`}>
          <div className={styles.lead}>
            <p className={styles.brand}>
              <span className="led" aria-hidden="true" />
              {wordmark}
            </p>
            <p className={styles.line}>{field('site-footer', 'line')}</p>
            {FLAGS.joinBeta ? (
              <a className={styles.footCta} href={`${BASE}beta/`}>
                {field('site-footer', 'beta')}
              </a>
            ) : null}
          </div>
          <FooterColumn
            title={colEngine}
            ids={ENGINE_PAGES}
            label={(id) => field(`page-${id}`, 'kicker')}
          />
          <FooterColumn title={colSite} ids={NAV_PAGES} label={(id, i) => nav[i] ?? id} />
          <FooterColumn title={colLegal} ids={LEGAL_PAGES} label={(id, i) => legal[i] ?? id} />
        </div>
        <svg className={styles.credit} viewBox="0 0 1000 120" aria-hidden="true" focusable="false">
          <text
            x="500"
            y="104"
            textAnchor="middle"
            textLength="980"
            lengthAdjust="spacingAndGlyphs"
          >
            {wordmark.toUpperCase()}
          </text>
        </svg>
      </footer>
      <Motion />
    </div>
  );
}

function FooterColumn({
  title,
  ids,
  label,
}: {
  title: string;
  ids: readonly SitePageId[];
  label: (id: SitePageId, i: number) => string;
}) {
  return (
    <div className={styles.col}>
      <p className={styles.colTitle}>{title}</p>
      <ul>
        {ids.map((id, i) => (
          <li key={id}>
            <Link to={sitePagePath(id)}>{label(id, i)}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
