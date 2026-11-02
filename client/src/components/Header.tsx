import { useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { field, splitList } from '../content';
import { NAV_TARGETS } from '../content/schema';
import { useMagnet } from '../lib/useMagnet';
import { Pill } from './Pill';
import styles from './Header.module.css';

// The chassis bar: wordmark with its LED, a numbered mono nav, and the START key.
export function Header() {
  const { pathname } = useLocation();
  const home = pathname === '/';
  const nav = splitList(field('header', 'nav'));
  const magnet = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);
  useMagnet(magnet);
  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };
  const navHref = (label: string) => {
    const key = label.split(' ')[0]?.toLowerCase() ?? '';
    return `#${NAV_TARGETS[key] ?? key}`;
  };
  return (
    <header className={styles.header}>
      <div className={`frame ${styles.inner}`}>
        <Link
          to="/"
          className={styles.wordmark}
          aria-label={`${field('header', 'wordmark')}, home`}
        >
          <span className="led" aria-hidden="true" />
          {field('header', 'wordmark')}
        </Link>
        {home && (
          <nav className={styles.nav} aria-label="Sections">
            {nav.map((label, i) => (
              <a key={label} href={navHref(label)}>
                <span className={styles.navIndex}>{String(i + 1).padStart(2, '0')}</span>
                {label}
              </a>
            ))}
          </nav>
        )}
        {home && (
          <details className={styles.menu} ref={menuRef}>
            <summary className={styles.menuButton} aria-label={field('header', 'menu')}>
              <span className={styles.menuGlyph} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className={styles.menuLabel}>{field('header', 'menu')}</span>
            </summary>
            <nav className={styles.menuPanel} aria-label="Sections">
              {nav.map((label, i) => (
                <a key={label} href={navHref(label)} onClick={closeMenu}>
                  <span className={styles.navIndex}>{String(i + 1).padStart(2, '0')}</span>
                  {label}
                </a>
              ))}
            </nav>
          </details>
        )}
        <span ref={magnet} className={styles.cta}>
          <Pill variant="start" href={home ? '#signup' : `${import.meta.env.BASE_URL}#signup`}>
            {field('header', 'cta')}
          </Pill>
        </span>
      </div>
    </header>
  );
}
