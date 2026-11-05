import { Link } from 'react-router';
import { field, splitLead, splitList } from '../../content';
import { Inline } from '../../content/inline';
import { sitePagePath } from '../../routes';
import { StartBand } from '../home/StartBand';
import { CoreBoard } from '../parallel/CoreBoard';
import { items, paragraphs } from '../lib/copy';
import { STRENGTHS } from '../lib/strengths';
import { PageHero } from '../ui/PageHero';
import { PixelIcon } from '../ui/PixelIcon';
import { SectionHead } from '../ui/SectionHead';
import ui from '../ui/ui.module.css';
import styles from './Parallel.module.css';

// The digits where two printed numbers stop agreeing, marked.
function Digits({ value, other }: { value: string; other: string }) {
  let i = 0;
  while (i < value.length && value[i] === other[i]) i++;
  return (
    <output className={styles.result}>
      {value.slice(0, i)}
      {i < value.length ? <span className={styles.drift}>{value.slice(i)}</span> : null}
    </output>
  );
}

// The same numbers added in two orders, computed where the page is rendered (plain IEEE doubles, the
// same on the server and in every browser).
function FloatSum() {
  const id = 'site-parallel-floats';
  const nums = splitList(field(id, 'numbers'), '|');
  const back = [...nums].reverse();
  const forward = String(nums.reduce((s, n) => s + Number(n), 0));
  const backward = String(back.reduce((s, n) => s + Number(n), 0));
  const same = forward === backward;
  return (
    <div className={styles.sums}>
      <div className={styles.sum}>
        <span className={styles.sumLabel}>{field(id, 'left')}</span>
        <code className={styles.expr}>{nums.join(' + ')} =</code>
        <Digits value={forward} other={backward} />
      </div>
      <div className={styles.verdict} data-same={same || undefined}>
        <span className={styles.neq} aria-hidden="true">
          {same ? '=' : '≠'}
        </span>
        <span className={styles.verdictText}>{field(id, same ? 'equal' : 'differ')}</span>
      </div>
      <div className={styles.sum}>
        <span className={styles.sumLabel}>{field(id, 'right')}</span>
        <code className={styles.expr}>{back.join(' + ')} =</code>
        <Digits value={backward} other={forward} />
      </div>
      <p className={styles.live}>{field(id, 'live')}</p>
    </div>
  );
}

// /engine/parallel: the strength page for "All cores" (amber).
export function Parallel() {
  const others = STRENGTHS.filter((s) => s.id !== 'engine-parallel');
  return (
    <>
      <PageHero id="page-engine-parallel" tone="amber" art={<CoreBoard />} />

      <section
        className={`${ui.section} ${ui.wrap} ${styles.floats}`}
        aria-labelledby="floats-title"
      >
        <SectionHead
          id="floats-title"
          kicker={field('site-parallel-floats', 'kicker')}
          title={field('site-parallel-floats', 'headline')}
          lede={paragraphs('site-parallel-floats')[0]}
          tone="red"
        />
        <FloatSum />
      </section>

      <section className={`${ui.section} ${ui.wrap}`} aria-labelledby="rules-title">
        <SectionHead
          id="rules-title"
          kicker={field('site-parallel-rules', 'kicker')}
          title={field('site-parallel-rules', 'headline')}
          tone="amber"
        />
        <ol className={styles.rules}>
          {items('site-parallel-rules').map((text, i) => {
            const { lead, rest } = splitLead(text);
            return (
              <li key={lead} className={styles.rule}>
                <span className={styles.ruleNum} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className={styles.ruleTitle}>{lead}</h3>
                <p className={styles.ruleText}>
                  <Inline text={rest} />
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={`${ui.section} ${ui.wrap}`} aria-labelledby="case-title">
        <div className={styles.case}>
          <span className={styles.caseIcon} aria-hidden="true">
            <PixelIcon name="check" />
          </span>
          <div>
            <p className={styles.caseKicker}>{field('site-parallel-case', 'kicker')}</p>
            <h2 id="case-title" className={styles.caseTitle}>
              {field('site-parallel-case', 'headline')}
            </h2>
            <p className={styles.caseText}>{paragraphs('site-parallel-case')[0]}</p>
          </div>
        </div>
      </section>

      <section className={`${ui.section} ${ui.wrap}`} aria-labelledby="claims-title">
        <SectionHead
          id="claims-title"
          kicker={field('site-parallel-claims', 'kicker')}
          title={field('site-parallel-claims', 'headline')}
          tone="amber"
        />
        <ul className={styles.claims}>
          {items('site-parallel-claims').map((text) => (
            <li key={text}>
              <Inline text={text} />
            </li>
          ))}
        </ul>
      </section>

      <nav className={`${ui.section} ${ui.wrap}`} aria-labelledby="more-strengths">
        <h2 id="more-strengths" className={styles.moreTitle}>
          {field('site-strength-nav', 'label')}
        </h2>
        <ul className={styles.more}>
          {others.map((s) => (
            <li key={s.id} className={ui[s.tone]}>
              <Link to={sitePagePath(s.id)} className={styles.pill}>
                <span className={styles.pillIcon} aria-hidden="true">
                  <PixelIcon name={s.icon} />
                </span>
                {field(`page-${s.id}`, 'kicker')}
                <span className={ui.arrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <StartBand />
    </>
  );
}
