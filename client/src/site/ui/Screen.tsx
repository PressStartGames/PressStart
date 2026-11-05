import type { ReactNode } from 'react';
import styles from './Screen.module.css';

// A phosphor screen set into the chassis: a bezel, a label plate, the glass with faint scanlines, and a
// glow in the stage's own colour (--accent, set by the stage). Every proof on the site lives in one.
export function Screen({
  label,
  readout,
  children,
  className,
}: {
  label?: ReactNode;
  readout?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={[styles.screen, className].filter(Boolean).join(' ')}>
      {(label || readout) && (
        <div className={styles.plate}>
          <span className={styles.label}>
            <span className={styles.led} aria-hidden="true" />
            {label}
          </span>
          {readout && <span className={styles.readout}>{readout}</span>}
        </div>
      )}
      <div className={styles.glass}>
        {children}
        <span className={styles.scan} aria-hidden="true" />
      </div>
    </div>
  );
}
