import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { field } from '../../content';
import { finePointer, motionOk } from '../../lib/gsap';
import { SIM } from '../../lib/sim';
import { useReplay } from '../lib/useReplay';
import styles from './Handheld.module.css';
import { Playfield } from './Playfield';

const hex = (n: number) => n.toString(16).toUpperCase().padStart(4, '0');
const groups = (sum: string) => sum.match(/.{1,4}/g)?.join(' ') ?? sum;

// The hero's handheld: a console drawn in CSS whose screen plays the seeded browser simulation.
// START replays the same seed and lands on the same checksum; SELECT changes the seed. An
// illustration of the engine's rule, captioned as one (CONTENT.md site-handheld).
export function Handheld() {
  const id = 'site-handheld';
  const g = useReplay();
  const device = useRef<HTMLDivElement>(null);
  const busy = g.phase !== 'done';
  // The console slides in once the page's fonts are in, so the text above it never moves it (CLS).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    void document.fonts.ready.then(() => {
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);
  const verdict = g.phase === 'done' ? field(id, `verdict-${g.verdict}`) : '';

  // Tilt toward the pointer (fine pointers, motion allowed): two CSS variables, no React state.
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = device.current;
    if (!el || !finePointer() || !motionOk()) return;
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5;
    const y = (e.clientY - b.top) / b.height - 0.5;
    el.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
  };
  const onLeave = () => {
    device.current?.style.setProperty('--ry', '0deg');
    device.current?.style.setProperty('--rx', '0deg');
  };

  return (
    <figure className={styles.figure} data-ready={ready || undefined}>
      <div className={styles.stage} onPointerMove={onMove} onPointerLeave={onLeave}>
        <div ref={device} className={styles.device} data-phase={g.phase} data-verdict={g.verdict}>
          <div className={styles.left} aria-hidden="true">
            <span className={styles.dpad} />
            <span className={styles.grille} />
          </div>
          <div className={styles.center}>
            <div className={styles.bezel}>
              <div className={styles.bezelTop} aria-hidden="true">
                <span className={styles.led} />
                <span className={styles.brand}>{field(id, 'brand')}</span>
                <span className={styles.sticker}>{field(id, 'sticker')}</span>
              </div>
              <div className={styles.screen}>
                <Playfield state={g.state} label={`${field(id, 'screen-aria')} ${g.tick}`} />
                <div className={styles.hud} aria-hidden="true">
                  <span>
                    {field(id, 'seed')} <b>{hex(g.seed)}</b>
                  </span>
                  <span>
                    {field(id, 'run')} <b>{g.run}</b>
                  </span>
                  <span>
                    {field(id, 'tick')} <b>{String(g.tick).padStart(3, '0')}</b>/{SIM.ticks}
                  </span>
                </div>
                <div className={styles.sum} aria-hidden="true">
                  <span className={styles.sumLabel}>#</span>
                  {groups(g.sum)}
                  {g.phase === 'done' ? (
                    <span className={styles.stamp} data-verdict={g.verdict}>
                      {field(id, `stamp-${g.verdict}`)}
                    </span>
                  ) : null}
                </div>
                <div className={styles.splash} aria-hidden="true">
                  <span>{field(id, 'splash')}</span>
                </div>
                <span className={styles.glare} aria-hidden="true" />
              </div>
            </div>
            <div className={styles.keys}>
              <button
                type="button"
                className={styles.key}
                onClick={g.select}
                disabled={busy}
                aria-label={`${field(id, 'select')}: ${field(id, 'select-label')}`}
              >
                <span className={styles.keyCap} aria-hidden="true" />
                {field(id, 'select')}
              </button>
              <button
                type="button"
                className={`${styles.key} ${styles.keyStart}`}
                onClick={g.start}
                disabled={busy}
                aria-label={`${field(id, 'start')}: ${field(id, 'start-label')}`}
              >
                <span className={styles.keyCap} aria-hidden="true" />
                {field(id, 'start')}
              </button>
            </div>
          </div>
          <div className={styles.right} aria-hidden="true">
            <span className={`${styles.face} ${styles.faceB}`}>B</span>
            <span className={`${styles.face} ${styles.faceA}`}>A</span>
          </div>
        </div>
      </div>
      <p className={styles.verdict} role="status">
        {verdict ? (
          <>
            <span className={styles.verdictDot} data-verdict={g.verdict} aria-hidden="true" />
            {verdict}
          </>
        ) : null}
      </p>
      <figcaption className={styles.caption}>{field(id, 'caption')}</figcaption>
    </figure>
  );
}
