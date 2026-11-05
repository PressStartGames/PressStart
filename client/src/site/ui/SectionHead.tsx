import { useRef, type ReactNode } from 'react';
import { Inline } from '../../content/inline';
import { useGsap } from '../../lib/gsap';
import type { Tone } from '../lib/strengths';
import ui from './ui.module.css';

// A section's kicker, h2 and optional lede. The h2 rises word by word when it scrolls in (GSAP
// SplitText); a heading already on screen when GSAP arrives is left alone, so nothing flashes.
export function SectionHead({
  id,
  kicker,
  title,
  lede,
  tone = 'ink',
  center = false,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  lede?: string;
  tone?: Tone;
  center?: boolean;
  children?: ReactNode;
}) {
  const h2 = useRef<HTMLHeadingElement>(null);
  useGsap(
    ({ gsap, SplitText }) => {
      const el = h2.current;
      if (!el || el.getBoundingClientRect().top < window.innerHeight) return;
      const split = SplitText.create(el, { type: 'words', mask: 'words', aria: 'auto' });
      for (const m of split.masks) (m as HTMLElement).classList.add('l3-word-mask');
      gsap.from(split.words, {
        yPercent: 110,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    },
    [],
    undefined,
    true,
  );
  return (
    <div className={[ui.head, center ? ui.headCenter : '', ui[tone]].join(' ')}>
      <p className={ui.kicker}>
        <span className={ui.kickerDot} aria-hidden="true" />
        {kicker}
      </p>
      <h2 id={id} ref={h2} className={ui.title}>
        {title}
      </h2>
      {lede ? (
        <p className={ui.lede}>
          <Inline text={lede} />
        </p>
      ) : null}
      {children}
    </div>
  );
}
