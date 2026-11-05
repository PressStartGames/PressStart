import type { CSSProperties, ReactNode } from 'react';
import { field } from '../../content';
import { Inline } from '../../content/inline';
import ui from '../ui.module.css';
import styles from './TitleBand.module.css';

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties;

// The opening band of every inner page: a dark screen with the page's kicker, its h1 at cinema size and
// its lede; an optional visual on the right. The load sequence is CSS (.enter), transform-only on the h1.
export function TitleBand({
  id,
  lede,
  trail,
  children,
}: {
  id: string;
  lede?: string;
  trail?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className={`act-dark ${styles.band}`} data-wide={children ? '' : undefined}>
      <div className={`frame ${styles.grid}`}>
        <div className={styles.text}>
          {trail}
          <p className={`${ui.plate} ${ui.onDark} enter`} style={delay(0)}>
            <span className="led" aria-hidden="true" />
            {field(id, 'kicker')}
          </p>
          <h1 className={`${styles.h1} enter-solid`} style={delay(60)}>
            {field(id, 'headline')}
          </h1>
          {lede ? (
            <p className={`${styles.lede} enter`} style={delay(220)}>
              <Inline text={lede} />
            </p>
          ) : null}
        </div>
        {children ? (
          <div className={`${styles.visual} enter`} style={delay(320)}>
            {children}
          </div>
        ) : null}
      </div>
      <span className={styles.scan} aria-hidden="true" />
    </header>
  );
}
