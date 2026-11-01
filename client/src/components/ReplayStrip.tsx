import { useInView } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { field, splitList } from '../content';
import { ROW_TICKS, SIM, checksum, rows, stateAt } from '../lib/sim';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { ArenaFrame } from './ArenaFrame';
import styles from './ReplayStrip.module.css';

const TICKS: number = SIM.ticks;
const RUN_MS = 8000;
const START_DELAY_MS = 900;

// "Two runs, one game": two panels drawing the same simulation state (lib/sim.ts) over the
// checksum rows it produces. The counter runs 0 -> 240 once on load; each row flashes PASS green
// as its tick is reached; the stamp lands; then a third run from another seed shows a FAIL row, so
// the checksums are seen to mean something. The server renders the final state, which is also the
// no-JS and reduced-motion state.
export function ReplayStrip({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [tick, setTick] = useState(TICKS);
  const [stamped, setStamped] = useState(true);
  const running = !stamped;
  const ROWS = useMemo(() => rows(), []);
  const third = useMemo(() => {
    const t = ROW_TICKS[2] ?? 80;
    return { tick: t, hash: checksum(stateAt(t, SIM.seed + 1)) };
  }, []);

  // The server renders the final state. Once the strip is half in view (and motion is not reduced)
  // it resets to tick 0 and runs; only tick changes reach React, never every animation frame.
  useEffect(() => {
    if (reduced || !inView) return;
    let last = -1;
    let raf = requestAnimationFrame(() => {
      setTick(0);
      setStamped(false);
    });
    const timer = window.setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / RUN_MS);
        const nt = Math.round(t * TICKS);
        if (nt !== last) {
          last = nt;
          setTick(nt);
        }
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
  }, [reduced, inView]);

  const [runA = 'run A', runB = 'run B'] = splitList(field('hero', 'replay-runs'), '|');
  const label = field('hero', 'replay-label');
  const state = stateAt(tick);
  const matched = ROWS.filter((r) => r.tick <= tick).length;
  const pass = field('hero', 'replay-verdict');
  const fail = field('hero', 'replay-fail');
  const event =
    tick === 120 || (tick > 120 && tick < 132) ? field('hero', 'replay-event') : state.event;

  return (
    <figure
      ref={ref}
      className={[styles.strip, className].filter(Boolean).join(' ')}
      data-act="booth"
      data-running={running || undefined}
    >
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={styles.event} aria-live="off">
          {event ?? ''}
        </span>
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
            <ArenaFrame state={state} label={run} />
            <span className={styles.frameTick} aria-hidden="true">
              t {String(tick).padStart(3, '0')}
            </span>
          </div>
        ))}
      </div>
      <table className={styles.table}>
        <caption className="visually-hidden">
          {label}: the checksum of each run's state, per tick
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
                <td className={styles.verdict}>{shown && r.a === r.b ? pass : ''}</td>
              </tr>
            );
          })}
          <tr
            className={`${styles.row} ${styles.third}`}
            data-shown={stamped ? '' : undefined}
            style={{ '--i': ROWS.length } as CSSProperties}
          >
            <td className={styles.tick}>{String(third.tick).padStart(3, '0')}</td>
            <td className={styles.hash}>
              <span className={styles.thirdLabel}>{field('hero', 'replay-third')}</span>
            </td>
            <td className={`${styles.hash} ${styles.hashFail}`}>{third.hash}</td>
            <td className={`${styles.verdict} ${styles.verdictFail}`}>{stamped ? fail : ''}</td>
          </tr>
        </tbody>
      </table>
      <div className={styles.foot}>
        <span
          className={styles.stamp}
          data-stamped={stamped ? '' : undefined}
          aria-hidden={!stamped}
        >
          <span className={styles.stampWord}>{pass}</span>
          <span className={styles.stampLine}>
            {matched}/{ROWS.length} {field('hero', 'replay-match')}
          </span>
        </span>
        <figcaption className={styles.note}>{field('hero', 'replay-caption')}</figcaption>
      </div>
    </figure>
  );
}
