import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { field, splitList } from '../content';
import { NAV_TARGETS } from '../content/schema';
import { Pill } from './Pill';
import styles from './Header.module.css';

// The bar: wordmark, nav anchors and the one fixed CTA pill. It is fixed over both acts; an
// IntersectionObserver on the paper act's end (#act-horizon) flips its colours for the booth.
export function Header() {
  const { pathname } = useLocation();
  const home = pathname === '/';
  const [pastPaper, setPastPaper] = useState(false);
  const act: 'paper' | 'booth' = home && !pastPaper ? 'paper' : 'booth';

  useEffect(() => {
    if (!home) return;
    const paper = document.getElementById('act-paper');
    if (!paper) return;
    const headerH = 72;
    const io = new IntersectionObserver(
      ([entry]) => {
        // The header is in the paper act while the paper's box still covers the header's band.
        if (entry) setPastPaper(entry.boundingClientRect.bottom <= headerH);
      },
      { rootMargin: `-${headerH}px 0px 0px 0px`, threshold: [0, 1] },
    );
    io.observe(paper);
    return () => io.disconnect();
  }, [home]);

  const nav = splitList(field('header', 'nav'));
  const navHref = (label: string) => {
    const key = label.split(' ')[0]?.toLowerCase() ?? '';
    return `#${NAV_TARGETS[key] ?? key}`;
  };

  return (
    <header className={styles.header} data-act={act}>
      <div className={styles.inner}>
        <Link
          to="/"
          className={`${styles.wordmark} enter`}
          aria-label={`${field('header', 'wordmark')}, home`}
        >
          <span className={styles.mark} aria-hidden="true" />
          {field('header', 'wordmark')}
        </Link>
        {home && (
          <nav className={styles.nav} aria-label="Sections">
            {nav.map((label, i) => (
              <a
                key={label}
                href={navHref(label)}
                className="enter"
                style={{ '--enter-delay': `${120 + i * 60}ms` } as React.CSSProperties}
              >
                {label}
              </a>
            ))}
          </nav>
        )}
        <Pill
          variant="orbit"
          href={home ? '#signup' : `${import.meta.env.BASE_URL}#signup`}
          className={`${styles.cta} enter`}
          style={{ '--enter-delay': '200ms' } as React.CSSProperties}
        >
          {field('header', 'cta')}
        </Pill>
      </div>
    </header>
  );
}
