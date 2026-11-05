import { useRef, type CSSProperties } from 'react';
import { field, section } from '../../content';
import { useGsap } from '../../lib/gsap';
import { rows, type Move } from '../data';
import { reveal } from '../motion';
import { PixelIcon } from '../PixelIcon';
import ui from '../ui.module.css';
import styles from './Moves.module.css';

// "One engine, three moves": the overview of the pillars (build -> prove -> own). Each card jumps to
// its deep section below. A signal runs along the track with the scroll (GSAP ScrollTrigger, loaded
// after idle) and lights each move as it arrives; without it the track is full and every move lit.
export function Moves() {
  const items = rows('site-home-moves', 'items');
  const body = section('site-home-moves').blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []));
  const trackRef = useRef<HTMLDivElement>(null);
  const at = (i: number) => i / Math.max(1, items.length - 1) - 0.04;

  useGsap(
    ({ gsap }) => {
      const track = trackRef.current;
      const fill = track?.querySelector('[data-fill]');
      const root = track?.closest('section');
      if (!track || !fill || !root) return;
      const lit = Array.from(root.querySelectorAll<HTMLElement>('[data-at]'));
      const light = (p: number) =>
        lit.forEach((el) => el.toggleAttribute('data-dim', p < Number(el.dataset.at)));
      light(0);
      gsap.fromTo(
        fill,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: track,
            start: 'top 85%',
            end: 'top 35%',
            scrub: 0.6,
            onUpdate: (st) => light(st.progress),
          },
        },
      );
      return () => light(1);
    },
    [],
    undefined,
    true,
  );

  return (
    <section className={`${ui.section} ${styles.moves}`} aria-labelledby="moves-title">
      <div className="frame">
        <div className={styles.head}>
          <p className={ui.kicker}>{field('site-home-moves', 'kicker')}</p>
          <h2 id="moves-title" className={ui.h2}>
            {field('site-home-moves', 'headline')}
          </h2>
          <div className={ui.lede}>
            {body.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
        </div>
        <div className={styles.track} ref={trackRef} aria-hidden="true">
          <span className={styles.line} />
          <span className={styles.fill} data-fill="" />
          {items.map(([move = ''], i) => (
            <span key={move} className={styles.node} data-move={move} data-at={at(i)}>
              0{i + 1}
            </span>
          ))}
        </div>
        <ol className={styles.rail} ref={reveal}>
          {items.map(([move = '', title = '', text = ''], i) => (
            <li
              key={move}
              className={styles.item}
              style={{ '--d': `${i * 140}ms` } as CSSProperties}
            >
              <a className={styles.card} href={`#${move}`} data-move={move} data-at={at(i)}>
                <span className={styles.top}>
                  <span className={styles.icon} data-move={move}>
                    <PixelIcon name={move as Move} size={30} />
                  </span>
                </span>
                <span className={styles.title}>{title}</span>
                <span className={styles.text}>{text}</span>
                <span className={styles.go} aria-hidden="true">
                  ↓
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
