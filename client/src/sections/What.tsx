import { Reveal } from '../components/Reveal';
import { field, section, splitLead } from '../content';
import { Inline } from '../content/inline';
import styles from './What.module.css';

// A spec sheet: three hairlined rows, mono index, bold lead, body. No cards.
export function What({ index, label }: { index: string; label: string }) {
  const s = section('what');
  const rowsOut = s.blocks
    .filter((b) => b.type === 'p')
    .map((b) => splitLead(b.type === 'p' ? b.text : ''));
  return (
    <section id="what" className="section" aria-labelledby="what-title">
      <div className="frame row">
        <div className="spine">
          <span className="spine-index">{index}</span>
          <span className="spine-label">{label}</span>
        </div>
        <div>
          <Reveal>
            <h2 id="what-title" className={styles.title}>
              {field('what', 'headline')}
            </h2>
          </Reveal>
          <Reveal as="dl" className={styles.sheet} delay={100}>
            <div className={styles.sheetHead} aria-hidden="true">
              <span className="label">{field('what', 'spec-label')}</span>
            </div>
            {rowsOut.map((r, i) => (
              <div key={r.lead} className={styles.specRow}>
                <dt className={styles.specLead}>
                  <span className={styles.specNo}>{String(i + 1).padStart(2, '0')}</span>
                  {r.lead}
                </dt>
                <dd className={styles.specBody}>
                  <Inline text={r.rest} />
                </dd>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
