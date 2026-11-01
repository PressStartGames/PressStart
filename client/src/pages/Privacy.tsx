import { Body } from '../components/Body';
import { field, section } from '../content';
import { Footer } from '../sections/Footer';
import styles from './Page.module.css';

export function Privacy() {
  const s = section('privacy');
  return (
    <div className={styles.page}>
      <div className={`frame row ${styles.main}`}>
        <div className="spine">
          <span className="spine-label">manual</span>
        </div>
        <div>
          <h1 className="enter-solid">{field('privacy', 'headline')}</h1>
          <p className={`mono ${styles.small} enter`}>{field('privacy', 'small')}</p>
          <div
            className={`${styles.body} enter`}
            style={{ '--enter-delay': '120ms' } as React.CSSProperties}
          >
            <Body blocks={s.blocks} skip={['field']} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
