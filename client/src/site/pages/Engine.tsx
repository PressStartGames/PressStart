import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import type { SitePageId } from '../../content/schema';
import { sitePagePath } from '../../routes';
import { Numbers } from '../components/Numbers';
import { TitleBand } from '../components/TitleBand';
import { list, pad, pairs, paragraphs } from '../text';
import ui from '../ui.module.css';
import styles from './Engine.module.css';

const ID = 'page-engine';
const STRENGTHS: readonly SitePageId[] = [
  'engine-determinism',
  'engine-parallel',
  'engine-oracles',
  'engine-ai',
  'engine-ownership',
];
// Where each stop of the loop sits on the ring (degrees from the top, clockwise).
const RING = [0, 90, 180, 270];

// /engine: the engine's loop as a ring (document -> plugin -> world -> agent -> the next document),
// the five strengths as index cards, the synced numbers, and the road (three stops).
export function Engine() {
  const loop = pairs(ID, 'loop');
  return (
    <>
      <TitleBand id={ID} lede={paragraphs(ID)[0]}>
        <div className={styles.ring} aria-hidden="true">
          <span className={styles.orbit}>
            <span className={styles.comet} />
          </span>
          {loop.map((s, i) => (
            <span
              key={s.key}
              className={styles.node}
              style={{ '--a': `${RING[i] ?? 0}deg` } as CSSProperties}
            >
              <span className={styles.nodeIn}>
                <small>{pad(i + 1)}</small>
                {s.key}
              </span>
            </span>
          ))}
        </div>
      </TitleBand>

      <section className={`act-light ${styles.act}`} aria-labelledby="loop-title">
        <div className="frame">
          <h2 id="loop-title" className={ui.plate}>
            {field(ID, 'loop-label')}
          </h2>
          <ol className={styles.loop}>
            {loop.map((s, i) => (
              <li key={s.key} className="rv" style={{ '--d': `${i * 90}ms` } as CSSProperties}>
                <span className={styles.loopN}>{pad(i + 1)}</span>
                <span className={styles.loopName}>{s.key}</span>
                <span className={styles.loopText}>{s.value}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="act-light">
        <section
          className={`act-dark ${styles.act} ${styles.dark}`}
          data-m="panel"
          aria-labelledby="str-title"
        >
          <div className="frame">
            <p className={`${ui.plate} ${ui.onDark} rv`}>{field(ID, 'strengths-label')}</p>
            <h2 id="str-title" className={styles.title} data-m="words">
              {field(ID, 'strengths-headline')}
            </h2>
            <ul className={styles.cards}>
              {STRENGTHS.map((id, i) => (
                <li key={id} className="rv" style={{ '--d': `${i * 70}ms` } as CSSProperties}>
                  <Link className={styles.card} to={sitePagePath(id)}>
                    <span className={styles.cardN}>
                      {pad(i + 1)} · {field(`page-${id}`, 'kicker')}
                    </span>
                    <span className={styles.cardTitle}>{field(`page-${id}`, 'headline')}</span>
                    <span className={styles.cardText}>{field(`page-${id}`, 'description')}</span>
                    <span className={styles.cardGo} aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className={`act-light ${styles.act}`} aria-labelledby="numbers-title">
        <div className="frame">
          <Numbers label={field(ID, 'numbers-label')} />
        </div>
      </section>

      <section className={`act-light ${styles.notYet}`} aria-labelledby="road-title">
        <div className={`frame ${styles.notYetGrid}`}>
          <div>
            <p className={ui.plate}>
              <span className={styles.amberDot} aria-hidden="true" />
              {field(ID, 'road-label')}
            </p>
            <h2 id="road-title" className={styles.notYetTitle}>
              {field(ID, 'road-headline')}
            </h2>
            <Link className={ui.arrow} to={sitePagePath('roadmap')}>
              {field(ID, 'road-link')}
            </Link>
          </div>
          <ul className={styles.notYetList}>
            {list(ID, 'road').map((r) => (
              <li key={r} className="rv">
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
