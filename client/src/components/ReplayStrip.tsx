import { useEffect, useState, type CSSProperties } from 'react';
import { field, replay, splitList } from '../content';
import { heroFrames } from '../lib/renders';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import styles from './ReplayStrip.module.css';

const TICKS = replay.ticks;
const ROWS = replay.rows;
const RUN_MS = 3200;
const START_DELAY_MS = 900;

// "Two runs, one game": two panels showing the engine's accepted golden at the current tick (run A
// and run B are the same frame, because the engine must draw the same frame), over the goldens'
// hashes. The counter runs 0 -> last tick once on load; each row flashes PASS green as its tick
// is reached; then the stamp lands. The server renders the final state, which is also the no-JS
// and reduced-motion state.
export function ReplayStrip({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(TICKS);
  const [stamped, setStamped] = useState(true);
  const running = !stamped;

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
  const current = [...ROWS].reverse().find((r) => r.tick <= tick) ?? null;
  const frame = current ? heroFrames[current.file] : undefined;
  const matched = ROWS.filter((r) => r.tick <= tick).length;

  return (
    <figure
      className={[styles.strip, className].filter(Boolean).join(' ')}
      data-act="booth"
      data-running={running || undefined}
    >
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={styles.counter}>
          tick <b>{String(tick).padStart(3, '0')}</b>
          <span className={styles.of}> / {TICKS}</span>
        </span>
      </div>
      <div className={styles.scrub} aria-hidden="true">
        <span className={styles.scrubFill} style={{ '--p': tick / TICKS } as CSSProperties} />
        {ROWS.map((r) => (
          <span
            key={r.tick}
            className={styles.scrubMark}
            data-hit={r.tick <= tick || undefined}
            style={{ '--p': r.tick / TICKS } as CSSProperties}
          />
        ))}
      </div>
      <div className={styles.panels}>
        {[runA, runB].map((run) => (
          <div className={styles.panel} key={run}>
            <span className={styles.runLabel}>{run}</span>
            <span className={styles.scan} aria-hidden="true" />
            {ROWS.map((r) => (
              <img
                key={r.file}
                className={styles.frame}
                src={heroFrames[r.file]}
                width={128}
                height={128}
                alt={`${run}: ${replay.test} at tick ${r.tick}, the engine's accepted golden`}
                decoding="async"
                fetchPriority={r.tick === TICKS ? 'high' : 'low'}
                hidden={current?.file !== r.file}
              />
            ))}
            {!frame && <span className={styles.waiting} aria-hidden="true" />}
            <span className={styles.frameTick} aria-hidden="true">
              t {String(current?.tick ?? tick).padStart(3, '0')}
            </span>
          </div>
        ))}
      </div>
      <table className={styles.table}>
        <caption className="visually-hidden">
          {label}: the golden's checksum each run must match, per tick
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
          {field('hero', 'replay-caption')}
          <span className={styles.provenance}>
            {replay.crate} · {replay.test} · engine {replay.engineCommit.slice(0, 7)}
          </span>
        </figcaption>
      </div>
    </figure>
  );
}
