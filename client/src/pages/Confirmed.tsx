import { Body } from '../components/Body';
import { Pill } from '../components/Pill';
import { field, section } from '../content';
import { Footer } from '../sections/Footer';
import styles from './Page.module.css';

// Where the double opt-in link lands (the Worker's /api/confirm redirects here).
export function Confirmed() {
  const s = section('confirmed');
  return (
    <div data-act="booth" className={styles.page}>
      <div className={`column ${styles.pageMain}`}>
        <p className="kicker enter">{field('confirmed', 'kicker')}</p>
        <h1 className="enter" style={{ '--enter-delay': '100ms' } as React.CSSProperties}>
          {field('confirmed', 'headline')}
        </h1>
        <div className="enter" style={{ '--enter-delay': '200ms' } as React.CSSProperties}>
          <Body blocks={s.blocks} skip={['field']} />
        </div>
        <div
          className={`${styles.pageCta} enter`}
          style={{ '--enter-delay': '300ms' } as React.CSSProperties}
        >
          <Pill to="/">{field('confirmed', 'cta')}</Pill>
        </div>
      </div>
      <Footer />
    </div>
  );
}
