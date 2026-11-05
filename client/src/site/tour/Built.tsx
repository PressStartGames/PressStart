import { useRef, type CSSProperties } from 'react';
import { counts, field, splitList } from '../../content';
import { Screen } from '../ui/Screen';
import { useInView } from '../ui/useInView';
import styles from './Built.module.css';
import { pairs } from './stages';

const S = 'site-built';

// Stage 1-8, the score screen: every area of the feature checklist as a level bar (built, partly there,
// not yet), the counts straight from data/counts.json (written by the sync script, never typed).
export function Built() {
  const ref = useRef<HTMLDivElement>(null);
  useInView(ref);
  const legend = splitList(field(S, 'legend'), '|');
  const of = field(S, 'of');
  const areas = pairs(field(S, 'areas')).flatMap(([id, label]) => {
    const a = counts.catalog.areas.find((x) => x.id === id);
    if (!a) return [];
    const [name = '', what = ''] = splitList(label);
    return [{ ...a, name, what }];
  });
  const { built, total } = counts.catalog;
  return (
    <div className={styles.proof} ref={ref} data-io>
      <Screen
        label={field(S, 'kicker')}
        readout={`${field('site-tour', 'engine-word')} ${counts.engineCommit.slice(0, 7)}`}
      >
        <div className={styles.score}>
          <p className={styles.big}>
            <span className={styles.bigNo}>{built}</span>
            <span className={styles.bigOf}>
              {of} {total} · {legend[0]}
            </span>
          </p>
          <ul className={styles.legend} aria-hidden="true">
            {legend.map((l, i) => (
              <li key={l} data-k={i}>
                {l}
              </li>
            ))}
          </ul>
        </div>
        <ul className={styles.areas}>
          {areas.map((a, i) => {
            const bw = (a.built / a.total) * 100;
            const pw = (a.partial / a.total) * 100;
            return (
              <li key={a.id} className={styles.area} style={{ '--i': i } as CSSProperties}>
                <span className={styles.name}>
                  {a.name}
                  <span className={styles.what}>{a.what}</span>
                </span>
                <span
                  className={styles.bar}
                  role="img"
                  aria-label={`${a.name}: ${a.built} ${of} ${a.total} ${legend[0]}, ${a.partial} ${legend[1]}`}
                >
                  <span className={styles.built} style={{ width: `${bw}%` }} />
                  <span className={styles.partial} style={{ width: `${pw}%` }} />
                </span>
                <span className={styles.count}>
                  {a.built}
                  <span className={styles.countOf}>/{a.total}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Screen>
    </div>
  );
}
