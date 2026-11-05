import { Link } from 'react-router';
import { field, splitLead } from '../../content';
import { Inline } from '../../content/inline';
import { sitePagePath } from '../../routes';
import { items } from '../lib/copy';
import { VALUE_STRENGTHS } from '../lib/strengths';
import { useInView } from '../lib/useInView';
import { vars } from '../lib/vars';
import { PixelIcon } from '../ui/PixelIcon';
import ui from '../ui/ui.module.css';
import styles from './ValueButtons.module.css';

// The value-badge strip: Deterministic · All cores · Measured · Yours as four face buttons on one
// panel, each a door to its strength page. They press in sequence, once, when the panel scrolls in.
export function ValueButtons() {
  const [ref, seen] = useInView<HTMLElement>('0px 0px -20% 0px');
  const values = items('site-values');
  return (
    <section
      ref={ref}
      className={`${ui.wrap} ${styles.panel}`}
      aria-labelledby="values-title"
      data-seen={seen || undefined}
    >
      <h2 id="values-title" className="visually-hidden">
        {field('site-values', 'label')}
      </h2>
      <ul className={styles.list}>
        {VALUE_STRENGTHS.map((s, i) => {
          const { lead, rest } = splitLead(values[i] ?? '');
          return (
            <li key={s.id} className={ui[s.tone]} style={vars({ '--i': i })}>
              <Link to={sitePagePath(s.id)} className={styles.value}>
                <span className={styles.button} aria-hidden="true">
                  <PixelIcon name={s.icon} className={styles.icon} />
                </span>
                <span className={styles.text}>
                  <span className={styles.lead}>
                    {lead}
                    <span className={styles.go} aria-hidden="true">
                      →
                    </span>
                  </span>
                  <span className={styles.rest}>
                    <Inline text={rest} />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
