import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { field } from '../../content';
import { PixelIcon } from '../ui/PixelIcon';
import styles from './Rail.module.css';
import { STAGES } from './stages';

// The map: a sticky index of the tour. On desktops a dotted path down the left with one node per
// stage and a pixel player that walks to the stage in view (a transform transition); on phones a
// sticky strip of chips under the header that keeps the current one in sight. One
// IntersectionObserver; links work without JavaScript.
export function Rail() {
  const [at, setAt] = useState(-1);
  const strip = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const sections = STAGES.map((s) => document.getElementById(s.id)).filter(
      (x): x is HTMLElement => !!x,
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setAt(sections.indexOf(e.target as HTMLElement));
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Phones: keep the current chip in view inside the strip (the strip scrolls, never the page).
  useEffect(() => {
    const ol = strip.current;
    const li = ol?.children[at] as HTMLElement | undefined;
    if (!ol || !li || ol.scrollWidth <= ol.clientWidth) return;
    ol.scrollTo({ left: li.offsetLeft - 16, behavior: 'smooth' });
  }, [at]);

  return (
    <nav
      className={styles.rail}
      aria-label={field('site-tour', 'index-label')}
      style={{ '--at': Math.max(0, at), '--n': STAGES.length } as CSSProperties}
      data-started={at >= 0 ? '' : undefined}
    >
      <p className={styles.title}>{field('site-tour', 'label')}</p>
      <div className={styles.map}>
        <span className={styles.path} aria-hidden="true">
          <span className={styles.pathFill} />
        </span>
        <span className={styles.player} aria-hidden="true">
          <PixelIcon name="player" scale={2} />
        </span>
        <ol ref={strip} className={styles.nodes} data-scroller>
          {STAGES.map((s, i) => (
            <li key={s.id} style={{ '--accent': s.color } as CSSProperties}>
              <a
                href={`#${s.id}`}
                className={styles.node}
                aria-current={i === at ? 'location' : undefined}
                data-done={i < at ? '' : undefined}
              >
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.no}>{s.no}</span>
                <span className={styles.name}>{field(s.section, 'kicker')}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
