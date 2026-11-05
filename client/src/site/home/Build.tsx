import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { field, section } from '../../content';
import { Inline } from '../../content/inline';
import { motionOk } from '../../lib/gsap';
import { href, rows } from '../data';
import { onceInView, reveal } from '../motion';
import { PixelIcon } from '../PixelIcon';
import ui from '../ui.module.css';
import styles from './Build.module.css';

const S = 'site-home-build';
const VERBS = rows(S, 'verbs');

// 01 Build as data: the claim in plain words, and the four-verb console. The console's screen is a
// transcript of four exchanges (an illustration in plain words, not the wire format); its keys light
// one exchange at a time. On first view it steps through the four once; then it waits for a press.
export function Build() {
  const verbs = VERBS;
  const body = section(S).blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []));
  const [active, setActive] = useState(0);
  const deviceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = deviceRef.current;
    if (!el || !motionOk()) return;
    const timers: number[] = [];
    const stop = onceInView(el, () => {
      VERBS.forEach((_, i) => {
        timers.push(window.setTimeout(() => setActive(i), 600 + i * 1700));
      });
    });
    return () => {
      stop();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <section id="build" className={`${ui.section} ${styles.build}`} aria-labelledby="build-title">
      <div className={`frame ${styles.grid}`}>
        <div className={styles.copy} data-reveal="" ref={reveal}>
          <p className={ui.kicker}>
            <span className={ui.chip} data-move="build">
              <PixelIcon name="build" size={16} />
            </span>
            {field(S, 'kicker')}
          </p>
          <h2 id="build-title" className={ui.h2}>
            {field(S, 'headline')}
          </h2>
          <div className={`${ui.lede} ${styles.lede}`}>
            {body.map((t, i) => (
              <p key={i}>
                <Inline text={t} />
              </p>
            ))}
          </div>
          <Link className={ui.textLink} to={href('engine-ai')}>
            {field(S, 'link')}
            <span className={ui.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        </div>
        <div className={styles.device} ref={deviceRef}>
          <div className={ui.bezel}>
            <div className={`${ui.screen} ${styles.screen}`}>
              <p className={`${ui.pixel} ${styles.screenHead}`}>
                <span className={styles.lamp} aria-hidden="true" />
                {field(S, 'console-label')}
              </p>
              <ol className={styles.transcript}>
                {verbs.map(([verb = '', , ask = '', answer = ''], i) => (
                  <li
                    key={verb}
                    className={styles.exchange}
                    data-active={i === active ? '' : undefined}
                  >
                    <p className={styles.ask}>
                      <span className={styles.who}>{field(S, 'you')}</span>
                      <span className={styles.verb}>{verb}</span>
                      {ask}
                    </p>
                    <p className={styles.answer} key={i === active ? `on-${active}` : 'off'}>
                      <span className={styles.who}>{field(S, 'game')}</span>
                      {answer}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <div className={styles.keys}>
              {verbs.map(([verb = '', label = ''], i) => (
                <button
                  key={verb}
                  type="button"
                  className={styles.key}
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                >
                  <span className={styles.keyLed} aria-hidden="true" />
                  <span className={styles.keyVerb}>{verb}</span>
                  <span className={styles.keyLabel}>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <p className={styles.note}>{field(S, 'console-note')}</p>
        </div>
      </div>
    </section>
  );
}
