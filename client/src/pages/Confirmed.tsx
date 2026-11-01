import { Body } from '../components/Body';
import { Pill } from '../components/Pill';
import { field, section } from '../content';
import { Footer } from '../sections/Footer';
import styles from './Page.module.css';

// Where the double opt-in link lands (the Worker's /api/confirm redirects here).
export function Confirmed() {
  const s = section('confirmed');
  return (
    <div className={styles.page}>
      <div className={`frame row ${styles.main}`}>
        <div className="spine">
          <span className="spine-label">player 1</span>
        </div>
        <div>
          <p className={`${styles.kicker} enter`}>
            <span className="led" aria-hidden="true" />
            {field('confirmed', 'kicker')}
          </p>
          <h1 className="enter-solid" style={{ '--enter-delay': '80ms' } as React.CSSProperties}>
            {field('confirmed', 'headline')}
          </h1>
          <div
            className={`${styles.body} enter`}
            style={{ '--enter-delay': '160ms' } as React.CSSProperties}
          >
            <Body blocks={s.blocks} skip={['field']} />
          </div>
          <div
            className={`${styles.cta} enter`}
            style={{ '--enter-delay': '240ms' } as React.CSSProperties}
          >
            <Pill to="/">{field('confirmed', 'cta')}</Pill>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
