import { Fragment, type CSSProperties } from 'react';
import { Pill } from '../components/Pill';
import { ReplayStrip } from '../components/ReplayStrip';
import { field, section, splitList } from '../content';
import { Inline } from '../content/inline';
import styles from './Hero.module.css';

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties;

// The headline rises word by word (transform only, so the first paint already carries the LCP
// text); the phrase after the last comma gets the signal underline.
function Headline({ text }: { text: string }) {
  const cut = text.lastIndexOf(', ');
  const head = cut >= 0 ? text.slice(0, cut + 2) : text;
  const tail = cut >= 0 ? text.slice(cut + 2) : '';
  const words = head.split(' ').filter(Boolean);
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className={styles.wordWrap}>
            <span className={`${styles.word} enter-solid`} style={delay(60 + i * 55)}>
              {w}
            </span>
          </span>{' '}
        </Fragment>
      ))}
      {tail && (
        <span className={styles.wordWrap}>
          <span
            className={`${styles.word} ${styles.tail} enter-solid`}
            style={delay(60 + words.length * 55)}
          >
            {tail}
            <span className={styles.underline} aria-hidden="true" />
          </span>
        </span>
      )}
    </>
  );
}

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
        <h1 id="hero-title">
          <Headline text={field('hero', 'headline')} />
        </h1>
        {body && body.type === 'p' && (
          <p className={`enter ${styles.lede}`} style={delay(200)}>
            <Inline text={body.text} />
          </p>
        )}
        <div className={`enter ${styles.ctas}`} style={delay(280)}>
          <Pill href="#signup">{primary}</Pill>
          <a href="#built" className={styles.secondary}>
            {secondary}
          </a>
        </div>
        <p className={`small enter ${styles.small}`} style={delay(340)}>
          {field('hero', 'small')}
        </p>
      </div>
      <div className={`breakout enter ${styles.stripWrap}`} style={delay(400)}>
        <ReplayStrip />
      </div>
    </section>
  );
}
