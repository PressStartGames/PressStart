import { useRef, type CSSProperties } from 'react';
import { Pill } from '../components/Pill';
import { ReplayStrip } from '../components/ReplayStrip';
import { field, section, splitList } from '../content';
import { Inline } from '../content/inline';
import { finePointer, motionOk, useGsap } from '../lib/gsap';
import { BOOTED_EVENT, setHeroReady } from '../lib/heroState';
import styles from './Hero.module.css';

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties;

// Spine 00 · BOOT; the headline at the largest size on the page; the main screen below.
//
// With JavaScript and motion allowed, the hero is one GSAP timeline that starts when the boot
// screen lifts (or at once when this session already booted): the main screen powers on, the
// kicker types in as the last boot line, the headline rises line by line through masks with a
// phosphor flicker on the last phrase, the lede and keys settle, and the attract mode is released.
// The prerendered HTML is the final state; the CSS load sequence holds the elements until the
// timeline takes over, and is the whole story for reduced motion and no JS.
export function Hero({ index, label }: { index: string; label: string }) {
  const s = section('hero');
  const [primary = '', secondary = ''] = splitList(field('hero', 'cta'), '|');
  const body = s.blocks.find((b) => b.type === 'p');
  const root = useRef<HTMLElement>(null);
  const headline = field('hero', 'headline');
  const tail = headline.slice(headline.lastIndexOf(', ') + 2);

  useGsap(
    ({ gsap, SplitText }) => {
      const el = root.current;
      if (!el) return;
      const h1 = el.querySelector<HTMLElement>('h1');
      const kicker = el.querySelector<HTMLElement>(`.${styles.kicker}`);
      const lede = el.querySelector<HTMLElement>(`.${styles.lede}`);
      const keys = el.querySelector<HTMLElement>(`.${styles.keys}`);
      const screen = el.querySelector<HTMLElement>('#main-screen');
      const glass = screen?.querySelector<HTMLElement>('[data-glass]');
      const scan = screen?.querySelector<HTMLElement>('[data-scanlines]');
      if (!h1 || !kicker || !screen || !glass) return;

      setHeroReady(false);
      h1.setAttribute('aria-label', headline);
      const flash = document.createElement('span');
      flash.setAttribute('aria-hidden', 'true');
      flash.style.cssText =
        'position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:6';
      glass.appendChild(flash);
      const split = new SplitText(h1, {
        type: 'lines,words',
        mask: 'lines',
        linesClass: 'hero-line',
        wordsClass: 'hero-glyph',
      });
      const chars = split.words as HTMLElement[];
      const tailStart = Math.max(0, chars.length - tail.split(/\s+/).filter(Boolean).length);
      const tailChars = chars.slice(tailStart);
      const kickerSplit = new SplitText(kicker, { type: 'words,chars', aria: 'none' });
      const settle = [lede, keys].filter((x): x is HTMLElement => !!x);

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
        onStart: () => el.classList.add('gsap-on'),
        onComplete: () => {
          // The masks did their job; let descenders breathe and the kinetic weight move freely.
          el.querySelectorAll<HTMLElement>('.hero-line-mask').forEach((m) => {
            m.style.overflow = 'visible';
          });
          setHeroReady(true);
        },
      });
      tl.set(settle, { autoAlpha: 0, y: 16 })
        .set(kickerSplit.chars, { autoAlpha: 0 })
        .set(chars, { yPercent: 130 })
        .set(glass, { scaleY: 0.004, transformOrigin: '50% 50%' })
        .set(flash, { opacity: 0.9 })
        .set(scan ? [scan] : [], { autoAlpha: 0 })
        // power on: a thin bright line opens into the screen, the brightness settles, scanlines land
        .to(glass, { scaleY: 1, duration: 0.55, ease: 'expo.out' }, 0.05)
        .to(flash, { opacity: 0, duration: 0.7, ease: 'power2.out' }, 0.3)
        .to(scan ? [scan] : [], { autoAlpha: 1, duration: 0.3 }, 0.5)
        // the kicker types in like the last boot line
        .to(kickerSplit.chars, { autoAlpha: 1, duration: 0.01, stagger: 0.028 }, 0.25)
        // the headline rises through its line masks
        .to(chars, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.06 }, 0.55)
        // phosphor flicker on the last phrase, then settled
        .to(tailChars, { opacity: 0.35, duration: 0.05, ease: 'steps(1)' }, 1.55)
        .to(tailChars, { opacity: 1, duration: 0.05, ease: 'steps(1)' }, 1.65)
        .to(tailChars, { opacity: 0.5, duration: 0.05, ease: 'steps(1)' }, 1.75)
        .to(tailChars, { opacity: 1, duration: 0.08 }, 1.82)
        .to(settle, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 1.4);

      const start = () => {
        window.removeEventListener(BOOTED_EVENT, start);
        tl.play(0);
      };
      if (document.documentElement.classList.contains('booting')) {
        window.addEventListener(BOOTED_EVENT, start, { once: true });
      } else {
        start();
      }

      // Kinetic weight: glyphs near the cursor get heavier with a soft falloff; springs back.
      let off: (() => void) | undefined;
      if (finePointer()) {
        const setters = chars.map((c) =>
          gsap.quickTo(c, '--wght', { duration: 0.45, ease: 'power3.out' }),
        );
        let rects: DOMRect[] = [];
        let fixed = false;
        const onMove = (e: PointerEvent) => {
          if (!rects.length) {
            rects = chars.map((c) => c.getBoundingClientRect());
            if (!fixed) {
              // Fix each glyph's width at its resting weight so a heavier glyph never reflows the
              // line: all reads above, all writes here, one layout.
              fixed = true;
              chars.forEach((c, i) => {
                c.style.width = `${rects[i]!.width}px`;
              });
            }
          }
          for (let i = 0; i < chars.length; i++) {
            const r = rects[i]!;
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const d = Math.hypot(dx, dy);
            setters[i]!(d < 140 ? 500 + 200 * (1 - d / 140) : 500);
          }
        };
        const onLeave = () => setters.forEach((set) => set(500));
        const invalidate = () => (rects = []);
        h1.addEventListener('pointermove', onMove);
        h1.addEventListener('pointerleave', onLeave);
        window.addEventListener('scroll', invalidate, { passive: true });
        window.addEventListener('resize', invalidate);
        off = () => {
          h1.removeEventListener('pointermove', onMove);
          h1.removeEventListener('pointerleave', onLeave);
          window.removeEventListener('scroll', invalidate);
          window.removeEventListener('resize', invalidate);
        };
      }

      return () => {
        off?.();
        window.removeEventListener(BOOTED_EVENT, start);
        tl.kill();
        flash.remove();
        split.revert();
        kickerSplit.revert();
        h1.removeAttribute('aria-label');
        el.classList.remove('gsap-on');
        setHeroReady(true);
      };
    },
    [],
    motionOk,
  );

  return (
    <section ref={root} className={styles.hero} aria-labelledby="hero-title">
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
            <h1 id="hero-title" className={`enter-solid ${styles.headline}`} style={delay(60)}>
              {headline}
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
