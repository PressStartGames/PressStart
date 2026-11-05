import { field, splitList } from '../../../content';
import { SIM, checksum, stateAt } from '../../../lib/sim';
import { list } from '../../text';
import styles from './Visuals.module.css';

const ID = 'site-strength-parallel';
const CORES = 8;
// Which lane's first block touches the same data as which (drawn as the gate's bracket).
const GATED = [1, 2];

// Eight cores, one answer: every core runs its systems at once; the two that touch the same data are
// caught by the gate and given an order; the state checksum reads the same for eight cores and for two.
// The checksum is the simulation's own final-tick checksum (lib/sim.ts), an illustration.
export function Cores() {
  const lanes = splitList(field(ID, 'lanes'));
  const sum = checksum(stateAt(SIM.ticks));
  const core = field(ID, 'core');
  return (
    <figure className={styles.screen}>
      <figcaption className={styles.plate}>
        <span>{field(ID, 'screen')}</span>
        <span className={styles.readout}>
          {CORES} × {core}
        </span>
      </figcaption>
      <div className={styles.cores} aria-hidden="true">
        {Array.from({ length: CORES }, (_, c) => {
          const a = lanes[c] ?? '';
          const b = lanes[(c * 3 + 5) % lanes.length] ?? '';
          const gated = GATED.includes(c);
          return (
            <div key={c} className={styles.lane}>
              <span className={styles.coreName}>
                {core} {c}
              </span>
              <span
                className={`${styles.block} ${gated ? styles.gated : ''}`}
                data-at={(c % 4) / 10}
                data-flash={gated ? 0.35 : undefined}
                style={{ marginLeft: `${(c * 7) % 22}%` }}
              >
                {a}
              </span>
              <span className={styles.block} data-at={0.2 + ((c * 5) % 8) / 40}>
                {b}
              </span>
            </div>
          );
        })}
        <span className={styles.gate} data-at={0.5}>
          {field(ID, 'gate')}
        </span>
      </div>
      <dl className={styles.sums}>
        {list(ID, 'cores').map((c, i) => (
          <div key={c} data-at={0.7 + i * 0.12}>
            <dt>
              {c} · {field(ID, 'readout')}
            </dt>
            <dd>{sum}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
