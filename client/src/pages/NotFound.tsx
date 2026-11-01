import { Body } from '../components/Body';
import { Pill } from '../components/Pill';
import { field, section } from '../content';
import { Footer } from '../sections/Footer';
import styles from './Page.module.css';

export function NotFound() {
  const s = section('not-found');
  return (
    <div className={styles.page}>
      <div className={`frame row ${styles.main}`}>
        <div className="spine">
          <span className="spine-label">error</span>
        </div>
        <div>
          <p className={`${styles.kicker} enter`}>
            <span className="led" aria-hidden="true" />
            {field('not-found', 'kicker')}
          </p>
          <h1 className="enter-solid" style={{ '--enter-delay': '80ms' } as React.CSSProperties}>
            {field('not-found', 'headline')}
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
            <Pill to="/">{field('not-found', 'cta')}</Pill>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
