import { Link } from 'react-router';
import { field, section } from '../content';
import { BASE, FLAGS } from '../lib/config';
import { href, list } from './data';
import styles from './JoinBand.module.css';
import { reveal } from './motion';
import ui from './ui.module.css';

const S = 'site-home-join';

// The closing call: "Press start." on a dark screen, the way into the beta (behind FLAGS.joinBeta;
// with the flag off it says the list is closed and points at the roadmap).
export function JoinBand() {
  const [join = '', road = ''] = list(S, 'cta');
  const body = section(S).blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []));
  return (
    <section className={styles.band} aria-labelledby="join-title">
      <div className="frame">
        <div className={styles.screen} ref={reveal}>
          <span className={styles.scan} aria-hidden="true" />
          <h2 id="join-title" className={styles.title}>
            {field(S, 'headline')}
            <span className={styles.caret} aria-hidden="true" />
          </h2>
          <div className={styles.body}>
            {(FLAGS.joinBeta ? body : [field(S, 'off')]).map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
          <p className={styles.actions}>
            {FLAGS.joinBeta ? (
              <a className={`${ui.btn} ${ui.onScreen}`} href={`${BASE}beta/`}>
                {join}
                <span className={ui.arrow} aria-hidden="true">
                  →
                </span>
              </a>
            ) : null}
            <Link className={`${ui.btn} ${ui.onScreenGhost}`} to={href('roadmap')}>
              {road}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
