import { Link } from 'react-router';
import { field, section, splitList } from '../../content';
import { Inline } from '../../content/inline';
import { BASE, FLAGS } from '../../lib/config';
import { sitePagePath } from '../../routes';
import { vars } from '../lib/vars';
import ui from '../ui/ui.module.css';
import { Handheld } from './Handheld';
import styles from './Hero.module.css';

// The home page's first screen: who it is for, the one h1, the lede, two doors, and the handheld.
export function Hero() {
  const id = 'site-home';
  const [join = '', engine = ''] = splitList(field(id, 'cta'), '|');
  const lede = section(id).blocks.find((b) => b.type === 'p');
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.glow} aria-hidden="true" />
      <div className={`${ui.wrap} ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={`${styles.kicker} enter`}>
            <span className={styles.p1} aria-hidden="true">P1</span>
            <span className={styles.p2} aria-hidden="true">P2</span>
            {field(id, 'kicker')}
          </p>
          <h1 id="home-title" className={`${styles.title} enter-solid`}>
            {field(id, 'headline')}
          </h1>
          {lede?.type === 'p' ? (
            <p className={`${styles.lede} enter`} style={vars({ '--enter-delay': '120ms' })}>
              <Inline text={lede.text} />
            </p>
          ) : null}
          <div
            className={`${ui.actions} ${styles.actions} enter`}
            style={vars({ '--enter-delay': '220ms' })}
          >
            {FLAGS.joinBeta ? (
              <a className={`${ui.btn} ${ui.btnRed}`} href={`${BASE}beta/`}>
                {join}
              </a>
            ) : null}
            <Link className={`${ui.btn} ${ui.btnGhost}`} to={sitePagePath('engine')}>
              {engine}
              <span className={ui.arrow} aria-hidden="true">
                →
              </span>
            </Link>
          </div>
          <p className={`${styles.small} enter`} style={vars({ '--enter-delay': '300ms' })}>
            <span className={styles.liveDot} aria-hidden="true" />
            {field(id, 'small')}
          </p>
        </div>
        <div className={styles.device}>
          <Handheld />
        </div>
      </div>
    </section>
  );
}
