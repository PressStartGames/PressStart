import { useRef, type CSSProperties } from 'react';
import { field } from '../../content';
import { pairs } from '../tour/stages';
import { Screen } from '../ui/Screen';
import { useInView } from '../ui/useInView';
import styles from './OracleProof.module.css';

const S = 'site-stage-oracles';

// Stage 1-5. The wiring board: each part of the engine on the left, the tool it is held against on the
// right (plain mono text, no logos), a wire drawn between them in turn when the board is first seen.
export function OracleProof() {
  const ref = useRef<HTMLDivElement>(null);
  useInView(ref);
  const rows = pairs(field(S, 'pairs'));
  return (
    <div className={styles.proof} ref={ref} data-io>
      <Screen label={field(S, 'kicker')} readout={field(S, 'count')}>
        <table className={styles.board}>
          <thead>
            <tr>
              <th scope="col">{field(S, 'ours')}</th>
              <td aria-hidden="true" />
              <th scope="col">{field(S, 'theirs')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([ours, refs], i) => (
              <tr key={ours} style={{ '--i': i } as CSSProperties}>
                <th scope="row" className={styles.ours}>
                  <span className={styles.chip}>{ours}</span>
                </th>
                <td className={styles.wireCell} aria-hidden="true">
                  <span className={styles.wire}>
                    <span className={styles.fill} />
                    <span className={styles.pulse} />
                  </span>
                </td>
                <td className={styles.refs}>{refs}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.small}>{field(S, 'small')}</p>
      </Screen>
      <p className={styles.caption}>
        <span className="provenance">{field(S, 'kicker')}</span>
        {field(S, 'caption')}
      </p>
    </div>
  );
}
