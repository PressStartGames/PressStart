import type { ReactNode } from 'react';
import { field, section } from '../../content';
import { Inline } from '../../content/inline';
import type { Tone } from '../lib/strengths';
import { vars } from '../lib/vars';
import styles from './PageHero.module.css';
import ui from './ui.module.css';

// The top of every inner page: a kicker in the page's tone, the one h1, the section's first paragraph
// as the lede, and an optional illustration beside it.
export function PageHero({
  id,
  tone = 'ink',
  art,
  children,
}: {
  id: string;
  tone?: Tone;
  art?: ReactNode;
  children?: ReactNode;
}) {
  const lede = section(id).blocks.find((b) => b.type === 'p');
  return (
    <header className={`${styles.hero} ${ui[tone]} ${art ? styles.withArt : ''}`}>
      <div className={styles.band} aria-hidden="true" />
      <div className={`${ui.wrap} ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={`${ui.kicker} ${styles.kicker} enter`}>
            <span className={ui.kickerDot} aria-hidden="true" />
            {field(id, 'kicker')}
          </p>
          <h1 className={`${styles.title} enter-solid`}>{field(id, 'headline')}</h1>
          {lede?.type === 'p' ? (
            <p className={`${styles.lede} enter`} style={vars({ '--enter-delay': '120ms' })}>
              <Inline text={lede.text} />
            </p>
          ) : null}
          {children}
        </div>
        {art ? <div className={`${styles.art} enter`}>{art}</div> : null}
      </div>
    </header>
  );
}
