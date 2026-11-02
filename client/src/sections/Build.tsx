import { useRef } from 'react';
import { CodeSample } from '../components/CodeSample';
import { Reveal } from '../components/Reveal';
import { field, section, splitLead, splitList } from '../content';
import { Inline } from '../content/inline';
import { desktop, motionOk, useGsap } from '../lib/gsap';
import { useActiveStep } from '../lib/useActiveStep';
import styles from './Build.module.css';

// "15-17" -> [15, 16, 17]
function range(spec: string): number[] {
  const [a, b] = spec.split('-').map((n) => Number(n.trim()));
  if (a === undefined || Number.isNaN(a)) return [];
  const end = b === undefined || Number.isNaN(b) ? a : b;
  return Array.from({ length: end - a + 1 }, (_, i) => a + i);
}

// The procedure: numbered steps down the left, the code screen pinned on the right. The step
// nearest the middle of the viewport is lit, and so are its lines in the code (CONTENT.md's
// `sample-lines`). On desktop a scroll scrub fills the progress rule in the code's chrome and
// nudges the pinned screen, so the reader's scroll is the clock.
export function Build({ index, label }: { index: string; label: string }) {
  const s = section('build');
  const steps = s.blocks.find((b) => b.type === 'ol');
  const code = s.blocks.find((b) => b.type === 'code');
  const commit = field('build', 'sample-commit').slice(0, 7);
  const listRef = useRef<HTMLOListElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const items = steps?.type === 'ol' ? steps.items : [];
  const lineSpecs = splitList(field('build', 'sample-lines'), '|');
  const active = useActiveStep(listRef, items.length);
  const lit = range(lineSpecs[active] ?? '');

  useGsap(
    ({ gsap, ScrollTrigger }) => {
      const list = listRef.current;
      const bar = progressRef.current;
      const codeEl = codeRef.current;
      if (!list || !bar || !codeEl) return;
      gsap.set(bar, { scaleX: 0, transformOrigin: '0 50%' });
      const st = ScrollTrigger.create({
        trigger: list,
        start: 'top 55%',
        end: 'bottom 55%',
        scrub: 0.4,
        animation: gsap
          .timeline()
          .to(bar, { scaleX: 1, ease: 'none', duration: 1 }, 0)
          .fromTo(codeEl, { y: 12 }, { y: -12, ease: 'none', duration: 1 }, 0),
      });
      return () => st.kill();
    },
    [],
    () => motionOk() && desktop(),
    true,
  );

  return (
    <section id="build" className="section" aria-labelledby="build-title">
      <div className="frame row">
        <div className="spine">
          <span className="spine-index">{index}</span>
          <span className="spine-label">{label}</span>
        </div>
        <div>
          <Reveal>
            <h2 id="build-title" className={styles.title}>
              {field('build', 'headline')}
            </h2>
          </Reveal>
          <div className={styles.grid}>
            <div>
              <p className="label">{field('build', 'procedure-label')}</p>
              <ol className={styles.steps} ref={listRef}>
                {items.map((item, i) => {
                  const { lead, rest } = splitLead(item);
                  return (
                    <li key={lead} className={styles.step} data-active={i === active || undefined}>
                      <span className={styles.stepNo}>{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h3 className={styles.lead}>{lead}</h3>
                        <p className={styles.rest}>
                          <Inline text={rest} />
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
            <Reveal className={styles.code} delay={120}>
              <div ref={codeRef}>
                {code?.type === 'code' && (
                  <CodeSample
                    lang={code.lang}
                    text={code.text}
                    caption={`${field('build', 'sample-caption')} · ${commit}`}
                    lit={lit}
                    progressRef={progressRef}
                  />
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
