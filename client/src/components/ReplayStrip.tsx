import { useEffect, useState, type CSSProperties } from 'react';
import { field, replay, splitList } from '../content';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { PlaceholderFrame } from './PlaceholderFrame';
import styles from './ReplayStrip.module.css';

const TICKS = replay.ticks;
const ROWS = replay.rows;
const RUN_MS = 3200;
const START_DELAY_MS = 900;

// "Two runs, one game": two panels of the same frame, run A and run B, over two checksum columns.
// The tick counter runs 0 -> 128 once on load and every matching row flashes PASS green; then the
// stamp lands. The server renders the final state (tick 128, every row shown, stamped), which is
// also the no-JS and reduced-motion state.
export function ReplayStrip({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(TICKS);
  const [stamped, setStamped] = useState(true);

  // Runs once after hydration unless motion is reduced. Every state change happens inside a frame
  // or a timer, never synchronously in the effect, and the cleanup restores the final state.
  useEffect(() => {
    if (reduced) return;
    let raf = requestAnimationFrame(() => {
      setTick(0);
      setStamped(false);
    });
    const timer = window.setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / RUN_MS);
        setTick(Math.round(t * TICKS));
        if (t < 1) raf = requestAnimationFrame(step);
        else setStamped(true);
      };
      raf = requestAnimationFrame(step);
    }, START_DELAY_MS);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setTick(TICKS);
        setStamped(true);
      });
    };
  }, [reduced]);

  const [runA = 'run A', runB = 'run B'] = splitList(field('hero', 'replay-runs'), '|');
  const label = field('hero', 'replay-label');
  const matched = ROWS.filter((r) => r.tick <= tick).length;

  return (
    <figure className={[styles.strip, className].filter(Boolean).join(' ')} data-act="booth">
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={styles.counter}>
          tick <b>{String(tick).padStart(3, '0')}</b>
          <span className={styles.of}> / {TICKS}</span>
        </span>
      </div>
      <div className={styles.panels}>
        {[runA, runB].map((run) => (
          <div className={styles.panel} key={run}>
            <span className={styles.runLabel}>{run}</span>
            <PlaceholderFrame t={tick} label={run} />
          </div>
        ))}
      </div>
      <table className={styles.table}>
        <caption className="visually-hidden">
          {label}: the state checksum of each run per tick
        </caption>
        <thead>
          <tr>
            <th scope="col">tick</th>
            <th scope="col">{runA}</th>
            <th scope="col">{runB}</th>
            <th scope="col">
              <span className="visually-hidden">verdict</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r, i) => {
            const shown = r.tick <= tick;
            return (
              <tr
                key={r.tick}
                className={styles.row}
                data-shown={shown ? '' : undefined}
                style={{ '--i': i } as CSSProperties}
              >
                <td className={styles.tick}>{String(r.tick).padStart(3, '0')}</td>
                <td className={styles.hash}>{r.a}</td>
                <td className={styles.hash}>{r.b}</td>
                <td className={styles.verdict}>
                  {shown && r.a === r.b ? field('hero', 'replay-verdict') : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className={styles.foot}>
        <span
          className={styles.stamp}
          data-stamped={stamped ? '' : undefined}
          aria-hidden={!stamped}
        >
          <span className={styles.stampWord}>{field('hero', 'replay-verdict')}</span>
          <span className={styles.stampLine}>
            {matched}/{ROWS.length} {field('hero', 'replay-match')}
          </span>
        </span>
        <figcaption className={styles.note}>
          {replay.source === 'placeholder' ? field('hero', 'replay-placeholder') : null}
        </figcaption>
      </div>
    </figure>
  );
}
