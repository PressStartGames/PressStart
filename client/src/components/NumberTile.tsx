import { useCountUp } from '../lib/useCountUp';
import styles from './NumberTile.module.css';

// One synced count (data/counts.json) with its label. The number counts up once in view; the server
// renders the final value.
export function NumberTile({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  const [ref, shown] = useCountUp(value);
  return (
    <div
      className={`${styles.tile} ${accent ? styles.accent : ''}`}
      ref={ref as React.RefObject<HTMLDivElement>}
    >
      <span className={styles.value}>
        <span aria-hidden="true">{shown}</span>
        <span className="visually-hidden">{value}</span>
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
