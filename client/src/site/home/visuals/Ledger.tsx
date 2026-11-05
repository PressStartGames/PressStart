import { field } from '../../../content';
import { ROW_TICKS, SIM, checksum, rows, stateAt } from '../../../lib/sim';
import { list, pad } from '../../text';
import styles from './Visuals.module.css';

const ID = 'site-strength-determinism';
const ROWS = rows();
const THIRD = {
  tick: ROW_TICKS[ROW_TICKS.length - 1] ?? SIM.ticks,
  hash: checksum(stateAt(SIM.ticks, SIM.seed + 1)),
};

// Two runs, one checksum: the simulation's checksum every 40 ticks for run A and run B (the same seed,
// so equal line for line) and a run C from another seed that is not. Computed at build time from
// lib/sim.ts; the scrub fills it row by row with a running tick.
export function Ledger() {
  const head = list(ID, 'head');
  const pass = field(ID, 'pass');
  return (
    <figure className={styles.screen}>
      <figcaption className={styles.plate}>
        <span>{field(ID, 'screen')}</span>
        <span className={styles.readout}>
          tick{' '}
          <b data-tick={SIM.ticks} className={styles.amber}>
            {pad(SIM.ticks, 3)}
          </b>
        </span>
      </figcaption>
      <table className={styles.ledger}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={h} scope="col" className={i === 2 ? styles.colB : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.tick} data-at={r.tick / SIM.ticks}>
              <td className={styles.amber}>{pad(r.tick, 3)}</td>
              <td>
                <Hash h={r.a} />
              </td>
              <td className={styles.colB}>
                <Hash h={r.b} />
              </td>
              <td>
                <span className={styles.pass}>{pass}</span>
              </td>
            </tr>
          ))}
          <tr className={styles.failRow} data-at={1.08}>
            <td>{pad(THIRD.tick, 3)}</td>
            <td colSpan={2}>
              <span className={styles.third}>{field(ID, 'third')}</span> <Hash h={THIRD.hash} />
            </td>
            <td>
              <span className={styles.fail}>{field(ID, 'fail')}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </figure>
  );
}

function Hash({ h }: { h: string }) {
  return (
    <span className={styles.hash}>
      {h.slice(0, 8)}
      <span className={styles.hashTail}>{h.slice(8)}</span>
    </span>
  );
}
