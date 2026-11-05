import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { DISCORD_URL } from '../../lib/config';
import { href, rows } from '../data';
import { reveal } from '../motion';
import { PixelIcon } from '../PixelIcon';
import styles from './Next.module.css';

const ICONS = { learn: 'build', licensing: 'own', community: 'talk' } as const;

// Learn, licensing and community teasers: what exists today, said plainly. The community card's
// door is Discord itself.
export function Next() {
  const items = rows('site-home-next', 'items');
  return (
    <section className={styles.next} aria-label={items.map(([, k]) => k).join(', ')}>
      <div className={`frame ${styles.grid}`}>
        {items.map(([id = '', kicker = '', title = '', text = '', cta = ''], i) => {
          const icon = ICONS[id as keyof typeof ICONS] ?? 'arrow';
          const inner = (
            <>
              {cta}
              <span aria-hidden="true">→</span>
            </>
          );
          return (
            <article
              key={id}
              className={styles.card}
              data-id={id}
              data-reveal=""
              ref={reveal}
              style={{ '--d': `${i * 100}ms` } as CSSProperties}
            >
              <p className={styles.kicker}>
                <PixelIcon name={icon} size={16} />
                {kicker}
              </p>
              <h2 className={styles.title}>{title}</h2>
              <p className={styles.text}>{text}</p>
              {id === 'community' ? (
                <a className={styles.link} href={DISCORD_URL} rel="noopener">
                  {inner}
                </a>
              ) : (
                <Link className={styles.link} to={href(id)}>
                  {inner}
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
