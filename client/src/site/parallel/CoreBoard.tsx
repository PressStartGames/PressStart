import { useRef } from 'react';
import { field, splitList } from '../../content';
import { motionOk, useGsap } from '../../lib/gsap';
import { vars } from '../lib/vars';
import styles from './CoreBoard.module.css';

// Where each system sits on the board: lane (core) and start/end on a 0..76 time axis. The two that
// touch the same data (physics, camera) are the conflict; camera's final place is after physics.
const SPAN = 76;
const BLOCKS = [
  { lane: 0, from: 0, to: 14 }, // input
  { lane: 1, from: 14, to: 50, hot: true }, // physics
  { lane: 2, from: 0, to: 32 }, // navigation
  { lane: 3, from: 4, to: 40 }, // animation
  { lane: 2, from: 54, to: 72, hot: true, was: 34 }, // camera, first placed overlapping physics
  { lane: 0, from: 16, to: 44 }, // UI
  { lane: 3, from: 44, to: 64 }, // audio
  { lane: 0, from: 48, to: 70 }, // VFX
] as const;

const pct = (v: number) => `${(v / SPAN) * 100}%`;

// The core board on /engine/parallel: systems spread over four cores; the gate catches the two that
// touch the same data and orders them. An illustration, captioned as one. The server renders the
// ordered final state; with motion, blocks drop in, camera lands overlapping physics, the gate fires
// and camera slides after it.
export function CoreBoard() {
  const id = 'site-parallel-board';
  const cores = splitList(field(id, 'cores'), '|');
  const systems = splitList(field(id, 'systems'), '|');
  const board = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap }) => {
      const el = board.current;
      if (!el) return;
      const blocks = el.querySelectorAll('[data-block]');
      const camera = el.querySelector('[data-was]');
      const gate = el.querySelectorAll('[data-gate]');
      const clash = el.querySelector('[data-clash]');
      const was = Number((camera as HTMLElement | null)?.dataset.was ?? 0);
      const tl = gsap.timeline({ delay: 0.5 });
      tl.from(blocks, {
        y: -18,
        opacity: 0,
        duration: 0.45,
        ease: 'back.out(2)',
        stagger: 0.09,
      });
      if (camera) {
        const shift = ((was - BLOCKS[4].from) / (BLOCKS[4].to - BLOCKS[4].from)) * 100;
        tl.set(camera, { xPercent: shift }, 0);
        tl.fromTo(clash, { opacity: 0 }, { opacity: 1, duration: 0.2, repeat: 3, yoyo: true });
        tl.from(gate, { opacity: 0, scale: 0.6, duration: 0.4, ease: 'back.out(2.5)' }, '<');
        tl.to(camera, { xPercent: 0, duration: 0.8, ease: 'power3.inOut' }, '+=0.2');
        tl.to(clash, { opacity: 0, duration: 0.2 }, '<');
      }
    },
    [],
    motionOk,
  );

  return (
    <figure className={styles.figure}>
      <div className={styles.cabinet}>
        <div ref={board} className={styles.board}>
          <div className={styles.header}>
            <p className={styles.label}>{field(id, 'label')}</p>
            <p className={styles.gateLabel} data-gate>
              {field(id, 'gate')}
            </p>
          </div>
          <div className={styles.lanes}>
            {cores.map((c, lane) => (
              <div key={c} className={styles.lane}>
                <span className={styles.core}>{c}</span>
                <div className={styles.track}>
                  {BLOCKS.map((b, i) =>
                    b.lane === lane ? (
                      <span
                        key={systems[i] ?? i}
                        className={styles.block}
                        data-block
                        data-hot={'hot' in b || undefined}
                        data-was={'was' in b ? b.was : undefined}
                        style={vars({ '--from': pct(b.from), '--w': pct(b.to - b.from) })}
                      >
                        {systems[i]}
                      </span>
                    ) : null,
                  )}
                  {lane === 2 ? (
                    <>
                      <span
                        className={styles.clash}
                        data-clash
                        style={vars({ '--from': pct(14), '--w': pct(36) })}
                        aria-hidden="true"
                      />
                      <span
                        className={styles.gate}
                        data-gate
                        style={vars({ '--from': pct(50) })}
                        aria-hidden="true"
                      >
                        <span className={styles.gateArrow} />
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <figcaption className={styles.caption}>{field(id, 'caption')}</figcaption>
    </figure>
  );
}
