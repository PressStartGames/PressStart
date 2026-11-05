import type { ReactNode } from 'react';
import { field, section } from '../../content';
import { Inline } from '../../content/inline';
import styles from '../site.module.css';

// One placeholder page: kicker, h1, the section's paragraphs, and optional actions.
export function Page({ id, children }: { id: string; children?: ReactNode }) {
  return (
    <div className={`frame ${styles.page}`}>
      <p className={`mono ${styles.kicker}`}>{field(id, 'kicker')}</p>
      <h1 className={styles.headline}>{field(id, 'headline')}</h1>
      <div className={styles.body}>
        {section(id).blocks.map((b, i) =>
          b.type === 'p' ? (
            <p key={i}>
              <Inline text={b.text} />
            </p>
          ) : null,
        )}
      </div>
      {children}
    </div>
  );
}
