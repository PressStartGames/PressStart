import type { CSSProperties } from 'react';
import { field, splitList } from '../../content';
import { BASE, FLAGS } from '../../lib/config';
import { PixelIcon } from '../ui/PixelIcon';
import { Prose } from '../ui/Prose';
import { Screen } from '../ui/Screen';
import styles from './Hero.module.css';
import { STAGES } from './stages';

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties;

// The hero: what the engine is, in one sentence, and the whole tour at a glance as a cartridge's stage
// select (each cartridge is a link to its stage). The load sequence is CSS, so it starts with the first
// paint and costs no script: the text rises in (the h1 without opacity, so it paints as the LCP), the
// screen powers on from a bright line, the cartridges are dealt in, "press start" blinks twice and holds.
// The prerendered HTML is the final state; reduced motion and no JS see only that.
export function Hero() {
  const [join = '', tour = ''] = splitList(field('site-home', 'cta'), '|');
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={`frame ${styles.grid}`}>
        <div className={styles.text}>
          <p className={`enter ${styles.kicker}`} style={delay(0)}>
            <span className={styles.led} aria-hidden="true" />
            {field('site-home', 'kicker')}
          </p>
          <h1 id="home-title" className={`enter-solid ${styles.headline}`} style={delay(40)}>
            {field('site-home', 'headline')}
          </h1>
          <Prose id="site-home" className={`enter ${styles.lede}`} />
          <div className={`enter ${styles.keys}`} style={delay(220)}>
            {FLAGS.joinBeta && (
              <a className="key" href={`${BASE}beta/`}>
                <span className="key-led" aria-hidden="true" />
                {join}
              </a>
            )}
            <a className="key key-ghost" href="#tour">
              {tour}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className={`enter ${styles.small}`} style={delay(300)}>
            {field('site-home', 'small')}
          </p>
        </div>
        <div className={styles.selectWrap}>
          <Screen
            label={field('site-home', 'select-label')}
            readout={field('site-home', 'select-readout')}
            className={styles.selectScreen}
          >
            <nav className={styles.select} aria-label={field('site-tour', 'label')}>
              <ol className={styles.carts}>
                {STAGES.map((s, i) => (
                  <li
                    key={s.id}
                    className={styles.slot}
                    style={{ '--accent': s.color, '--i': i } as CSSProperties}
                  >
                    <a href={`#${s.id}`} className={styles.cart}>
                      <span className={styles.cartLabel}>
                        <PixelIcon name={s.icon} scale={3} />
                      </span>
                      <span className={styles.cartNo}>{s.no}</span>
                      <span className={styles.cartName}>{field(s.section, 'kicker')}</span>
                    </a>
                  </li>
                ))}
              </ol>
              <p className={styles.prompt} aria-hidden="true">
                ▶ {field('site-home', 'select-prompt')}
              </p>
            </nav>
          </Screen>
        </div>
      </div>
    </section>
  );
}
