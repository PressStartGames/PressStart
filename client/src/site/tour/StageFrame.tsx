import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import { PixelIcon } from '../ui/PixelIcon';
import { Prose } from '../ui/Prose';
import { useInView } from '../ui/useInView';
import styles from './StageFrame.module.css';
import { stage } from './stages';

// One stage of the tour: the chip (icon, number, name) wipes open, the claim rises, then two or three
// friendly paragraphs beside the proof. Odd stages put the proof first on wide screens, so the page
// zig-zags like a map. `aside` is a small honest line; `more` links to the stage's own page.
export function StageFrame({
  id,
  children,
  aside,
  more,
  flip = false,
  wide = false,
}: {
  id: string;
  children: ReactNode;
  aside?: string;
  more?: string;
  flip?: boolean;
  wide?: boolean;
}) {
  const s = stage(id);
  const ref = useRef<HTMLElement>(null);
  useInView(ref, undefined, '0px 0px -25% 0px');
  return (
    <section
      id={s.id}
      ref={ref}
      className={styles.stage}
      style={{ '--accent': s.color } as CSSProperties}
      aria-labelledby={`${s.id}-title`}
      data-io
    >
      <div className={styles.head}>
        <p className={styles.chip}>
          <span className={styles.chipIcon}>
            <PixelIcon name={s.icon} scale={2} />
          </span>
          <span className={styles.chipNo}>
            {field('site-tour', 'stage-word')} {s.no}
          </span>
          <span className={styles.chipName}>{field(s.section, 'kicker')}</span>
        </p>
        <h2 id={`${s.id}-title`} className={`${styles.title} io-rise`}>
          {field(s.section, 'headline')}
        </h2>
      </div>
      <div
        className={styles.body}
        data-flip={flip ? '' : undefined}
        data-wide={wide ? '' : undefined}
      >
        <div className={`${styles.copy} io-rise`} style={{ '--i': 1 } as CSSProperties}>
          <Prose id={s.section} className={styles.prose} />
          {aside && <p className={styles.aside}>{aside}</p>}
          {more && (
            <Link className="more" to={more}>
              {field('site-tour', 'more')}
              <span className="more-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          )}
        </div>
        <div className={styles.proof}>{children}</div>
      </div>
    </section>
  );
}
