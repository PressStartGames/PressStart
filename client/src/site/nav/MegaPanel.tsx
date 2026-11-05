import { Link } from 'react-router';
import { field } from '../../content';
import { sitePagePath } from '../../routes';
import type { navModel, NavEntry } from '../data';
import { PixelIcon } from '../PixelIcon';
import styles from './Header.module.css';
import type { Group } from './SiteHeader';

type Model = ReturnType<typeof navModel>;

function Entry({ e, onNavigate }: { e: NavEntry; onNavigate: () => void }) {
  return (
    <li>
      <Link className={styles.entry} to={sitePagePath(e.id)} onClick={onNavigate}>
        <span className={styles.entryLabel}>
          {e.label}
          <span className={styles.entryArrow} aria-hidden="true">
            →
          </span>
        </span>
        <span className={styles.entryNote}>{e.note}</span>
      </Link>
    </li>
  );
}

// One group's panel. Engine: the overview card and one column per move (build, prove, own).
// Resources and Company: their entries in a row, with the beta line beside them.
export function MegaPanel({
  group,
  model,
  onNavigate,
}: {
  group: Group;
  model: Model;
  onNavigate: () => void;
}) {
  if (group === 'engine') {
    const o = model.overview;
    return (
      <div className={`frame ${styles.panelInner} ${styles.engineGrid}`}>
        <Link className={styles.overview} to={sitePagePath(o.id)} onClick={onNavigate}>
          <span className={styles.overviewBars} aria-hidden="true">
            <span data-move="build" />
            <span data-move="prove" />
            <span data-move="own" />
          </span>
          <span className={styles.overviewLabel}>
            {o.label}
            <span className={styles.entryArrow} aria-hidden="true">
              →
            </span>
          </span>
          <span className={styles.overviewNote}>{o.note}</span>
          <span className={styles.overviewBeta}>
            <span className="led" aria-hidden="true" />
            {field('site-nav', 'beta')}
          </span>
        </Link>
        {model.columns.map((c) => (
          <div key={c.move} className={styles.column} data-move={c.move}>
            <p className={styles.columnHead}>
              <span className={styles.columnIcon} data-move={c.move}>
                <PixelIcon name={c.move} size={18} />
              </span>
              <span>
                <span className={styles.columnLabel}>{c.label}</span>
                <span className={styles.columnNote}>{c.note}</span>
              </span>
            </p>
            <ul className={styles.entries}>
              {c.entries.map((e) => (
                <Entry key={e.id} e={e} onNavigate={onNavigate} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
  const entries = group === 'resources' ? model.resources : model.company;
  return (
    <div className={`frame ${styles.panelInner} ${styles.listGrid}`}>
      <ul className={`${styles.entries} ${styles.entriesRow}`}>
        {entries.map((e) => (
          <Entry key={e.id} e={e} onNavigate={onNavigate} />
        ))}
      </ul>
      <p className={styles.betaLine}>
        <span className="led" aria-hidden="true" />
        {field('site-nav', 'beta')}
      </p>
    </div>
  );
}
