import type { CSSProperties } from 'react';
import { Pill } from '../components/Pill';
import { ReplayStrip } from '../components/ReplayStrip';
import { field, section, splitList } from '../content';
import { Inline } from '../content/inline';
import styles from './Hero.module.css';

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties;

export function Hero() {
  const s = section('hero');
  const [primary = '', secondary = ''] = splitList(field('hero', 'cta'), '|');
  const body = s.blocks.find((b) => b.type === 'p');
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`column ${styles.text}`}>
        <p className={`kicker enter ${styles.kicker}`} style={delay(0)}>
          {field('hero', 'kicker')}
        </p>
        <h1 id="hero-title" className="enter-solid" style={delay(0)}>
          {field('hero', 'headline')}
        </h1>
        {body && body.type === 'p' && (
          <p className={`enter ${styles.lede}`} style={delay(140)}>
            <Inline text={body.text} />
          </p>
        )}
        <div className={`enter ${styles.ctas}`} style={delay(220)}>
          <Pill href="#signup">{primary}</Pill>
          <a href="#built" className={styles.secondary}>
            {secondary}
          </a>
        </div>
        <p className={`small enter ${styles.small}`} style={delay(280)}>
          {field('hero', 'small')}
        </p>
      </div>
      <div className={`breakout enter ${styles.stripWrap}`} style={delay(340)}>
        <ReplayStrip />
      </div>
    </section>
  );
}
