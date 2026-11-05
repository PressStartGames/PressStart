import { useRef, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { counts, field, section, splitLead, splitList } from '../../content';
import { Inline } from '../../content/inline';
import type { SitePageId } from '../../content/schema';
import { BASE, FLAGS } from '../../lib/config';
import { useActiveStep } from '../../lib/useActiveStep';
import { sitePagePath } from '../../routes';
import { stage } from '../tour/stages';
import { Code } from '../ui/Code';
import { PixelIcon } from '../ui/PixelIcon';
import { Prose } from '../ui/Prose';
import { useInView } from '../ui/useInView';
import styles from './Engine.module.css';
import page from './Page.module.css';
import { PageHead } from './PageHead';

// Each strength's page and the tour stage whose colour and icon it wears.
const STRENGTH_STAGE: Record<string, string> = {
  'engine-determinism': 'determinism',
  'engine-parallel': 'parallel',
  'engine-oracles': 'oracles',
  'engine-ai': 'ai',
  'engine-ownership': 'ownership',
};

function range(spec: string): number[] {
  const [a = 0, b = a] = spec.split('-').map((n) => Number(n.trim()));
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

// /engine: what the engine is. The procedure (four steps, the verbatim test lit step by step as the
// reader scrolls), the five strengths as cartridges to their pages, the families in the box, and the
// synced numbers.
export function Engine() {
  const steps = section('site-engine-steps').blocks.find((b) => b.type === 'ol');
  const items = steps && steps.type === 'ol' ? steps.items : [];
  const list = useRef<HTMLOListElement>(null);
  const active = useActiveStep(list, items.length);
  const lit = range(splitList(field('site-engine-steps', 'lit'), '|')[active] ?? '');
  const cards = field('site-engine-strengths', 'cards')
    .split('|')
    .map((c) => c.split('=').map((x) => x.trim()));
  const families = splitList(field('site-engine-box', 'families'), '|').map((f) =>
    f.split('=').map((x) => x.trim()),
  );
  const tiles = splitList(field('site-engine-numbers', 'tiles'), '|').map((t) =>
    t.split('=').map((x) => x.trim()),
  );
  const box = useRef<HTMLDivElement>(null);
  useInView(box);
  const [join = '', tour = ''] = splitList(field('site-home', 'cta'), '|');
  return (
    <>
      <PageHead id="page-engine" icon="doc">
        <div className={page.actions}>
          {FLAGS.joinBeta && (
            <a className="key" href={`${BASE}beta/`}>
              <span className="key-led" aria-hidden="true" />
              {join}
            </a>
          )}
          <Link className="key key-ghost" to="/#tour">
            {tour}
          </Link>
        </div>
      </PageHead>

      <section className={`frame ${page.section}`} aria-labelledby="steps-title">
        <div className={page.sectionHead}>
          <p className={page.kicker}>{field('site-engine-steps', 'kicker')}</p>
          <h2 id="steps-title" className={page.h2}>
            {field('site-engine-steps', 'headline')}
          </h2>
        </div>
        <div className={styles.procedure}>
          <ol ref={list} className={styles.steps}>
            {items.map((item, i) => {
              const { lead, rest: text } = splitLead(item);
              return (
                <li key={lead} data-on={i === active ? '' : undefined}>
                  <span className={styles.stepNo}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.stepLead}>{lead}</span>
                  <span className={styles.stepText}>
                    <Inline text={text} />
                  </span>
                </li>
              );
            })}
          </ol>
          <div className={styles.codeWrap}>
            <Code
              sample="site-sample-test"
              caption={field('site-engine-steps', 'sample-caption')}
              label={field('site-tour', 'verbatim')}
              lit={lit}
            />
          </div>
        </div>
      </section>

      <section className={`frame ${page.section}`} aria-labelledby="strengths-title">
        <div className={page.sectionHead}>
          <p className={page.kicker}>{field('site-engine-strengths', 'kicker')}</p>
          <h2 id="strengths-title" className={page.h2}>
            {field('site-engine-strengths', 'headline')}
          </h2>
        </div>
        <ul className={page.carts}>
          {cards.map(([id = '', title = '', text = '']) => {
            const s = stage(STRENGTH_STAGE[id] ?? 'documents');
            return (
              <li key={id} style={{ '--accent': s.color } as CSSProperties}>
                <Link className={page.cart} to={sitePagePath(id as SitePageId)}>
                  <span className={page.cartIcon}>
                    <PixelIcon name={s.icon} scale={3} />
                  </span>
                  <span className={page.cartTitle}>{title}</span>
                  <span className={page.cartText}>{text}</span>
                  <span className={page.cartGo} aria-hidden="true">
                    {field('site-tour', 'more')} →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`frame ${page.section}`} aria-labelledby="box-title">
        <div className={page.sectionHead}>
          <p className={page.kicker}>{field('site-engine-box', 'kicker')}</p>
          <h2 id="box-title" className={page.h2}>
            {field('site-engine-box', 'headline')}
          </h2>
          <Prose id="site-engine-box" className={page.prose} />
        </div>
        <div className={styles.box} ref={box} data-io>
          <ul className={styles.families}>
            {families.map(([name = '', what = ''], i) => (
              <li key={name} className="io-rise" style={{ '--i': i } as CSSProperties}>
                <span className={styles.familyName}>{name}</span>
                <span className={styles.familyWhat}>{what}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`frame ${page.section}`} aria-labelledby="numbers-title">
        <h2 id="numbers-title" className={page.kicker}>
          {field('site-engine-numbers', 'label')}
        </h2>
        <ul className={styles.tiles}>
          {tiles.map(([n = '', label = '']) => (
            <li key={label}>
              <span className={styles.tileNo}>{n}</span>
              <span className={styles.tileLabel}>{label}</span>
            </li>
          ))}
        </ul>
        <p className={styles.synced}>
          {field('site-engine-numbers', 'synced')} {counts.engineCommit.slice(0, 7)}
        </p>
      </section>
    </>
  );
}
