import { useRef, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import { BASE, FLAGS } from '../../lib/config';
import { PixelIcon } from '../ui/PixelIcon';
import { Screen } from '../ui/Screen';
import { useInView } from '../ui/useInView';
import styles from './Road.module.css';
import { pairs } from './stages';

const S = 'site-road';

// The road's three stops (now, next, then), direction only and without dates. The player stands on "now";
// the stops ahead light in sequence the first time the road is seen. Also the body of /roadmap.
export function RoadStops() {
  const ref = useRef<HTMLDivElement>(null);
  useInView(ref);
  const stops = pairs(field(S, 'stops'));
  return (
    <div className={styles.stops} ref={ref} data-io>
      <ol className={styles.road}>
        {stops.map(([name, what], i) => (
          <li
            key={name}
            className={styles.stop}
            data-now={i === 0 ? '' : undefined}
            style={{ '--i': i } as CSSProperties}
          >
            <span className={styles.marker} aria-hidden="true">
              {i === 0 ? <PixelIcon name="player" scale={3} /> : <span className={styles.post} />}
            </span>
            <span className={styles.stopName}>
              {name}
              {i === 0 && <span className={styles.here}>{field(S, 'now')}</span>}
            </span>
            <span className={styles.stopWhat}>{what}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Stage 1-9: the road, then the one ask of the page: join the beta (behind FLAGS.joinBeta; without it the
// card keeps the road link only).
export function Road() {
  return (
    <div className={styles.proof}>
      <RoadStops />
      <Screen label={field('site-footer', 'signoff')}>
        <div className={styles.join}>
          <div>
            <p className={styles.joinTitle}>{field(S, 'join-title')}</p>
            <p className={styles.joinBody}>{field(S, 'join-body')}</p>
          </div>
          <div className={styles.joinKeys}>
            {FLAGS.joinBeta && (
              <a className={`key ${styles.joinKey}`} href={`${BASE}beta/`}>
                <span className="key-led" aria-hidden="true" />
                {field(S, 'join-cta')}
              </a>
            )}
            <Link className={styles.roadLink} to="/roadmap">
              {field(S, 'roadmap-link')} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </Screen>
    </div>
  );
}
