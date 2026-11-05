import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import { CatalogBoard } from '../CatalogBoard';
import { list, navModel, rows, type Move } from '../data';
import { JoinBand } from '../JoinBand';
import { reveal } from '../motion';
import { PixelIcon } from '../PixelIcon';
import { sitePagePath } from '../../routes';
import ui from '../ui.module.css';
import styles from './Engine.module.css';
import { PageHead } from './PageHead';

const S = 'site-engine';

// /engine: the whole map. The three moves as chapters, each with its pages; what the engine covers
// (the synced catalog); what is true today beside what is on the road.
export function EnginePage() {
  const chapters = rows(S, 'chapters');
  const columns = navModel().columns;
  const today = list(S, 'today');
  const road = list(S, 'road');
  return (
    <>
      <PageHead
        id="page-engine"
        aside={
          <ol
            className={`${styles.map} enter`}
            style={{ '--enter-delay': '200ms' } as CSSProperties}
          >
            {chapters.map(([move = '', title = ''], i) => (
              <li key={move} data-move={move}>
                <a href={`#${move}`} className={styles.mapRow}>
                  <span className={styles.jumpIcon}>
                    <PixelIcon name={move as Move} size={18} />
                  </span>
                  <span className={styles.mapTitle}>
                    <span className={styles.jumpIndex}>0{i + 1}</span> {title}
                  </span>
                  <span className={styles.mapPages}>
                    {(columns.find((c) => c.move === move)?.entries ?? []).map((e) => (
                      <span key={e.id}>{e.label}</span>
                    ))}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        }
      />

      <div className={`frame ${styles.chapters}`}>
        {chapters.map(([move = '', title = '', text = ''], i) => {
          const entries = columns.find((c) => c.move === move)?.entries ?? [];
          return (
            <section
              key={move}
              id={move}
              className={styles.chapter}
              data-move={move}
              aria-labelledby={`chapter-${move}`}
            >
              <div className={styles.chapterHead}>
                <span className={styles.chapterIcon} data-move={move}>
                  <PixelIcon name={move as Move} size={34} />
                </span>
                <p className={styles.chapterIndex}>0{i + 1}</p>
                <h2 id={`chapter-${move}`} className={styles.chapterTitle}>
                  {title}
                </h2>
                <p className={styles.chapterText}>{text}</p>
              </div>
              <div>
                <p className={styles.pagesLabel}>{field(S, 'pages-label')}</p>
                <ul className={styles.pages}>
                  {entries.map((e, j) => (
                    <li
                      key={e.id}
                      data-reveal=""
                      ref={reveal}
                      style={{ '--d': `${j * 90}ms` } as CSSProperties}
                    >
                      <Link className={styles.page} to={sitePagePath(e.id)}>
                        <span className={styles.pageLabel}>
                          {e.label}
                          <span aria-hidden="true">→</span>
                        </span>
                        <span className={styles.pageNote}>{e.note}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      <section className={`${ui.section} ${styles.covers}`} aria-labelledby="covers-title">
        <div className={`frame ${styles.coversGrid}`}>
          <div>
            <h2 id="covers-title" className={ui.h2}>
              {field(S, 'covers-label')}
            </h2>
            <p className={`${ui.lede} ${styles.coversText}`}>{field(S, 'covers')}</p>
          </div>
          <CatalogBoard />
        </div>
      </section>

      <section className={`${ui.section} ${styles.ledgerSection}`} aria-labelledby="ledger-title">
        <div className="frame">
          <h2 id="ledger-title" className={ui.h2}>
            {field(S, 'ledger-label')}
          </h2>
          <div className={styles.ledger}>
            <div className={styles.col} data-reveal="" ref={reveal}>
              <h3 className={styles.colHead}>
                <span className={styles.on} aria-hidden="true" />
                {field(S, 'today-head')}
              </h3>
              <ul>
                {today.map((t) => (
                  <li key={t}>
                    <PixelIcon name="check" size={14} className={styles.tick} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className={`${styles.col} ${styles.road}`}
              data-reveal=""
              ref={reveal}
              style={{ '--d': '120ms' } as CSSProperties}
            >
              <h3 className={styles.colHead}>
                <span className={styles.off} aria-hidden="true" />
                {field(S, 'road-head')}
              </h3>
              <ul>
                {road.map((t) => (
                  <li key={t}>
                    <PixelIcon name="road" size={14} className={styles.ring} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <JoinBand />
    </>
  );
}
