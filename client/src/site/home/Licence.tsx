import { Link } from 'react-router';
import { field } from '../../content';
import { BASE, FLAGS } from '../../lib/config';
import { sitePagePath } from '../../routes';
import { list, paragraphs } from '../text';
import ui from '../ui.module.css';
import styles from './Licence.module.css';

const ID = 'site-licence';

// The end card: the licence shape stated as a plan, then the one thing to do next.
export function Licence() {
  const [join = '', read = ''] = list(ID, 'cta');
  return (
    <div className="act-light">
      <section className={`act-dark ${styles.card}`} data-m="panel" aria-labelledby="licence-title">
        <div className={`frame ${styles.inner}`}>
          <p className={`${ui.plate} ${ui.onDark} rv`}>
            <span className="led" aria-hidden="true" />
            {field(ID, 'kicker')}
          </p>
          <h2 id="licence-title" className={styles.title} data-m="words">
            {field(ID, 'headline')}
          </h2>
          <div className={`${styles.row} rv`}>
            <p className={styles.body}>{paragraphs(ID)[0]}</p>
            <div className={styles.keys}>
              {FLAGS.joinBeta ? (
                <a className={ui.btn} href={`${BASE}beta/`}>
                  {join}
                  <span aria-hidden="true">→</span>
                </a>
              ) : null}
              <Link className={`${ui.btn} ${ui.btnGhostDark}`} to={sitePagePath('licensing')}>
                {read}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <p className={`${styles.small} rv`}>{field(ID, 'small')}</p>
          <p className={styles.end} aria-hidden="true">
            {field(ID, 'end')}
            <span className={styles.cursor} />
          </p>
        </div>
      </section>
    </div>
  );
}
