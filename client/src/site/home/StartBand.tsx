import { Link } from 'react-router';
import { field } from '../../content';
import { BASE, FLAGS } from '../../lib/config';
import { sitePagePath } from '../../routes';
import { paragraphs } from '../lib/copy';
import ui from '../ui/ui.module.css';
import styles from './StartBand.module.css';

// The closing band on every designed page: PRESS START in pixels on a big screen, and the beta door.
export function StartBand() {
  const id = 'site-start';
  return (
    <section className={`${ui.section} ${ui.wrap}`} aria-labelledby="start-title">
      <div className={styles.screen}>
        <div className={styles.floor} aria-hidden="true" />
        <h2 id="start-title" className={styles.title}>
          <span className={styles.caret} aria-hidden="true">
            ▶
          </span>
          {field(id, 'headline')}
        </h2>
        <p className={styles.text}>{paragraphs(id)[0]}</p>
        <div className={`${ui.actions} ${styles.actions}`}>
          {FLAGS.joinBeta ? (
            <a className={`${ui.btn} ${ui.btnRed}`} href={`${BASE}beta/`}>
              {field(id, 'cta')}
            </a>
          ) : null}
          <Link className={`${ui.btn} ${styles.alt}`} to={sitePagePath('engine')}>
            {field(id, 'alt')}
            <span className={ui.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
