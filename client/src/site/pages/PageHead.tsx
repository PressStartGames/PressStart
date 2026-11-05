import type { CSSProperties, ReactNode } from 'react';
import { field } from '../../content';
import { useHeadline } from '../../lib/experiments';
import { PixelIcon } from '../ui/PixelIcon';
import type { PixelName } from '../ui/pixels';
import { Prose } from '../ui/Prose';
import styles from './Page.module.css';

// The top of every inner page: a chip (icon + kicker), the h1, the page's paragraphs from CONTENT.md.
export function PageHead({
  id,
  icon,
  color = 'var(--st-green)',
  children,
}: {
  id: string;
  icon: PixelName;
  color?: string;
  children?: ReactNode;
}) {
  const headline = useHeadline(id);
  return (
    <header className={styles.head} style={{ '--accent': color } as CSSProperties}>
      <div className="frame">
        <p className={`enter ${styles.chip}`}>
          <span className={styles.chipIcon}>
            <PixelIcon name={icon} scale={2} />
          </span>
          {field(id, 'kicker')}
        </p>
        <h1
          className={`enter-solid ${styles.h1}`}
          style={{ '--enter-delay': '40ms' } as CSSProperties}
        >
          {headline}
        </h1>
        <Prose id={id} className={`enter ${styles.lede}`} />
        {children}
      </div>
    </header>
  );
}
