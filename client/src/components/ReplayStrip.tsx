import { useInView } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { field, splitList } from '../content';
import { ROW_TICKS, SIM, checksum, rows, stateAt } from '../lib/sim';
import { useHeroReady } from '../lib/heroState';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { ArenaFrame } from './ArenaFrame';
import { Screen } from './Screen';
import styles from './ReplayStrip.module.css';

const TICKS: number = SIM.ticks;
const RUN_MS = 8000;
const START_DELAY_MS = 700;
const RAMP = 0.1; // the first 10 % of the run accelerates from rest
const HOLD_MS = 4000; // the finished ledger stays readable this long before the next run

// The main screen: ONE wide phosphor screen split by a hairline into run A and run B, both drawing
// the same simulation state; under it the HIGH SCORE ledger (rank, tick, run A, run B, result)
// fills from the top as the ticks pass, with a blinking cursor on the next line. The last entry is
// run C from another seed, red, FAIL. The server renders the final state; the run starts when the
// screen is mostly in view and motion is allowed; only tick changes reach React.
export function ReplayStrip({ className, id }: { className?: string; id?: string }) {
  const reduced = usePrefersReducedMotion();
  const heroReady = useHeroReady();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [tick, setTick] = useState<number>(TICKS);
  const [stamped, setStamped] = useState(true);
  const running = !stamped;
  const ROWS = useMemo(() => rows(), []);
  const third = useMemo(() => {
    const t = ROW_TICKS[2] ?? 80;
    return { tick: t, hash: checksum(stateAt(t, SIM.seed + 1)) };
  }, []);
  // Attract mode: the run plays while the screen is in view. Scrolling away pauses it where it is;
  // coming back resumes it; once it has finished and been read (the hold), it plays again.
  const elapsedRef = useRef(0);
  const finishedRef = useRef(true);

  // Once the page is interactive (and motion is allowed), the screen idles at tick 0 instead of
  // showing the prerendered finished run, so the first play starts from rest, never from a jump.
  useEffect(() => {
    if (reduced) return;
    const raf = requestAnimationFrame(() => {
      if (finishedRef.current && elapsedRef.current === 0) {
        setTick(0);
        setStamped(false);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  useEffect(() => {
    if (reduced || !inView || !heroReady) return;
    let raf = 0;
    let timer = 0;
    let last = -1;
    const run = () => {
      const start = performance.now() - elapsedRef.current;
      const step = (now: number) => {
        elapsedRef.current = now - start;
        // Ease into the first ticks so the run starts smoothly from rest.
        const lin = Math.min(1, elapsedRef.current / RUN_MS);
        const t = lin < RAMP ? (lin * lin) / RAMP : lin;
        const nt = Math.round(t * TICKS);
        if (nt !== last) {
          last = nt;
          setTick(nt);
        }
        if (t < 1) {
          raf = requestAnimationFrame(step);
        } else {
          finishedRef.current = true;
          setStamped(true);
          timer = window.setTimeout(begin, HOLD_MS);
        }
      };
      raf = requestAnimationFrame(step);
    };
    const begin = () => {
      elapsedRef.current = 0;
      finishedRef.current = false;
      last = -1;
      setTick(0);
      setStamped(false);
      run();
    };
    if (finishedRef.current) timer = window.setTimeout(begin, START_DELAY_MS);
    else run();
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [reduced, inView, heroReady]);

  const [runA = 'run A', runB = 'run B'] = splitList(field('hero', 'replay-runs'), '|');
  const head = splitList(field('hero', 'ledger-head'), '|');
  const label = field('hero', 'replay-label');
  const pass = field('hero', 'replay-verdict');
  const fail = field('hero', 'replay-fail');
  const state = stateAt(tick);
  const matched = ROWS.filter((r) => r.tick <= tick).length;
  const event = tick >= 120 && tick < 136 ? field('hero', 'replay-event') : state.event;

  return (
    <div ref={ref} className={className} id={id}>
      <Screen
        as="figure"
        label={field('hero', 'screen-label')}
        readout={
          <>
            tick <b className={styles.tickNow}>{String(tick).padStart(3, '0')}</b> / {TICKS}
          </>
        }
        className={styles.strip}
      >
        <div className={styles.split} data-running={running || undefined}>
          {[runA, runB].map((run) => (
            <div className={styles.half} key={run}>
              <span className={styles.runTag}>{run}</span>
              <ArenaFrame state={state} label={run} />
              <span className={styles.tickTag} aria-hidden="true">
                t {String(tick).padStart(3, '0')}
              </span>
            </div>
          ))}
          <span className={styles.event} aria-live="off">
            {event ?? ''}
          </span>
        </div>
        <div className={styles.ledgerWrap}>
          <div className={styles.ledgerTitle}>
            <span>{label}</span>
            <span className={styles.ledgerMatch}>
              {matched}/{ROWS.length} {field('hero', 'replay-match')}
            </span>
          </div>
          <table className={styles.ledger}>
            <caption className="visually-hidden">
              {label}: the checksum of each run's state, per tick
            </caption>
            <thead>
              <tr>
                {head.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
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
                    <td className={styles.rank}>{String(i + 1).padStart(2, '0')}</td>
                    <td className={styles.tick}>{String(r.tick).padStart(3, '0')}</td>
                    <td className={styles.hash}>{r.a}</td>
                    <td className={styles.hash}>{r.b}</td>
                    <td className={styles.result}>{shown && r.a === r.b ? pass : ''}</td>
                  </tr>
                );
              })}
              <tr className={`${styles.row} ${styles.third}`} data-shown={stamped ? '' : undefined}>
                <td className={styles.rank}>--</td>
                <td className={styles.tick}>{String(third.tick).padStart(3, '0')}</td>
                <td className={styles.hash}>
                  <span className={styles.thirdLabel}>{field('hero', 'replay-third')}</span>
                  <span
                    className={`${styles.hashFail} ${styles.thirdHashNarrow}`}
                    aria-hidden="true"
                  >
                    {third.hash}
                  </span>
                </td>
                <td className={`${styles.hash} ${styles.hashFail}`}>{third.hash}</td>
                <td className={`${styles.result} ${styles.resultFail}`}>{stamped ? fail : ''}</td>
              </tr>
            </tbody>
          </table>
          <p className={styles.cursorLine} aria-hidden="true" data-running={running || undefined}>
            {running ? '_' : ''}
          </p>
        </div>
        <figcaption className={styles.caption}>{field('hero', 'replay-caption')}</figcaption>
      </Screen>
    </div>
  );
}
