import { Link } from 'react-router';
import { field, splitList } from '../../content';
import { Inline } from '../../content/inline';
import { sitePagePath } from '../../routes';
import { StartBand } from '../home/StartBand';
import { items, paragraphs, rows } from '../lib/copy';
import type { IconName } from '../lib/icons';
import { STRENGTHS } from '../lib/strengths';
import { useInView } from '../lib/useInView';
import { vars } from '../lib/vars';
import { PageHero } from '../ui/PageHero';
import { PixelIcon } from '../ui/PixelIcon';
import { SectionHead } from '../ui/SectionHead';
import ui from '../ui/ui.module.css';
import styles from './Engine.module.css';

const LOOP_ICONS: readonly IconName[] = ['doc', 'play', 'target', 'key'];
const LOOP_TONES = ['blue', 'red', 'green', 'amber'] as const;
const STACK_TONES = ['red', 'ink', 'blue'] as const;

// Three blocks, your game on the engine on Rust, stacking in when the page loads.
function Stack() {
  const layers = splitList(field('site-engine-stack', 'layers'), '|');
  return (
    <figure className={styles.stack}>
      <figcaption className={styles.stackLabel}>{field('site-engine-stack', 'label')}</figcaption>
      <ol className={styles.layers}>
        {layers.map((layer, i) => {
          const [name = '', what = ''] = layer.split('·').map((s) => s.trim());
          return (
            <li
              key={name}
              className={ui[STACK_TONES[i] ?? 'ink']}
              data-tone={STACK_TONES[i]}
              style={vars({ '--i': i })}
            >
              <b>{name}</b>
              <span>{what}</span>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}

function Loop() {
  const [ref, seen] = useInView<HTMLOListElement>();
  return (
    <ol ref={ref} className={styles.loop} data-seen={seen || undefined}>
      {rows('site-engine-loop').map(([verb = '', text = ''], i) => (
        <li
          key={verb}
          className={`${styles.step} ${ui[LOOP_TONES[i] ?? 'ink']}`}
          style={vars({ '--i': i })}
        >
          <span className={styles.stepIcon} aria-hidden="true">
            <PixelIcon name={LOOP_ICONS[i] ?? 'doc'} />
          </span>
          <span className={styles.stepNum} aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className={styles.stepVerb}>{verb}</h3>
          <p className={styles.stepText}>{text}</p>
        </li>
      ))}
    </ol>
  );
}

// /engine: what Press Start is, how a game is made, the five strengths, the AI's four verbs, and what
// is not there yet.
export function Engine() {
  const cta = field('site-engine-strengths', 'cta');
  return (
    <>
      <PageHero id="page-engine" tone="blue" art={<Stack />} />

      <section className={`${ui.section} ${ui.wrap}`} aria-labelledby="loop-title">
        <SectionHead
          id="loop-title"
          kicker={field('site-engine-loop', 'kicker')}
          title={field('site-engine-loop', 'headline')}
          tone="blue"
        />
        <Loop />
      </section>

      <section className={`${ui.section} ${ui.wrap}`} aria-labelledby="strengths-title">
        <SectionHead
          id="strengths-title"
          kicker={field('site-engine-strengths', 'kicker')}
          title={field('site-engine-strengths', 'headline')}
          tone="red"
        />
        <ul className={styles.strengths}>
          {STRENGTHS.map((s) => (
            <li key={s.id} className={ui[s.tone]} data-tone={s.tone}>
              <Link to={sitePagePath(s.id)} className={styles.strength}>
                <span className={styles.strengthIcon} aria-hidden="true">
                  <PixelIcon name={s.icon} />
                </span>
                <h3 className={styles.strengthTitle}>{field(`page-${s.id}`, 'kicker')}</h3>
                <span className={styles.strengthHead}>{field(`page-${s.id}`, 'headline')}</span>
                <span className={styles.strengthText}>{field(`page-${s.id}`, 'description')}</span>
                <span className={styles.strengthMore}>
                  {cta}
                  <span className={ui.arrow} aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${ui.section} ${ui.wrap} ${styles.verbs}`} aria-labelledby="verbs-title">
        <SectionHead
          id="verbs-title"
          kicker={field('site-engine-verbs', 'kicker')}
          title={field('site-engine-verbs', 'headline')}
          lede={paragraphs('site-engine-verbs')[0]}
          tone="green"
        />
        <div className={styles.console}>
          <ol className={styles.verbList}>
            {rows('site-engine-verbs').map(([verb = '', text = ''], i) => (
              <li key={verb}>
                <span className={styles.verbKey} aria-hidden="true">
                  {['↑', '→', '↓', '←'][i]}
                </span>
                <b className={styles.verb}>{verb}</b>
                <span className={styles.verbText}>{text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${ui.section} ${ui.wrap}`} aria-labelledby="caveats-title">
        <SectionHead
          id="caveats-title"
          kicker={field('site-engine-caveats', 'kicker')}
          title={field('site-engine-caveats', 'headline')}
          tone="amber"
        />
        <ul className={styles.caveats}>
          {items('site-engine-caveats').map((text) => (
            <li key={text}>
              <span className={styles.bang} aria-hidden="true">
                <PixelIcon name="bang" />
              </span>
              <span>
                <Inline text={text} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <StartBand />
    </>
  );
}
