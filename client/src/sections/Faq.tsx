import { Reveal } from '../components/Reveal';
import { field, section, splitLead } from '../content';
import { Inline } from '../content/inline';
import styles from './Faq.module.css';

// The manual: an index of questions with the answers printed inline. Nothing to open.
export function Faq({ index, label }: { index: string; label: string }) {
  const s = section('faq');
  const list = s.blocks.find((b) => b.type === 'ol');
  const items = list?.type === 'ol' ? list.items : [];
  return (
    <section id="faq" className="section" aria-labelledby="faq-title">
      <div className="frame row">
        <div className="spine">
          <span className="spine-index">{index}</span>
          <span className="spine-label">{label}</span>
        </div>
        <div>
          <Reveal className={styles.head}>
            <h2 id="faq-title">{field('faq', 'headline')}</h2>
            <span className="label">{field('faq', 'manual-label')}</span>
          </Reveal>
          <Reveal as="dl" className={styles.manual} delay={80}>
            {items.map((item, i) => {
              const { lead, rest } = splitLead(item);
              return (
                <div key={lead} className={styles.entry}>
                  <dt className={styles.q}>
                    <span className={styles.no}>{String(i + 1).padStart(2, '0')}</span>
                    {lead}
                  </dt>
                  <dd className={styles.a}>
                    <Inline text={rest} />
                  </dd>
                </div>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
