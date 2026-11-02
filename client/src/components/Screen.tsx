import type { CSSProperties, ReactNode } from 'react';
import styles from './Screen.module.css';

// A dark phosphor screen set into the chassis: hairline bezel, a label plate, fine scanlines over
// the content. Every "machine" visual on the page lives inside one of these.
export function Screen({
  label,
  readout,
  children,
  className,
  id,
  style,
  as: Tag = 'div',
}: {
  label?: ReactNode;
  readout?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
  style?: CSSProperties;
  as?: 'div' | 'figure' | 'section';
}) {
  return (
    <Tag id={id} className={[styles.screen, className].filter(Boolean).join(' ')} style={style}>
      {(label || readout) && (
        <div className={styles.plate}>
          {label && <span className={styles.plateLabel}>{label}</span>}
          {readout && <span className={styles.plateReadout}>{readout}</span>}
        </div>
      )}
      <div className={styles.glass} data-glass>
        {children}
        <span className={styles.scanlines} aria-hidden="true" data-scanlines />
      </div>
    </Tag>
  );
}
