import { useEffect, useRef, useState } from 'react';
import { field } from '../../content';
import { motionOk } from '../../lib/gsap';
import { checksum, ROW_TICKS, SIM, stateAt } from '../../lib/sim';
import { list, rows } from '../data';
import ui from '../ui.module.css';
import { Arena } from './Arena';
import { paint } from './paint';
import styles from './SuiteConsole.module.css';

const C = 'site-home-console';
// Run B's seed when the visitor asks for another one (any other seed diverges at once).
const OTHER_SEED = 0x1d1e;
const LAST = SIM.ticks;
const TICKS_PER_SECOND = 60;
const INPUT_TICK = 120;

type Mode = 'same' | 'other';

function seedB(mode: Mode) {
  return mode === 'same' ? SIM.seed : OTHER_SEED;
}

const hex = (n: number) => `0x${n.toString(16)}`;

// The hero's suite console: the document, the run, the proof — wired left to right. An illustration
// computed in the browser (lib/sim.ts), captioned as such. The prerendered HTML is the final frame
// (tick 240, every row checked); with motion allowed it replays from tick 0 once, then stays still.
export function SuiteConsole() {
  const [mode, setMode] = useState<Mode>('same');
  const [runId, setRunId] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tickRef = useRef<HTMLSpanElement>(null);

  const [paneDoc = '', paneRun = '', paneProof = ''] = list(C, 'panes');
  const [tickLabel = '', runA = '', runB = ''] = list(C, 'ledger-head');
  const doc = rows(C, 'doc-lines');
  const ledger = ROW_TICKS.map((tick) => {
    const a = checksum(stateAt(tick, SIM.seed));
    const b = checksum(stateAt(tick, seedB(mode)));
    return { tick, a, b, ok: a === b };
  });
  const pass = ledger.every((r) => r.ok);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return;
    const seed = seedB(mode);
    const rowEls = Array.from(root.querySelectorAll<HTMLElement>('[data-row]'));
    const inputLine = root.querySelector<HTMLElement>('[data-input-line]');
    const finish = () => {
      paint(svg, stateAt(LAST, SIM.seed), stateAt(LAST, seed));
      rowEls.forEach((r) => r.setAttribute('data-done', ''));
      if (tickRef.current) tickRef.current.textContent = String(LAST);
      root.removeAttribute('data-playing');
    };
    // The first run plays only with motion allowed; a click replays (instantly under reduced motion).
    if (!motionOk()) {
      finish();
      return;
    }
    let raf = 0;
    let t0 = 0;
    let flashed = false;
    root.setAttribute('data-playing', '');
    rowEls.forEach((r) => r.removeAttribute('data-done'));
    paint(svg, stateAt(0, SIM.seed), stateAt(0, seed));
    const frame = (now: number) => {
      t0 ||= now;
      const tick = Math.min(LAST, Math.floor(((now - t0) / 1000) * TICKS_PER_SECOND));
      paint(svg, stateAt(tick, SIM.seed), stateAt(tick, seed));
      if (tickRef.current) tickRef.current.textContent = String(tick).padStart(3, '0');
      rowEls.forEach((r) => {
        if (Number(r.dataset.row) <= tick) r.setAttribute('data-done', '');
      });
      if (!flashed && tick >= INPUT_TICK && inputLine) {
        flashed = true;
        inputLine.setAttribute('data-flash', '');
        window.setTimeout(() => inputLine.removeAttribute('data-flash'), 900);
      }
      if (tick < LAST) raf = requestAnimationFrame(frame);
      else finish();
    };
    const delay = window.setTimeout(
      () => {
        raf = requestAnimationFrame(frame);
      },
      runId === 0 ? 900 : 120,
    );
    return () => {
      window.clearTimeout(delay);
      cancelAnimationFrame(raf);
      finish();
    };
  }, [mode, runId]);

  return (
    <figure className={styles.figure} aria-labelledby="console-caption">
      <div className={`${ui.bezel} ${styles.bezel}`}>
        <div ref={rootRef} className={`${ui.screen} ${styles.console}`}>
          <div className={styles.top}>
            <span className={styles.lamp} aria-hidden="true" />
            <span className={ui.pixel}>{field(C, 'label')}</span>
            <span className={styles.tick}>
              {tickLabel} <span ref={tickRef}>{LAST}</span> / {LAST}
            </span>
          </div>
          <div className={styles.panes}>
            <section className={`${styles.pane} ${styles.doc}`} aria-label={paneDoc}>
              <p className={styles.paneHead} data-move="build">
                <span className={styles.paneDot} aria-hidden="true" />
                {paneDoc}
              </p>
              <p className={styles.file}>{field(C, 'doc-name')}</p>
              <ol className={styles.code}>
                {doc.map(([k = '', v = ''], i) => (
                  <li
                    key={k}
                    data-input-line={i === doc.length - 1 ? '' : undefined}
                    data-changed={k === 'seed' && mode === 'other' ? '' : undefined}
                  >
                    <span className={styles.key}>{k}</span>
                    <span className={styles.op}> = </span>
                    <span className={styles.val}>
                      {v}
                      {k === 'seed' && mode === 'other' ? (
                        <span className={styles.alt}>
                          {' '}
                          · {runB} {hex(OTHER_SEED)}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
              <p className={styles.check}>{field(C, 'doc-check')}</p>
            </section>
            <span className={styles.wire} aria-hidden="true" />
            <section className={`${styles.pane} ${styles.run}`} aria-label={paneRun}>
              <p className={styles.paneHead}>
                <span className={styles.paneDot} aria-hidden="true" />
                {paneRun}
                <span className={styles.legend}>
                  <span className={styles.legendA} /> {runA}
                  <span className={styles.legendB} /> {runB}
                </span>
              </p>
              <Arena svgRef={svgRef} a={stateAt(LAST, SIM.seed)} b={stateAt(LAST, seedB(mode))} />
            </section>
            <span className={styles.wire} aria-hidden="true" />
            <section className={`${styles.pane} ${styles.proof}`} aria-label={paneProof}>
              <p className={styles.paneHead} data-move="prove">
                <span className={styles.paneDot} aria-hidden="true" />
                {paneProof}
              </p>
              <table className={styles.ledger}>
                <thead>
                  <tr>
                    <th scope="col">{tickLabel}</th>
                    <th scope="col">{runA}</th>
                    <th scope="col">{runB}</th>
                    <th scope="col">
                      <span className="visually-hidden">{field(C, 'pass')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((r) => (
                    <tr key={r.tick} data-row={r.tick} data-ok={r.ok ? '' : undefined}>
                      <td>{String(r.tick).padStart(3, '0')}</td>
                      <td>{r.a.slice(0, 8)}</td>
                      <td className={styles.b}>{r.b.slice(0, 8)}</td>
                      <td>
                        <span className={styles.stamp}>
                          {r.ok ? field(C, 'pass') : field(C, 'fail')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={styles.verdict} data-ok={pass ? '' : undefined} role="status">
                {pass ? field(C, 'verdict-pass') : field(C, 'verdict-fail')}
              </p>
            </section>
          </div>
          <div className={styles.controls}>
            <button
              type="button"
              className={`${ui.btn} ${ui.onScreenGhost} ${styles.control}`}
              onClick={() => setRunId((n) => n + 1)}
            >
              <span aria-hidden="true">↺</span> {field(C, 'replay')}
            </button>
            <button
              type="button"
              className={`${ui.btn} ${ui.onScreenGhost} ${styles.control}`}
              aria-pressed={mode === 'other'}
              onClick={() => {
                setMode((m) => (m === 'same' ? 'other' : 'same'));
                setRunId((n) => n + 1);
              }}
            >
              <span aria-hidden="true">⇄</span> {field(C, 'reseed')}
            </button>
          </div>
        </div>
      </div>
      <figcaption id="console-caption" className={styles.caption}>
        {field(C, 'caption')}
      </figcaption>
    </figure>
  );
}
