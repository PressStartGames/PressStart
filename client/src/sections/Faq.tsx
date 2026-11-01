import { Reveal } from '../components/Reveal';
import { field, section, splitLead } from '../content';
import { Inline } from '../content/inline';
import styles from './Faq.module.css';

export function Faq() {
  const s = section('faq');
  const list = s.blocks.find((b) => b.type === 'ol');
  return (
    <section id="faq" className="section" aria-labelledby="faq-title">
      <div className="column">
        <Reveal className="section-head">
          <h2 id="faq-title">{field('faq', 'headline')}</h2>
        </Reveal>
        <Reveal delay={80} className={styles.list}>
          {list?.type === 'ol' &&
            list.items.map((item) => {
              const { lead, rest } = splitLead(item);
              return (
                <details key={lead} className={styles.item} name="faq">
                  <summary className={styles.summary}>
                    <span className={styles.q}>{lead}</span>
                    <span className={styles.chev} aria-hidden="true" />
                  </summary>
                  <p className={styles.a}>
                    <Inline text={rest} />
                  </p>
                </details>
              );
            })}
        </Reveal>
      </div>
    </section>
  );
}
