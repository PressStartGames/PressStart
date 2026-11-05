import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import { stage } from '../tour/stages';
import { PixelIcon } from '../ui/PixelIcon';
import { Screen } from '../ui/Screen';
import styles from './Page.module.css';
import { PageHead } from './PageHead';

// Where the tour already answers each page's question today (stage anchors on the home page).
const MEANWHILE: Record<string, string[]> = {
  'engine-determinism': ['determinism', 'parallel'],
  'engine-parallel': ['parallel', 'determinism'],
  'engine-oracles': ['oracles', 'goldens'],
  'engine-ownership': ['ownership', 'road'],
  showcase: ['goldens', 'built'],
  roadmap: ['road', 'built'],
  learn: ['documents', 'ai', 'ownership'],
  news: ['road'],
  licensing: ['ownership'],
  about: ['documents', 'oracles', 'built'],
  community: ['road'],
};

// A page not designed yet, said plainly: its real sentences from CONTENT.md (`page-<id>`), a locked stage,
// and the tour's stages that answer the question today.
export function Placeholder({ id, children }: { id: string; children?: ReactNode }) {
  const links = (MEANWHILE[id] ?? []).map(stage);
  return (
    <>
      <PageHead id={`page-${id}`} icon="lock" color="var(--st-gold)">
        {children && <div className={styles.headExtra}>{children}</div>}
      </PageHead>
      <div
        className={`frame ${styles.locked}`}
        style={{ '--accent': 'var(--st-gold)' } as CSSProperties}
      >
        <Screen label={field('site-stub', 'screen-label')}>
          <div className={styles.lockedBody}>
            <PixelIcon name="lock" scale={10} className={styles.lock} />
            <div className={styles.lockedText}>
              <p className={styles.lockedLine}>{field('site-stub', 'screen-line')}</p>
              {links.length > 0 && (
                <p className={styles.meanwhile}>{field('site-stub', 'meanwhile')}</p>
              )}
              <ul className={styles.lockedLinks}>
                {links.map((s) => (
                  <li key={s.id} style={{ '--accent': s.color } as CSSProperties}>
                    <Link to={`/#${s.id}`}>
                      <span className={styles.dot}>
                        <PixelIcon name={s.icon} scale={2} />
                      </span>
                      {s.no} · {field(s.section, 'kicker')}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/">
                    <span className={styles.dot}>
                      <PixelIcon name="player" scale={2} />
                    </span>
                    {field('site-stub', 'home')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </Screen>
      </div>
    </>
  );
}
