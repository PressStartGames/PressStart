import { Body } from '../components/Body';
import { field, section } from '../content';
import { Footer } from '../sections/Footer';
import styles from './Page.module.css';

export function Privacy() {
  const s = section('privacy');
  return (
    <div data-act="booth" className={styles.page}>
      <div className={`column ${styles.pageMain}`}>
        <h1 className="enter">{field('privacy', 'headline')}</h1>
        <p className={`small ${styles.pageSmall} enter`}>{field('privacy', 'small')}</p>
        <div className="enter" style={{ '--enter-delay': '120ms' } as React.CSSProperties}>
          <Body blocks={s.blocks} skip={['field']} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
