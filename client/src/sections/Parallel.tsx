import type { CSSProperties } from 'react';
import { Body } from '../components/Body';
import { Reveal } from '../components/Reveal';
import { Screen } from '../components/Screen';
import { field, section, splitList } from '../content';
import { SIM, checksum, stateAt } from '../lib/sim';
import styles from './Parallel.module.css';

// Every core, the same answer. A screen with eight core lanes: systems land across all of them at
// once, the gate catches the two that touch the same data and declares their order, then the same
// checksum reads out for 8 cores and for 2. The checksum is the simulation's own final-tick checksum.
const CORES = 8;

export function Parallel({ index, label }: { index: string; label: string }) {
  const s = section('parallel');
  const subIdx = s.blocks.findIndex((b) => b.type === 'field' && b.key === 'subhead');
  const lead = s.blocks.slice(0, subIdx);
  const after = s.blocks.slice(subIdx + 1);
  const lanes = splitList(field('parallel', 'lanes'));
  const cores = splitList(field('parallel', 'readout-cores'), '|');
  const sum = checksum(stateAt(SIM.ticks));
  const blocks = lanes.flatMap((name, i) => [
    { name, core: i % CORES, slot: 0, gated: i === 1 || i === 2 },
    { name, core: (i * 3 + 1) % CORES, slot: 1, gated: false },
  ]);
  return (
    <section id="parallel" className="section" aria-labelledby="parallel-title">
      <div className="frame row">
        <div className="spine">
          <span className="spine-index">{index}</span>
          <span className="spine-label">{label}</span>
        </div>
        <div className={styles.grid}>
          <Reveal className={styles.copy}>
            <p className={styles.kicker}>{field('parallel', 'kicker')}</p>
            <h2 id="parallel-title">{field('parallel', 'headline')}</h2>
            <div className={`measure ${styles.body}`}>
              <Body blocks={lead} skip={['field']} />
              <h3>{field('parallel', 'subhead')}</h3>
              <Body blocks={after} skip={['field']} />
            </div>
          </Reveal>
          <Reveal className={styles.screenWrap} delay={120}>
            <Screen
              label={field('parallel', 'kicker')}
              readout={`${CORES} ${field('parallel', 'core-label')}s`}
            >
              <div
                className={styles.board}
                role="img"
                aria-label={`${field('parallel', 'headline')} ${field('parallel', 'readout-label')} ${sum}`}
              >
                <div className={styles.lanes} aria-hidden="true">
                  {Array.from({ length: CORES }, (_, c) => (
                    <div key={c} className={styles.lane}>
                      <span className={styles.coreLabel}>
                        {field('parallel', 'core-label')} {c}
                      </span>
                      <div className={styles.track}>
                        {blocks
                          .filter((b) => b.core === c)
                          .map((b, j) => (
                            <span
                              key={`${b.name}-${b.slot}`}
                              className={styles.block}
                              data-gated={b.gated || undefined}
                              style={{ '--j': j, '--c': c } as CSSProperties}
                            >
                              {b.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className={styles.gate} aria-hidden="true">
                  {field('parallel', 'gate-label')}
                </p>
                <div className={styles.readouts} aria-hidden="true">
                  {cores.map((c, i) => (
                    <div key={c} className={styles.readout} style={{ '--i': i } as CSSProperties}>
                      <span className={styles.readoutLabel}>
                        {c} · {field('parallel', 'readout-label')}
                      </span>
                      <span className={styles.readoutValue}>{sum}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Screen>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
