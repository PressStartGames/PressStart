import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { field, section } from '../../content';
import { Inline } from '../../content/inline';
import { BASE, FLAGS } from '../../lib/config';
import { href, list } from '../data';
import ui from '../ui.module.css';
import styles from './Hero.module.css';
import { SuiteConsole } from './SuiteConsole';

// The words of the headline that carry a move's colour underline.
const MARKED: Record<string, 'build' | 'prove'> = { build: 'build', prove: 'prove' };

// The hero: kicker, the h1 (the LCP; its words rise from first paint without fading, so the
// prerendered text is the painted text), the lede, two calls to action, then the suite console.
export function Hero() {
  const words = field('site-home', 'headline').split(' ');
  const [join = '', engine = ''] = list('site-home', 'cta');
  const lede = section('site-home').blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []));
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={`frame ${styles.head}`}>
        <p className={`${styles.kicker} enter`}>
          <span className={styles.badge}>
            <span className="led" aria-hidden="true" />
            {field('site-home', 'kicker')}
          </span>
        </p>
        <h1 id="home-title" className={styles.h1}>
          {words.map((w, i) => {
            const move = MARKED[w.replace(/[^a-z]/gi, '').toLowerCase()];
            return (
              <span key={i}>
                <span
                  className={styles.word}
                  data-move={move}
                  style={{ '--i': i } as CSSProperties}
                >
                  {w}
                </span>
                {i < words.length - 1 ? ' ' : null}
              </span>
            );
          })}
        </h1>
        {lede.map((t, i) => (
          <p
            key={i}
            className={`${styles.lede} enter`}
            style={{ '--enter-delay': '260ms' } as CSSProperties}
          >
            <Inline text={t} />
          </p>
        ))}
        <p
          className={`${styles.actions} enter`}
          style={{ '--enter-delay': '380ms' } as CSSProperties}
        >
          {FLAGS.joinBeta ? (
            <a className={`${ui.btn} ${ui.primary}`} href={`${BASE}beta/`}>
              <span className={ui.led} aria-hidden="true" />
              {join}
            </a>
          ) : null}
          <Link className={`${ui.btn} ${ui.ghost}`} to={href('engine')}>
            {engine}
            <span className={ui.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        </p>
      </div>
      <div
        className={`frame ${styles.stage} enter`}
        style={{ '--enter-delay': '480ms' } as CSSProperties}
      >
        <SuiteConsole />
      </div>
    </section>
  );
}
