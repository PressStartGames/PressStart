import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import { sitePagePath } from '../../routes';
import { SIM, checksum, stateAt } from '../../lib/sim';
import { Stage } from '../components/Stage';
import { TitleBand } from '../components/TitleBand';
import { DIVERGE_AT, locate, stateC } from '../divergence';
import { list, pad, pairs, paragraphs } from '../text';
import ui from '../ui.module.css';
import styles from './Determinism.module.css';

const ID = 'page-engine-determinism';
const CHECKPOINTS = Array.from({ length: SIM.ticks / 20 + 1 }, (_, i) => i * 20);
const SEARCH = locate();
const TICKS_PER_S = 30;

// /engine/determinism: the replay as a lab. Drag the tick (or play the run): run A, run B traced over
// it, and run C with one different input at tick 140, drawn in red once it parts. The ledger shows the
// three checksums every 20 ticks; the search log is the binary search that names the first differing
// tick, computed here. Then the rules, the replay tape, and the honest scope.
export function Determinism() {
  const [tick, setTick] = useState<number>(SIM.ticks);
  // The tick a play started from; null while paused.
  const [playFrom, setPlayFrom] = useState<number | null>(null);
  const [showC, setShowC] = useState(true);
  const playing = playFrom !== null;

  useEffect(() => {
    if (playFrom === null) return;
    let raf = 0;
    const from = playFrom;
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min(SIM.ticks, from + Math.floor(((now - start) / 1000) * TICKS_PER_S));
      setTick(t);
      if (t < SIM.ticks) raf = requestAnimationFrame(frame);
      else setPlayFrom(null);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playFrom]);

  const a = stateAt(tick);
  const c = stateC(tick);
  const sumA = checksum(a);
  const sumC = checksum(c);
  const parted = sumA !== sumC;
  const head = list(ID, 'lab-head');
  const [p1 = '', p2 = ''] = paragraphs(ID);
  const same = field(ID, 'lab-same');
  const differs = field(ID, 'lab-differs');

  return (
    <>
      <TitleBand id={ID} lede={p1} />

      <section className={`act-dark ${styles.lab}`} aria-labelledby="lab-title">
        <div className="frame">
          <div className={styles.labHead}>
            <p className={`${ui.plate} ${ui.onDark}`}>{field(ID, 'lab-label')}</p>
            <h2 id="lab-title" className={styles.labTitle}>
              {field(ID, 'lab-headline')}
            </h2>
            <p className={styles.labIntro}>{field(ID, 'lab-intro')}</p>
          </div>

          <div className={styles.labGrid}>
            <div className={styles.bench}>
              <div className={styles.monitor}>
                <Stage
                  state={a}
                  traced={a}
                  diverged={showC && tick >= DIVERGE_AT ? c : undefined}
                  label={`${field(ID, 'lab-tick')} ${tick}: ${head[1] ?? ''} ${sumA}, ${head[3] ?? ''} ${sumC}`}
                />
                <span className={styles.monitorTick} aria-hidden="true">
                  {field(ID, 'lab-tick')} {pad(tick, 3)}
                </span>
              </div>
              <dl className={styles.sums}>
                <div>
                  <dt>{head[1]}</dt>
                  <dd>{sumA}</dd>
                </div>
                <div>
                  <dt>{head[2]}</dt>
                  <dd>{sumA}</dd>
                </div>
                <div data-parted={parted || undefined}>
                  <dt>
                    {head[3]} · {parted ? differs : same}
                  </dt>
                  <dd>{sumC}</dd>
                </div>
              </dl>
              <div className={styles.controls}>
                <button
                  type="button"
                  className={`${ui.btn} ${styles.play}`}
                  onClick={() => setPlayFrom(playing ? null : tick >= SIM.ticks ? 0 : tick)}
                  aria-pressed={playing}
                >
                  <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
                  {playing ? field(ID, 'lab-pause') : field(ID, 'lab-play')}
                </button>
                <label className={styles.slider}>
                  <span className={styles.sliderLabel}>
                    {field(ID, 'lab-tick')} <b>{pad(tick, 3)}</b>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={SIM.ticks}
                    step={1}
                    value={tick}
                    onChange={(e) => {
                      setPlayFrom(null);
                      setTick(Number(e.target.value));
                    }}
                    style={{ '--p': `${(tick / SIM.ticks) * 100}%` } as CSSProperties}
                  />
                  <span
                    className={styles.mark}
                    style={{ left: `${(DIVERGE_AT / SIM.ticks) * 100}%` }}
                    aria-hidden="true"
                  />
                </label>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={showC}
                    onChange={(e) => setShowC(e.target.checked)}
                  />
                  <span>{field(ID, 'lab-runc')}</span>
                </label>
              </div>
              <p className={styles.caption}>{field(ID, 'lab-caption')}</p>
            </div>

            <div className={styles.side}>
              <div
                className={styles.tableWrap}
                role="region"
                aria-label={field(ID, 'lab-label')}
                tabIndex={0}
              >
                <table className={styles.ledger}>
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
                    {CHECKPOINTS.map((t) => {
                      const ha = checksum(stateAt(t));
                      const hc = checksum(stateC(t));
                      return (
                        <tr key={t} data-future={t > tick || undefined}>
                          <td className={styles.t}>{pad(t, 3)}</td>
                          <td>{ha.slice(0, 8)}</td>
                          <td>{ha.slice(0, 8)}</td>
                          <td data-bad={ha !== hc || undefined}>{hc.slice(0, 8)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className={styles.search}>
                <h3 className={styles.searchTitle}>{field(ID, 'lab-search')}</h3>
                <ol className={styles.probes}>
                  {SEARCH.probes.map((p) => (
                    <li key={p.tick}>
                      <button type="button" onClick={() => setTick(p.tick)}>
                        <span>
                          {field(ID, 'lab-check')} {pad(p.tick, 3)}
                        </span>
                        <span data-same={p.same || undefined}>{p.same ? same : differs}</span>
                      </button>
                    </li>
                  ))}
                </ol>
                <p className={styles.found}>
                  {field(ID, 'lab-found')}{' '}
                  <button type="button" onClick={() => setTick(SEARCH.first)}>
                    {pad(SEARCH.first, 3)}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`act-light ${styles.rules}`} aria-labelledby="bans-title">
        <div className="frame">
          <p className={`${ui.plate} rv`}>{field(ID, 'bans-label')}</p>
          <h2 id="bans-title" className={styles.h2} data-m="words">
            {field(ID, 'bans-headline')}
          </h2>
          <ul className={styles.bans}>
            {pairs(ID, 'bans').map((b, i) => (
              <li key={b.key} className="rv" style={{ '--d': `${i * 80}ms` } as CSSProperties}>
                <span className={styles.banN}>{pad(i + 1)}</span>
                <s className={styles.banName}>{b.key}</s>
                <span className={styles.banText}>{b.value}</span>
              </li>
            ))}
          </ul>
          <p className={`${styles.note} rv`}>{field(ID, 'bans-note')}</p>
        </div>
      </section>

      <section className={`act-light ${styles.tape}`} aria-labelledby="tape-title">
        <div className={`frame ${styles.tapeGrid}`}>
          <div>
            <p className={`${ui.plate} rv`}>{field(ID, 'tape-label')}</p>
            <h2 id="tape-title" className={styles.h2} data-m="words">
              {field(ID, 'tape-headline')}
            </h2>
            <p className={`${styles.tapeBody} rv`}>{p2}</p>
          </div>
          <div className={`${styles.cassette} rv`} aria-hidden="true">
            <div className={styles.reels}>
              <span />
              <span />
            </div>
            <ul className={styles.fields}>
              {list(ID, 'tape-fields').map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className={styles.refusal}>{field(ID, 'tape-refusal')}</p>
          </div>
        </div>
      </section>

      <section className={`act-dark ${styles.scope}`} aria-labelledby="scope-title">
        <div className={`frame ${styles.scopeGrid}`}>
          <div>
            <h2 id="scope-title" className={`${ui.plate} ${ui.onDark}`}>
              {field(ID, 'scope-label')}
            </h2>
            <p className={styles.scopeText}>{field(ID, 'scope')}</p>
          </div>
          <Link className={`${ui.btn} ${ui.btnGhostDark}`} to={sitePagePath('engine-parallel')}>
            {field(ID, 'next')}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
