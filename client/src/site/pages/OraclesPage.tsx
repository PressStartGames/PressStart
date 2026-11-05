import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import { rowFor } from '../../lib/renders';
import { crumbsFor, GOLDEN_FILE, href, list, navEntry, rows } from '../data';
import { Golden } from '../Golden';
import { JoinBand } from '../JoinBand';
import { countUp, reveal } from '../motion';
import { PixelIcon } from '../PixelIcon';
import ui from '../ui.module.css';
import { FlapBoard } from './FlapBoard';
import styles from './Oracles.module.css';
import { PageHead } from './PageHead';

const S = 'site-oracles';

// /engine/oracles: how an oracle works, the reference board, the two rules, one accepted golden with
// its provenance row, and the next pages in Prove.
export function OraclesPage() {
  const steps = rows(S, 'steps');
  const rules = rows(S, 'rules');
  const golden = rowFor(GOLDEN_FILE);
  // The reference-tool count, as the home page's facts strip says it (synced, never typed).
  const refs = rows('site-home-facts', 'items')[2] ?? [];
  const [crate = '', test = '', commit = ''] = list(S, 'provenance');
  return (
    <>
      <PageHead
        id="page-engine-oracles"
        move="prove"
        crumbs={crumbsFor('engine-oracles')}
        aside={
          <p className={`${styles.count} enter`}>
            <span className={styles.countN} ref={countUp}>
              {refs[0]}
            </span>
            <span className={styles.countLabel}>{refs[1]}</span>
            <span className={styles.countNote}>{refs[2]}</span>
          </p>
        }
      />

      <section className={`${ui.section} ${styles.steps}`} aria-labelledby="steps-title">
        <div className="frame">
          <h2 id="steps-title" className={styles.label}>
            {field(S, 'steps-label')}
          </h2>
          <ol className={styles.stepList} ref={reveal}>
            {steps.map(([title = '', text = ''], i) => (
              <li key={title} className={styles.step} style={{ '--n': i } as CSSProperties}>
                <span className={styles.stepIndex}>0{i + 1}</span>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepText}>{text}</p>
                {i < steps.length - 1 ? (
                  <span className={styles.stepArrow} aria-hidden="true">
                    <PixelIcon name="arrow" size={20} />
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${ui.section} ${styles.boardSection}`} aria-labelledby="board-title">
        <div className={`frame ${styles.boardGrid}`}>
          <div>
            <h2 id="board-title" className={ui.h2}>
              {field(S, 'board-label')}
            </h2>
            <p className={`${ui.lede} ${styles.boardNote}`}>{field(S, 'board-note')}</p>
          </div>
          <FlapBoard />
        </div>
      </section>

      <section className={`${ui.section} ${styles.rules}`} aria-labelledby="rules-title">
        <div className="frame">
          <h2 id="rules-title" className={styles.labelOnDark}>
            {field(S, 'rules-label')}
          </h2>
          <ul className={styles.ruleList}>
            {rules.map(([title = '', text = ''], i) => (
              <li
                key={title}
                className={styles.rule}
                data-reveal=""
                ref={reveal}
                style={{ '--d': `${i * 120}ms` } as CSSProperties}
              >
                <span className={styles.ruleIndex}>{String.fromCharCode(65 + i)}</span>
                <h3 className={styles.ruleTitle}>{title}</h3>
                <p className={styles.ruleText}>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${ui.section} ${styles.golden}`} aria-labelledby="golden-title">
        <div className={`frame ${styles.goldenGrid}`}>
          <div>
            <h2 id="golden-title" className={ui.h2}>
              {field(S, 'golden-label')}
            </h2>
            <p className={`${ui.lede} ${styles.goldenText}`}>{field(S, 'golden')}</p>
          </div>
          <figure className={styles.figure} data-reveal="" ref={reveal}>
            <div className={styles.frameShot}>
              <Golden file={GOLDEN_FILE} sizes="(max-width: 960px) 92vw, 680px" />
              <span className={styles.corners} aria-hidden="true" />
            </div>
            <figcaption className={styles.caption}>
              <p>{field(S, 'golden-caption')}</p>
              {golden ? (
                <dl className={styles.provenance}>
                  <div>
                    <dt>{crate}</dt>
                    <dd>{golden.crate}</dd>
                  </div>
                  <div>
                    <dt>{test}</dt>
                    <dd>{golden.test}</dd>
                  </div>
                  <div>
                    <dt>{commit}</dt>
                    <dd>{golden.engineCommit.slice(0, 12)}</dd>
                  </div>
                </dl>
              ) : null}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.next} aria-labelledby="next-title">
        <div className="frame">
          <h2 id="next-title" className={styles.label}>
            {field(S, 'next-label')}
          </h2>
          <ul className={styles.nextList}>
            {list(S, 'next').map((id) => {
              const e = navEntry(id);
              return (
                <li key={id}>
                  <Link className={styles.nextCard} to={href(id)}>
                    <span className={styles.nextLabel}>
                      {e.label}
                      <span aria-hidden="true">→</span>
                    </span>
                    <span className={styles.nextNote}>{e.note}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <JoinBand />
    </>
  );
}
