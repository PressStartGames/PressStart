import type { CSSProperties } from 'react';
import { field, section } from '../../content';
import { rows, type Move } from '../data';
import { reveal } from '../motion';
import { PixelIcon } from '../PixelIcon';
import ui from '../ui.module.css';
import styles from './Moves.module.css';

// "One engine, three moves": the overview of the pillars on one rail (build -> prove -> own). Each card
// jumps to its deep section below. The rail draws as the section comes into view.
export function Moves() {
  const items = rows('site-home-moves', 'items');
  const body = section('site-home-moves').blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []));
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
        <ol className={styles.rail} ref={reveal} data-rail="">
          {items.map(([move = '', title = '', text = ''], i) => (
            <li
              key={move}
              className={styles.item}
              style={{ '--d': `${i * 140}ms` } as CSSProperties}
            >
              <a className={styles.card} href={`#${move}`} data-move={move}>
                <span className={styles.top}>
                  <span className={styles.icon} data-move={move}>
                    <PixelIcon name={move as Move} size={30} />
                  </span>
                  <span className={styles.index}>0{i + 1}</span>
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
