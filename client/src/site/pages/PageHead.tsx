import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { field, section } from '../../content';
import { Inline } from '../../content/inline';
import type { Move } from '../data';
import { PixelIcon } from '../PixelIcon';
import styles from './Page.module.css';

export interface Crumb {
  label: string;
  to: string;
}

// The head of every inner page: breadcrumbs, the kicker, the h1 and the section's paragraphs, on a
// chassis band tinted with the page's move.
export function PageHead({
  id,
  move,
  crumbs = [],
  children,
  aside,
}: {
  id: string;
  move?: Move;
  crumbs?: Crumb[];
  children?: ReactNode;
  aside?: ReactNode;
}) {
  const body = section(id).blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []));
  return (
    <header className={styles.head} data-move={move}>
      <div className={`frame ${aside ? styles.headGrid : ''}`}>
        <div>
          {crumbs.length ? (
            <nav className={`${styles.crumbs} enter`} aria-label={field('site-stub', 'crumbs')}>
              <ol>
                {crumbs.map((c) => (
                  <li key={c.to}>
                    <Link to={c.to}>{c.label}</Link>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <p className={`${styles.kicker} enter`}>
            {move ? (
              <span className={styles.chip} data-move={move}>
                <PixelIcon name={move} size={16} />
              </span>
            ) : null}
            {field(id, 'kicker')}
          </p>
          <h1 className={`${styles.h1} enter-solid`}>{field(id, 'headline')}</h1>
          <div className={`${styles.lede} enter`}>
            {body.map((t, i) => (
              <p key={i}>
                <Inline text={t} />
              </p>
            ))}
          </div>
          {children}
        </div>
        {aside}
      </div>
    </header>
  );
}
