import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { field, splitList } from '../../content';
import { Screen } from '../ui/Screen';
import { useInView } from '../ui/useInView';
import { Arena } from './Arena';
import { SIM, checksum, stateAt, tween, variantAt } from './play';
import styles from './LedgerProof.module.css';

const S = 'site-stage-determinism';
const EVERY = 40;
const ROWS = Array.from({ length: SIM.ticks / EVERY + 1 }, (_, i) => i * EVERY);
const CHANGE_AT = 80;

// Stage 1-2. The checksum ledger: two runs of the browser simulation from one seed, a checksum of the
// whole state every 40 ticks, two arenas at the scrubbed tick. "Change one input" makes run B jump at
// tick 80: the rows from there turn red and the verdict names the first tick that differs.
// The first time it is seen, the scrubber plays the run from tick 0 (once; reduced motion skips it).
export function LedgerProof() {
  const [changed, setChanged] = useState(false);
  const [tick, setTick] = useState<number>(SIM.ticks);
  const ref = useRef<HTMLDivElement>(null);
  const cancel = useRef<() => void>(() => {});
  useInView(ref, () => {
    cancel.current = tween(2600, (t) => setTick(Math.round(t * SIM.ticks)));
  });
  useEffect(() => () => cancel.current(), []);

  const [mSame = '', mChange = ''] = splitList(field(S, 'modes'), '|');
  const [hTick = '', hA = '', hB = ''] = splitList(field(S, 'heads'), '|');
  const runB = (t: number) => (changed ? variantAt(t, CHANGE_AT) : stateAt(t));
  const rows = ROWS.map((t) => {
    const a = checksum(stateAt(t));
    const b = checksum(runB(t));
    return { t, a, b, ok: a === b };
  });
  const first = rows.find((r) => !r.ok);
  const current = Math.floor(tick / EVERY) * EVERY;
  const choose = (next: boolean) => {
    cancel.current();
    setChanged(next);
  };
  return (
    <div className={styles.proof} ref={ref} data-io>
      <div className={styles.modes} role="group" aria-label={field(S, 'kicker')}>
        <button type="button" aria-pressed={!changed} onClick={() => choose(false)}>
          {mSame}
        </button>
        <button type="button" aria-pressed={changed} onClick={() => choose(true)}>
          {mChange}
        </button>
      </div>
      <Screen
        label={`${field('site-tour', 'seed-word')} 0x${SIM.seed.toString(16)}`}
        readout={`${hTick} ${String(tick).padStart(3, '0')} / ${SIM.ticks}`}
      >
        <div className={styles.arenas}>
          <figure className={styles.run}>
            <figcaption>{hA}</figcaption>
            <Arena state={stateAt(tick)} label={hA} />
          </figure>
          <figure className={styles.run} data-off={changed && tick >= CHANGE_AT ? '' : undefined}>
            <figcaption>{hB}</figcaption>
            <Arena state={runB(tick)} label={hB} />
          </figure>
        </div>
        <label className={styles.scrub}>
          <span className={styles.scrubLabel}>{field(S, 'scrub-label')}</span>
          <input
            type="range"
            min={0}
            max={SIM.ticks}
            step={1}
            value={tick}
            onChange={(e) => {
              cancel.current();
              setTick(Number(e.target.value));
            }}
            style={{ '--p': `${(tick / SIM.ticks) * 100}%` } as CSSProperties}
          />
        </label>
        <table className={styles.ledger}>
          <thead>
            <tr>
              <th scope="col">{hTick}</th>
              <th scope="col">{hA}</th>
              <th scope="col">{hB}</th>
              <th scope="col">
                <span className="visually-hidden">{field(S, 'verdict-pass')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={`${changed}-${r.t}`}
                className={styles.row}
                data-bad={r.ok ? undefined : ''}
                data-now={r.t === current ? '' : undefined}
                style={{ '--i': i } as CSSProperties}
              >
                <td>{String(r.t).padStart(3, '0')}</td>
                <td>{r.a}</td>
                <td>{r.b}</td>
                <td className={styles.mark}>{r.ok ? '✓' : '✕'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.verdict} data-bad={first ? '' : undefined} aria-live="polite">
          <span className={styles.stamp}>{field('site-tour', first ? 'fail' : 'pass')}</span>
          {first ? `${field(S, 'verdict-fail')} ${first.t}` : field(S, 'verdict-pass')}
        </p>
      </Screen>
      <p className={styles.caption}>
        <span className="provenance">{field('site-tour', 'illustration')}</span>
        {field(S, 'caption')}
      </p>
    </div>
  );
}
