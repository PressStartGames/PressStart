import type { CSSProperties } from 'react';
import { Pill } from '../components/Pill';
import { ReplayStrip } from '../components/ReplayStrip';
import { field, section, splitList } from '../content';
import { Inline } from '../content/inline';
import styles from './Hero.module.css';

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties;

// Spine 00 · BOOT; the headline at the largest size on the page; the main screen below.
export function Hero({ index, label }: { index: string; label: string }) {
  const s = section('hero');
  const [primary = '', secondary = ''] = splitList(field('hero', 'cta'), '|');
  const body = s.blocks.find((b) => b.type === 'p');
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className="frame">
        <div className="row">
          <div className="spine">
            <span className="spine-index">{index}</span>
            <span className="spine-label">{label}</span>
          </div>
          <div className={styles.text}>
            <p className={`${styles.kicker} enter`} style={delay(0)}>
              <span className="led" aria-hidden="true" />
              {field('hero', 'kicker')}
            </p>
            <h1 id="hero-title" className="enter-solid" style={delay(60)}>
              {field('hero', 'headline')}
            </h1>
            <div className={styles.under}>
              {body && body.type === 'p' && (
                <p className={`lede enter ${styles.lede}`} style={delay(200)}>
                  <Inline text={body.text} />
                </p>
              )}
              <div className={`enter ${styles.keys}`} style={delay(280)}>
                <Pill href="#signup">{primary}</Pill>
                <Pill href="#built" variant="ghost">
                  {secondary}
                </Pill>
                <p className={`small ${styles.small}`}>{field('hero', 'small')}</p>
              </div>
            </div>
          </div>
        </div>
        <div className={`enter ${styles.screenWrap}`} style={delay(360)}>
          <ReplayStrip id="main-screen" />
        </div>
      </div>
    </section>
  );
}
