import { Link } from 'react-router';
import { field, section } from '../../content';
import { Inline } from '../../content/inline';
import type { SitePageId } from '../../content/schema';
import { sitePagePath } from '../../routes';
import { Involved } from '../home/Involved';
import { STRENGTHS } from '../lib/strengths';
import { PixelIcon } from '../ui/PixelIcon';
import ui from '../ui/ui.module.css';
import styles from './Placeholder.module.css';

// The designed pages a locked page points to.
const OPEN: readonly SitePageId[] = ['engine', 'engine-parallel', 'roadmap', 'news'];

// A page not designed yet: its honest copy from CONTENT.md (`page-<id>`), a locked-level card, and
// doors to the pages that are open. Strength pages keep their colour; /community also gets the doors
// to the beta and Discord.
export function Placeholder({ id }: { id: SitePageId }) {
  const sid = `page-${id}`;
  const tone = STRENGTHS.find((s) => s.id === id)?.tone ?? 'ink';
  const body = section(sid).blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []));
  return (
    <>
      <div className={`${ui.wrap} ${styles.page} ${ui[tone]}`}>
        <div className={styles.copy}>
          <p className={`${ui.kicker} enter`}>
            <span className={ui.kickerDot} aria-hidden="true" />
            {field(sid, 'kicker')}
          </p>
          <h1 className={`${styles.title} enter-solid`}>{field(sid, 'headline')}</h1>
          <div className={`${styles.body} enter`}>
            {body.map((text) => (
              <p key={text}>
                <Inline text={text} />
              </p>
            ))}
          </div>
        </div>
        <aside className={`${styles.locked} enter`} aria-label={field('site-placeholder', 'lock')}>
          <span className={styles.lockIcon} aria-hidden="true">
            <PixelIcon name="lock" />
          </span>
          <p className={styles.lockLabel}>{field('site-placeholder', 'lock')}</p>
          <p className={styles.doorsLabel}>{field('site-placeholder', 'doors')}</p>
          <ul className={styles.doors}>
            {OPEN.filter((p) => p !== id).map((p) => (
              <li key={p}>
                <Link to={sitePagePath(p)} className={styles.door}>
                  {field(`page-${p}`, 'kicker')}
                  <span className={ui.arrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      {id === 'community' ? <Involved /> : null}
    </>
  );
}
