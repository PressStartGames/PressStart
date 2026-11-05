import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { field } from '../content';
import { SiteHeader } from './nav/SiteHeader';
import { SiteFooter } from './SiteFooter';
import styles from './site.module.css';

// The main site's frame: skip link, the header with the mega-menu, <main>, the footer.
export function MainLayout() {
  const { pathname, hash } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  // A client navigation lands at the top of the new page with focus on <main> (the prerendered first
  // load keeps the browser's own scroll and focus).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (hash) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, hash]);

  return (
    <div className={styles.shell}>
      <a href="#main" className="skip-link">
        {field('site-header', 'skip')}
      </a>
      <SiteHeader />
      <main id="main" ref={mainRef} tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
