import { useEffect, useRef, useState, type CSSProperties } from 'react';
import tick03 from '../../../assets/renders/rig2d-character-tick-03.png?url';
import tick35 from '../../../assets/renders/rig2d-character-tick-35.png?url';
import tick40 from '../../../assets/renders/rig2d-character-tick-40.png?url';
import { field, splitList } from '../../content';
import { rowFor } from '../../lib/renders';
import { Screen } from '../ui/Screen';
import { useInView } from '../ui/useInView';
import { tween } from './play';
import styles from './GoldenProof.module.css';

const S = 'site-stage-goldens';
const FEATURED = { file: 'rig2d-character-tick-35.png', src: tick35 };
const STRIP = [
  { file: 'rig2d-character-tick-03.png', src: tick03 },
  FEATURED,
  { file: 'rig2d-character-tick-40.png', src: tick40 },
];

// Stage 1-4. The golden wipe: "this run" under "the golden", a divider the reader drags (a range input,
// so it works from the keyboard too) and the verdict. Both halves are the same accepted golden, which is
// what a pass looks like. Below, the same character at three ticks. Pixel art at integer scales only.
export function GoldenProof() {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const cancel = useRef<() => void>(() => {});
  useInView(ref, () => {
    cancel.current = tween(1600, (t) => {
      // one sweep across and back to the middle
      const v = t < 0.6 ? (t / 0.6) * 100 : 100 - ((t - 0.6) / 0.4) * 50;
      setPos(Math.round(v * 10) / 10);
    });
  });
  useEffect(() => () => cancel.current(), []);
  const featured = rowFor(FEATURED.file);
  const steps = splitList(field(S, 'steps'), '|');
  return (
    <div className={styles.proof} ref={ref} data-io>
      <Screen
        label={featured ? featured.crate.replace('press_start_', '') : ''}
        readout={
          featured
            ? `${field('site-tour', 'engine-word')} ${featured.engineCommit.slice(0, 7)}`
            : ''
        }
      >
        <div className={styles.stage}>
          <div className={styles.wipe} style={{ '--pos': `${pos}%` } as CSSProperties}>
            <img
              className={styles.pix}
              src={FEATURED.src}
              width={128}
              height={128}
              alt={featured?.test ?? ''}
              loading="lazy"
              decoding="async"
            />
            <div className={styles.golden} aria-hidden="true">
              <img
                className={styles.pix}
                src={FEATURED.src}
                width={128}
                height={128}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
            <span className={styles.divider} aria-hidden="true" />
            <span className={`${styles.tag} ${styles.tagLeft}`}>{field(S, 'candidate')}</span>
            <span className={`${styles.tag} ${styles.tagRight}`}>{field(S, 'golden')}</span>
            <input
              className={styles.slider}
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(pos)}
              aria-label={field(S, 'wipe-label')}
              onChange={(e) => {
                cancel.current();
                setPos(Number(e.target.value));
              }}
            />
          </div>
          <div className={styles.side}>
            <p className={styles.verdict}>{field(S, 'verdict')}</p>
            <ol className={styles.steps}>
              {steps.map((s, i) => (
                <li key={s} className="io-rise" style={{ '--i': i + 2 } as CSSProperties}>
                  <span className={styles.stepNo}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className={styles.strip}>
          <p className={styles.stripLabel}>{field(S, 'strip-label')}</p>
          <div
            className={styles.stripScroll}
            role="region"
            tabIndex={0}
            aria-label={field(S, 'strip-label')}
            data-scroller
          >
            <ul>
              {STRIP.map((g) => {
                const row = rowFor(g.file);
                return (
                  <li key={g.file} data-on={g === FEATURED ? '' : undefined}>
                    <img
                      className={styles.pix}
                      src={g.src}
                      width={128}
                      height={128}
                      alt={row?.test ?? ''}
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{row?.test.replace('rig2d-character-', '')}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Screen>
      <p className={styles.caption}>
        <span className="provenance">{field('site-tour', 'verbatim')}</span>
        {field(S, 'caption')}
      </p>
    </div>
  );
}
