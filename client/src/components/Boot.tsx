import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { field, splitList } from '../content';
import { checksum, stateAt } from '../lib/sim';
import styles from './Boot.module.css';

// The console boots: a full-viewport screen types six mono lines, then shrinks (FLIP) into the
// hero's main screen. Client-only; the inline script in index.html decides whether this load boots
// (home route, motion allowed, not yet booted this session) and sets html.booting, which this
// component clears when the screen lifts. No-JS and reduced motion never see it.
const LINE_MS = 190;
const HOLD_MS = 420;
const FLIP_MS = 640;

export function Boot() {
  const [on, setOn] = useState(false);
  const [flip, setFlip] = useState<CSSProperties | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const lines = splitList(field('hero', 'boot-lines'), '|');
  const hash = checksum(stateAt(0));

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains('booting')) return;
    const raf0 = requestAnimationFrame(() => setOn(true));
    const total = lines.length * LINE_MS + HOLD_MS;
    const t1 = window.setTimeout(() => {
      const target = document.getElementById('main-screen');
      const el = ref.current;
      if (target && el) {
        const from = el.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        setFlip({
          transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})`,
          opacity: 0,
        });
      } else {
        setFlip({ opacity: 0 });
      }
    }, total);
    const t2 = window.setTimeout(() => {
      html.classList.remove('booting');
      try {
        sessionStorage.setItem('ps-booted', '1');
      } catch {
        /* private mode */
      }
      setOn(false);
    }, total + FLIP_MS);
    return () => {
      cancelAnimationFrame(raf0);
      clearTimeout(t1);
      clearTimeout(t2);
      html.classList.remove('booting');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!on) return null;
  return (
    <div className={styles.boot} ref={ref} style={flip ?? undefined} aria-hidden="true">
      <div className={styles.lines}>
        {lines.map((line, i) => {
          const value =
            line.toLowerCase() === 'checksum'
              ? hash
              : line.toLowerCase() === 'verdict'
                ? field('hero', 'replay-verdict')
                : '';
          return (
            <p key={line} className={styles.line} style={{ '--i': i } as CSSProperties}>
              <span className={styles.prompt}>&gt;</span> {line}
              {value && <span className={styles.value}>{value}</span>}
            </p>
          );
        })}
        <p className={styles.cursor} style={{ '--i': lines.length } as CSSProperties}>
          _
        </p>
      </div>
    </div>
  );
}
