import { Link } from 'react-router';
import { field } from '../../content';
import { BASE, DISCORD_URL, FLAGS } from '../../lib/config';
import { sitePagePath } from '../../routes';
import { paragraphs, rows } from '../lib/copy';
import type { IconName } from '../lib/icons';
import type { Tone } from '../lib/strengths';
import { PixelIcon } from '../ui/PixelIcon';
import { SectionHead } from '../ui/SectionHead';
import ui from '../ui/ui.module.css';
import styles from './Involved.module.css';

interface Door {
  href: string;
  external: boolean;
  tone: Tone;
  icon: IconName;
}

// The doors, in CONTENT.md's order: the beta, Discord, the road, the engine.
const DOORS: readonly Door[] = [
  { href: `${BASE}beta/`, external: true, tone: 'red', icon: 'play' },
  { href: DISCORD_URL, external: true, tone: 'blue', icon: 'chat' },
  { href: sitePagePath('roadmap'), external: false, tone: 'amber', icon: 'flag' },
  { href: sitePagePath('engine'), external: false, tone: 'green', icon: 'book' },
];

// "Come build with us": the ways in today (the beta behind its flag, Discord), then the road and the
// engine pages; the note that the repository opens with version 1.
export function Involved() {
  const id = 'site-involved';
  const doors = rows(id)
    .map((row, i) => ({ row, door: DOORS[i] }))
    .filter(({ door }, i) => door && (i !== 0 || FLAGS.joinBeta));
  return (
    <section className={`${ui.section} ${ui.wrap}`} aria-labelledby="involved-title">
      <SectionHead
        id="involved-title"
        kicker={field(id, 'kicker')}
        title={field(id, 'headline')}
        lede={paragraphs(id)[0]}
        tone="red"
      />
      <ul className={styles.doors}>
        {doors.map(({ row: [title = '', text = '', cta = ''], door }) => {
          if (!door) return null;
          const body = (
            <>
              <span className={styles.icon} aria-hidden="true">
                <PixelIcon name={door.icon} />
              </span>
              <h3 className={styles.title}>{title}</h3>
              <span className={styles.text}>{text}</span>
              <span className={styles.cta}>
                {cta}
                <span className={ui.arrow} aria-hidden="true">
                  →
                </span>
              </span>
            </>
          );
          return (
            <li key={title} className={ui[door.tone]}>
              {door.external ? (
                <a className={styles.door} href={door.href} rel="noopener">
                  {body}
                </a>
              ) : (
                <Link className={styles.door} to={door.href}>
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
