import { useRef, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { field, section } from '../../content';
import { Inline } from '../../content/inline';
import { useGsap } from '../../lib/gsap';
import { href, list } from '../data';
import { reveal } from '../motion';
import { PixelIcon } from '../PixelIcon';
import ui from '../ui.module.css';
import styles from './Own.module.css';

const S = 'site-home-own';

// 03 Own the code: the game as a cartridge that is yours, seated into its slot as the section
// arrives, beside two ledgers kept apart on purpose: what is true today, and what comes with version 1.
// With GSAP (after idle) the cartridge follows the scroll into the slot and the lamp lights when it
// seats; otherwise a CSS transition seats it once; the prerendered state is seated.
export function Own() {
  const stageRef = useRef<HTMLDivElement>(null);
  useGsap(
    ({ gsap }) => {
      const stage = stageRef.current;
      const cart = stage?.querySelector('[data-cart]');
      if (!stage || !cart) return;
      stage.setAttribute('data-gsap', '');
      gsap.fromTo(
        cart,
        { y: -170, rotate: -5 },
        {
          y: 0,
          rotate: 0,
          ease: 'power2.in',
          scrollTrigger: {
            trigger: stage,
            start: 'top 85%',
            end: 'center 55%',
            scrub: 0.5,
            onUpdate: (st) => stage.toggleAttribute('data-seated', st.progress > 0.98),
          },
        },
      );
      return () => {
        stage.removeAttribute('data-gsap');
        stage.removeAttribute('data-seated');
      };
    },
    [],
    undefined,
    true,
  );
  const body = section(S).blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []));
  const today = list(S, 'today');
  const road = list(S, 'road');
  const cart = list(S, 'cart-lines');
  return (
    <section id="own" className={`${ui.section} ${styles.own}`} aria-labelledby="own-title">
      <div className={`frame ${styles.grid}`}>
        <div
          className={styles.stage}
          ref={(el) => {
            stageRef.current = el;
            return reveal(el);
          }}
          aria-hidden="true"
        >
          <div className={styles.cart} data-cart="">
            <span className={styles.grip} />
            <span className={styles.label}>
              <span className={styles.labelTop}>
                <PixelIcon name="own" size={18} />
                {field(S, 'cart-label')}
              </span>
              {cart.map((l) => (
                <span key={l} className={styles.labelLine}>
                  {l}
                </span>
              ))}
            </span>
            <span className={styles.pins} />
          </div>
          <div className={styles.slot}>
            <span className={styles.slotMouth} />
            <span className={styles.slotLed} />
          </div>
        </div>
        <div className={styles.copy}>
          <p className={ui.kicker}>
            <span className={ui.chip} data-move="own">
              <PixelIcon name="own" size={16} />
            </span>
            {field(S, 'kicker')}
          </p>
          <h2 id="own-title" className={ui.h2}>
            {field(S, 'headline')}
          </h2>
          <div className={`${ui.lede} ${styles.lede}`}>
            {body.map((t, i) => (
              <p key={i}>
                <Inline text={t} />
              </p>
            ))}
          </div>
          <div className={styles.ledgers}>
            <div className={styles.ledger} data-reveal="" ref={reveal}>
              <h3 className={styles.ledgerHead}>
                <span className={styles.on} aria-hidden="true" />
                {field(S, 'today-label')}
              </h3>
              <ul>
                {today.map((t) => (
                  <li key={t}>
                    <PixelIcon name="check" size={14} className={styles.tick} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className={styles.ledger}
              data-reveal=""
              ref={reveal}
              style={{ '--d': '140ms' } as CSSProperties}
            >
              <h3 className={styles.ledgerHead}>
                <span className={styles.off} aria-hidden="true" />
                {field(S, 'road-label')}
              </h3>
              <ul>
                {road.map((t) => (
                  <li key={t}>
                    <PixelIcon name="road" size={14} className={styles.ring} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link className={ui.textLink} to={href('engine-ownership')}>
            {field(S, 'link')}
            <span className={ui.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
