import { useRef, useState, type CSSProperties } from 'react';
import { field, splitList } from '../../content';
import { Code } from '../ui/Code';
import { Screen } from '../ui/Screen';
import { useInView } from '../ui/useInView';
import styles from './LayersProof.module.css';

const S = 'site-stage-documents';
const TONES = ['var(--screen-muted)', 'var(--st-cyan)', 'var(--accent)'];

// Stage 1-1. A scene is a base plus patches: the three layers of the engine's own example slide in and
// stack, and the answer the engine gives (which layer set each value) prints beside its source. A tab
// shows the request itself, verbatim. Without JavaScript both panels show, one under the other.
export function LayersProof() {
  const [tab, setTab] = useState<'picture' | 'code'>('picture');
  const ref = useRef<HTMLDivElement>(null);
  useInView(ref);
  const layers = splitList(field(S, 'layers'), '|').map((l) => splitList(l));
  const names = layers.map((l) => l[0] ?? '');
  const answer = splitList(field(S, 'answer'), '|').map((a) => splitList(a));
  const tone = (source: string) => TONES[Math.max(0, names.indexOf(source))];
  return (
    <div className={styles.proof}>
      <div className={styles.tabs} role="group" aria-label={field(S, 'kicker')}>
        {(['picture', 'code'] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={styles.tab}
            aria-pressed={tab === t}
            onClick={() => setTab(t)}
          >
            {field(S, t === 'picture' ? 'tab-picture' : 'tab-code')}
          </button>
        ))}
      </div>
      <div className={styles.panel} hidden={tab !== 'picture'}>
        <Screen label={names.join(' + ')} readout={field(S, 'answer-label')}>
          <div className={styles.board} ref={ref} data-io>
            <ol className={styles.stack}>
              {layers.map(([name, ...lines], i) => (
                <li
                  key={name}
                  className={`${styles.layer} io-rise`}
                  style={{ '--i': i, '--tone': TONES[i] } as CSSProperties}
                >
                  <span className={styles.layerName}>{name}</span>
                  <ul>
                    {lines.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <div className={styles.arrow} aria-hidden="true">
              <span />
            </div>
            <dl className={styles.answer}>
              {answer.map(([key = '', value = '', source = ''], i) => (
                <div
                  key={key}
                  className={`${styles.row} io-rise`}
                  style={{ '--i': i + 4, '--tone': tone(source) } as CSSProperties}
                >
                  <dt>{key}</dt>
                  <dd className={styles.value}>{value}</dd>
                  <dd className={styles.source}>{source}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Screen>
        <p className={styles.caption}>
          <span className="provenance">{field('site-tour', 'verbatim')}</span>
          {field(S, 'sample-caption')}
        </p>
      </div>
      <div className={styles.panel} hidden={tab !== 'code'}>
        <Code
          sample="site-sample-scene"
          caption={field(S, 'sample-caption')}
          label={field('site-tour', 'verbatim')}
        />
      </div>
    </div>
  );
}
