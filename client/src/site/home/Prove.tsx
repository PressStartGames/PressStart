import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';
import { field, section, splitList } from '../../content';
import { checksum, SIM, stateAt } from '../../lib/sim';
import { GOLDEN_FILE, href, list, rows } from '../data';
import { Golden } from '../Golden';
import { reveal } from '../motion';
import { PixelIcon } from '../PixelIcon';
import ui from '../ui.module.css';
import styles from './Prove.module.css';

const S = 'site-home-prove';

// Two runs from one seed: the checksum at four ticks, identical in both columns.
function Ledger() {
  const ticks = [0, 80, 160, 240];
  return (
    <div className={styles.ledger}>
      {ticks.map((t, i) => {
        const h = checksum(stateAt(t, SIM.seed)).slice(0, 8);
        return (
          <p key={t} className={styles.ledgerRow} style={{ '--n': i } as CSSProperties}>
            <span className={styles.dim}>{String(t).padStart(3, '0')}</span>
            <span>{h}</span>
            <span>{h}</span>
            <span className={styles.pass}>{field('site-home-console', 'pass')}</span>
          </p>
        );
      })}
    </div>
  );
}

// Systems on lanes, two of them on the same data held in order by the gate.
const BLOCKS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [
    [0, 22],
    [40, 18],
    [70, 20],
  ],
  [
    [6, 26],
    [40, 24],
  ],
  [
    [2, 20],
    [26, 10],
    [66, 24],
  ],
  [
    [16, 26],
    [52, 18],
    [78, 16],
  ],
  [
    [0, 14],
    [26, 30],
    [70, 22],
  ],
];

function Lanes() {
  const lanes = list(S, 'lanes');
  return (
    <div className={styles.lanes}>
      {lanes.map((lane, i) => (
        <div key={lane} className={styles.lane}>
          <span className={styles.laneName}>{lane}</span>
          <span className={styles.track}>
            {(BLOCKS[i] ?? []).map(([x, w], j) => (
              <span
                key={j}
                className={styles.block}
                data-gated={(i === 1 && j === 1) || (i === 2 && j === 2) ? '' : undefined}
                style={{ left: `${x}%`, width: `${w}%`, '--n': i + j } as CSSProperties}
              />
            ))}
          </span>
        </div>
      ))}
      <span className={styles.gate}>{field(S, 'gate')}</span>
    </div>
  );
}

function References() {
  const names = splitList(field(S, 'references'));
  return (
    <ul className={styles.refs}>
      {names.map((n, i) => (
        <li key={n} style={{ '--n': i } as CSSProperties}>
          <PixelIcon name="check" size={12} />
          {n}
        </li>
      ))}
    </ul>
  );
}

function Picture() {
  const [label = '', how = ''] = list(S, 'golden');
  return (
    <div className={styles.golden}>
      <Golden
        file={GOLDEN_FILE}
        sizes="(max-width: 900px) 90vw, 560px"
        className={styles.goldenPic}
      />
      <span className={styles.crop} aria-hidden="true" />
      <span className={styles.goldenLabel}>{label}</span>
      <span className={styles.goldenHow}>{how}</span>
    </div>
  );
}

const VISUALS: ReactNode[] = [
  <Ledger key="l" />,
  <Lanes key="p" />,
  <References key="r" />,
  <Picture key="g" />,
];

// 02 Prove: four evidence cards, each a small diagram and a door to its strength page.
export function Prove() {
  const cards = rows(S, 'cards');
  const body = section(S).blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []));
  return (
    <section id="prove" className={`${ui.section} ${styles.prove}`} aria-labelledby="prove-title">
      <div className="frame">
        <div className={styles.head}>
          <p className={ui.kicker}>
            <span className={ui.chip} data-move="prove">
              <PixelIcon name="prove" size={16} />
            </span>
            {field(S, 'kicker')}
          </p>
          <h2 id="prove-title" className={ui.h2}>
            {field(S, 'headline')}
          </h2>
          <div className={ui.lede}>
            {body.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
        </div>
        <ul className={styles.cards}>
          {cards.map(([page = '', title = '', text = ''], i) => (
            <li
              key={title}
              className={styles.card}
              data-kind={i}
              ref={reveal}
              style={{ '--d': `${(i % 2) * 120}ms` } as CSSProperties}
            >
              <div className={styles.window} aria-hidden="true">
                {VISUALS[i]}
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>
                  <Link to={href(page)} className={styles.cardLink}>
                    {title}
                  </Link>
                </h3>
                <p className={styles.cardText}>{text}</p>
                <span className={styles.more} aria-hidden="true">
                  →
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className={styles.small}>{field(S, 'small')}</p>
      </div>
    </section>
  );
}
