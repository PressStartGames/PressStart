import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import type { SitePageId } from '../../content/schema';
import { sitePagePath } from '../../routes';
import { paragraphs, pad } from '../text';
import ui from '../ui.module.css';
import { Board } from './visuals/Board';
import { Cores } from './visuals/Cores';
import { Layers } from './visuals/Layers';
import { Ledger } from './visuals/Ledger';
import styles from './Strengths.module.css';

const ID = 'site-strengths';
const FLAGS: Array<{ id: string; page: SitePageId; visual: ReactNode }> = [
  { id: 'determinism', page: 'engine-determinism', visual: <Ledger /> },
  { id: 'parallel', page: 'engine-parallel', visual: <Cores /> },
  { id: 'oracles', page: 'engine-oracles', visual: <Board /> },
  { id: 'ownership', page: 'engine-ownership', visual: <Layers /> },
];

// The dark theatre: four flagship blocks, one strength each. On desktop with motion, each block is a
// sticky stage scrubbed by the scroll (Motion.tsx, data-m="flag"); everywhere else it reads as a plain
// block in its final state.
export function Strengths() {
  return (
    <div className="act-light">
      <section
        id="strengths"
        className={`act-dark ${styles.theatre}`}
        data-m="panel"
        aria-labelledby="strengths-title"
      >
        <div className={`frame ${styles.intro}`}>
          <p className={`${ui.plate} ${ui.onDark} rv`}>{field(ID, 'label')}</p>
          <h2 id="strengths-title" className={styles.title} data-m="words">
            {field(ID, 'headline')}
          </h2>
        </div>
        {FLAGS.map((f, i) => (
          <Flag key={f.id} index={i} id={f.id} page={f.page}>
            {f.visual}
          </Flag>
        ))}
      </section>
    </div>
  );
}

function Flag({
  index,
  id,
  page,
  children,
}: {
  index: number;
  id: string;
  page: SitePageId;
  children: ReactNode;
}) {
  const sid = `site-strength-${id}`;
  return (
    <article className={styles.flag} data-m="flag" aria-labelledby={`flag-${id}`}>
      <div className={`frame ${styles.sticky}`}>
        <div className={styles.top}>
          <span className={styles.idx}>
            {pad(index + 1)} <span>/ {pad(FLAGS.length)}</span>
          </span>
          <span className={styles.rule} aria-hidden="true" />
          <span className={`${ui.plate} ${ui.onDark}`}>{field(`page-${page}`, 'kicker')}</span>
        </div>
        <p className={styles.word} aria-hidden="true" data-word>
          {field(sid, 'word')}
        </p>
        <div className={styles.grid}>
          <div className={`${styles.copy} rv`}>
            <h3 id={`flag-${id}`} className={styles.headline}>
              {field(sid, 'headline')}
            </h3>
            {paragraphs(sid).map((p) => (
              <p key={p} className={styles.body}>
                {p}
              </p>
            ))}
            <p className={styles.scope}>{field(sid, 'scope')}</p>
            <Link className={`${ui.arrow} ${styles.more}`} to={sitePagePath(page)}>
              {field(ID, 'more')}
              <span className="visually-hidden">: {field(`page-${page}`, 'kicker')}</span>
            </Link>
          </div>
          <div className={`${styles.visual} rv`} style={{ '--d': '120ms' } as CSSProperties}>
            {children}
          </div>
        </div>
      </div>
    </article>
  );
}
