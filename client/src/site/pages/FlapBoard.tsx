import type { CSSProperties } from 'react';
import { motionOk } from '../../lib/gsap';
import { list, rows } from '../data';
import { onceInView } from '../motion';
import styles from './FlapBoard.module.css';

const S = 'site-oracles';
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·';

// The reference board: what is checked -> the tool it is held against, as a split-flap departures
// board. The names are plain text (never logos). On first view each tile flips through letters and
// settles on its own; the prerendered board is the settled board, and readers get the plain text.
export function FlapBoard() {
  const board = rows(S, 'board');
  const [what = '', against = ''] = list(S, 'board-head');
  const width = Math.max(...board.map(([, t = '']) => t.length));
  return (
    <div className={styles.board} ref={flap}>
      <p className={styles.head} aria-hidden="true">
        <span>{what}</span>
        <span>{against}</span>
      </p>
      <dl className={styles.rows}>
        {board.map(([k = '', v = ''], i) => (
          <div key={k} className={styles.row} style={{ '--n': i } as CSSProperties}>
            <dt className={styles.what}>{k}</dt>
            <dd className={styles.tiles}>
              <span className="visually-hidden">{v}</span>
              <span aria-hidden="true" className={styles.tileRow}>
                {Array.from({ length: width }, (_, j) => (
                  <span key={j} className={styles.tile} data-final={v[j] ?? ' '}>
                    {v[j] ?? ' '}
                  </span>
                ))}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// Flips every tile through random glyphs and settles row by row (about 1.6 s in all, once).
function flap(el: HTMLDivElement | null) {
  if (!el || !motionOk()) return;
  let raf = 0;
  const tiles = Array.from(el.querySelectorAll<HTMLElement>('[data-final]'));
  const settle = () => tiles.forEach((t) => (t.textContent = t.dataset.final ?? ''));
  const stop = onceInView(el, () => {
    const start = performance.now();
    const rowsEls = Array.from(el.querySelectorAll<HTMLElement>(`.${styles.row}`));
    const plan = rowsEls.flatMap((row, r) =>
      Array.from(row.querySelectorAll<HTMLElement>('[data-final]')).map((t, c) => ({
        t,
        end: 350 + r * 110 + c * 22,
      })),
    );
    let seed = 7;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed;
    };
    const frame = (now: number) => {
      const ms = now - start;
      let busy = false;
      for (const { t, end } of plan) {
        const final = t.dataset.final ?? '';
        if (ms >= end || final === ' ') {
          if (t.textContent !== final) t.textContent = final;
        } else {
          busy = true;
          t.textContent = GLYPHS[rand() % GLYPHS.length] ?? '';
        }
      }
      if (busy) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  });
  return () => {
    stop();
    cancelAnimationFrame(raf);
    settle();
  };
}
