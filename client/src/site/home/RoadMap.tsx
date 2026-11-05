import { useRef } from 'react';
import { field, splitList } from '../../content';
import { desktop, motionOk, useGsap } from '../../lib/gsap';
import { rows } from '../lib/copy';
import type { IconName } from '../lib/icons';
import { vars } from '../lib/vars';
import { PixelIcon } from '../ui/PixelIcon';
import styles from './RoadMap.module.css';

// The overworld: x and y of each stage in a 1000 x 300 field, the path a smooth curve through them.
const W = 1000;
const H = 300;
const point = (i: number) => ({ x: 62.5 + i * 125, y: i % 2 === 0 ? 96 : 176 });

function pathThrough(n: number): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const p = point(i);
    if (i === 0) {
      d = `M${p.x} ${p.y}`;
      continue;
    }
    const q = point(i - 1);
    d += ` C${q.x + 62} ${q.y} ${p.x - 62} ${p.y} ${p.x} ${p.y}`;
  }
  return d;
}

const STATE_ICON: Record<string, IconName> = {
  cleared: 'check',
  now: 'play',
  next: 'flag',
  ahead: 'lock',
};

// The road to version 1 as an overworld map: cleared, now, next, ahead; no dates. With motion, the
// path draws with the scroll and the "you are here" marker lands; the server renders it drawn.
// `detailed` adds each stage's longer text under the map (the roadmap page).
export function RoadMap({ detailed = false }: { detailed?: boolean }) {
  const id = 'site-road';
  const stages = rows(id);
  const labels = splitList(field(id, 'states'), '|');
  const stateLabel = (s: string) => labels[['cleared', 'now', 'next', 'ahead'].indexOf(s)] ?? s;
  const here = stages.findIndex(([s]) => s === 'now');
  const map = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap }) => {
      const el = map.current;
      if (!el) return;
      const path = el.querySelector('[data-path]');
      const nodes = el.querySelectorAll('[data-node]');
      const marker = el.querySelector('[data-marker]');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 72%', once: true },
      });
      tl.fromTo(
        path,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 2.2, ease: 'power1.inOut' },
        0,
      );
      nodes.forEach((n, i) => {
        tl.from(n, { scale: 0.3, opacity: 0, duration: 0.5, ease: 'back.out(2.5)' }, i * 0.27);
      });
      if (marker) tl.from(marker, { y: -60, opacity: 0, duration: 0.9, ease: 'bounce.out' }, 2);
    },
    [],
    () => motionOk() && desktop(),
    true,
  );

  return (
    <div className={styles.root}>
      <div ref={map} className={styles.map}>
        <svg className={styles.path} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <path d={pathThrough(stages.length)} className={styles.trail} />
          <path d={pathThrough(stages.length)} className={styles.road} pathLength={1} data-path />
        </svg>
        <ol className={styles.stages}>
          {stages.map(([state = '', title = '', short = ''], i) => {
            const p = point(i);
            return (
              <li
                key={title}
                className={styles.stage}
                data-state={state}
                style={vars({ '--x': `${(p.x / W) * 100}%`, '--y': `${(p.y / H) * 100}%` })}
              >
                {i === here ? (
                  <span className={styles.marker} data-marker aria-hidden="true">
                    <PixelIcon name="player" className={styles.player} />
                    <span className={styles.hereLabel}>{field(id, 'here')}</span>
                  </span>
                ) : null}
                <span className={styles.node} data-node aria-hidden="true">
                  <PixelIcon name={STATE_ICON[state] ?? 'lock'} className={styles.nodeIcon} />
                </span>
                <span className={styles.label}>
                  <span className={styles.state}>
                    {String(i + 1).padStart(2, '0')} · {stateLabel(state)}
                  </span>
                  <span className={styles.title}>{title}</span>
                  <span className={styles.short}>{short}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      {detailed ? (
        <ol className={styles.details}>
          {stages.map(([state = '', title = '', , long = ''], i) => (
            <li key={title} className={styles.detail} data-state={state}>
              <span className={styles.detailNum} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p className={styles.state}>{stateLabel(state)}</p>
                <h3 className={styles.detailTitle}>{title}</h3>
                <p className={styles.detailText}>{long}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
