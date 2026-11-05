import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import { PixelIcon } from '../ui/PixelIcon';
import { Screen } from '../ui/Screen';
import styles from './Page.module.css';
import { PageHead } from './PageHead';

// Tick not found: the game-over screen, one way back.
export function NotFound() {
  return (
    <>
      <PageHead id="site-not-found" icon="player" color="var(--st-orange)" />
      <div
        className={`frame ${styles.locked}`}
        style={{ '--accent': 'var(--st-orange)' } as CSSProperties}
      >
        <Screen label={field('site-not-found', 'kicker')}>
          <div className={styles.lockedBody}>
            <PixelIcon name="player" scale={10} className={styles.lock} />
            <div className={styles.lockedText}>
              <p className={styles.lockedLine}>{field('site-not-found', 'screen')}</p>
              <ul className={styles.lockedLinks}>
                <li>
                  <Link to="/">
                    <span className={styles.dot}>
                      <PixelIcon name="flag" scale={2} />
                    </span>
                    {field('site-not-found', 'cta')}
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
