import { useRef, useState, type CSSProperties } from 'react';
import { field, splitList } from '../../content';
import { Screen } from '../ui/Screen';
import { useInView } from '../ui/useInView';
import { SIM, checksum, stateAt } from './play';
import styles from './CoresProof.module.css';

const S = 'site-stage-parallel';
const CORE_COUNTS = [8, 4, 2] as const;
const GATED = ['physics', 'navigation'];

interface Block {
  key: string;
  name: string;
  gated: boolean;
}

// Where each block sits for n cores: the gated pair (same data) together on core 0 in its declared
// order, every other block on the least busy core. Pure: the same n always gives the same board.
function deal(blocks: Block[], n: number): Map<string, { lane: number; slot: number }> {
  const load = Array.from({ length: n }, () => 0);
  const at = new Map<string, { lane: number; slot: number }>();
  for (const b of blocks.filter((x) => x.gated)) at.set(b.key, { lane: 0, slot: load[0]!++ });
  for (const b of blocks.filter((x) => !x.gated)) {
    let lane = 0;
    for (let i = 1; i < n; i++) if (load[i]! < load[lane]!) lane = i;
    at.set(b.key, { lane, slot: load[lane]!++ });
  }
  return at;
}

// Stage 1-3. The core board: the game's systems dealt onto 8, 4 or 2 cores. Re-dealing moves every
// block to its new lane (transforms only); the pair that touches the same data stays together, in its
// declared order; the state checksum, the simulation's own, never changes.
export function CoresProof() {
  const [n, setN] = useState<number>(8);
  const ref = useRef<HTMLDivElement>(null);
  useInView(ref);
  const names = splitList(field(S, 'lanes'));
  const blocks: Block[] = [0, 1].flatMap((phase) =>
    names.map((name) => ({
      key: `${name}-${phase}`,
      name,
      gated: phase === 0 && GATED.includes(name),
    })),
  );
  const at = deal(blocks, n);
  const labels = splitList(field(S, 'cores'), '|');
  const sum = checksum(stateAt(SIM.ticks));
  const core = field(S, 'core-word');
  return (
    <div className={styles.proof} ref={ref} data-io>
      <div className={styles.modes} role="group" aria-label={field(S, 'kicker')}>
        {CORE_COUNTS.map((c, i) => (
          <button key={c} type="button" aria-pressed={n === c} onClick={() => setN(c)}>
            {labels[i] ?? c}
          </button>
        ))}
      </div>
      <Screen
        label={field(S, 'kicker')}
        readout={labels[CORE_COUNTS.indexOf(n as (typeof CORE_COUNTS)[number])] ?? n}
      >
        <div className={styles.board} style={{ '--n': n } as CSSProperties} aria-hidden="true">
          {Array.from({ length: 8 }, (_, lane) => (
            <span
              key={lane}
              className={styles.lane}
              data-off={lane >= n ? '' : undefined}
              style={{ '--lane': lane } as CSSProperties}
            >
              <span className={styles.laneLabel}>
                {core} {lane}
              </span>
            </span>
          ))}
          <div className={styles.track}>
            <span className={styles.bracket} />
            {blocks.map((b, i) => {
              const p = at.get(b.key)!;
              return (
                <span
                  key={b.key}
                  className={styles.block}
                  data-gated={b.gated ? '' : undefined}
                  style={{ '--lane': p.lane, '--slot': p.slot, '--i': i } as CSSProperties}
                >
                  <span className={styles.blockName}>{b.name}</span>
                </span>
              );
            })}
          </div>
        </div>
        <div className={styles.foot}>
          <p className={styles.gate}>
            <span className={styles.gateKey} aria-hidden="true" />
            {field(S, 'gate')}
          </p>
          <p className={styles.readout}>
            <span className={styles.readoutLabel}>{field(S, 'readout')}</span>
            <span className={styles.sum}>{sum}</span>
            <span key={n} className={styles.same}>
              {field(S, 'same')}
            </span>
          </p>
        </div>
      </Screen>
      <p className={styles.caption}>
        <span className="provenance">{field('site-tour', 'illustration')}</span>
        {field(S, 'caption')}
      </p>
    </div>
  );
}
