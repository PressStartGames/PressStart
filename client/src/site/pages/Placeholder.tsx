import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import { Inline } from '../../content/inline';
import type { SitePageId } from '../../content/schema';
import { BASE, FLAGS } from '../../lib/config';
import { sitePagePath } from '../../routes';
import { TitleBand } from '../components/TitleBand';
import { Board } from '../home/visuals/Board';
import { Cores } from '../home/visuals/Cores';
import { Layers } from '../home/visuals/Layers';
import { list, paragraphs } from '../text';
import ui from '../ui.module.css';
import styles from './Pages.module.css';

const STRENGTHS: readonly SitePageId[] = [
  'engine-determinism',
  'engine-parallel',
  'engine-oracles',
  'engine-ai',
  'engine-ownership',
];
const VISUALS: Partial<Record<SitePageId, ReactNode>> = {
  'engine-parallel': <Cores />,
  'engine-oracles': <Board />,
  'engine-ownership': <Layers />,
};

// A page not designed yet: its CONTENT.md section `page-<id>` in the dark title band (with the home
// page's illustration of that strength, where there is one), then the honest way on.
export function Placeholder({ id }: { id: SitePageId }) {
  const sid = `page-${id}`;
  const [lead = '', ...rest] = paragraphs(sid);
  const [meanwhile = '', toEngine = '', toBeta = ''] = list('site-placeholder', 'meanwhile');
  const at = STRENGTHS.indexOf(id);
  const next = at < 0 ? undefined : STRENGTHS[(at + 1) % STRENGTHS.length];
  return (
    <>
      <TitleBand id={sid} lede={lead}>
        {VISUALS[id]}
      </TitleBand>
      <section className={`act-light ${styles.way}`} aria-labelledby="way-title">
        <div className={`frame ${styles.wayGrid}`}>
          <div>
            <p className={ui.plate}>
              <span className={styles.building} aria-hidden="true" />
              {field('site-placeholder', 'label')}
            </p>
            {rest.map((p) => (
              <p key={p} className={styles.wayBody}>
                <Inline text={p} />
              </p>
            ))}
          </div>
          <div className={styles.wayLinks}>
            <h2 id="way-title" className={styles.wayTitle}>
              {meanwhile}
            </h2>
            {id !== 'engine' ? (
              <Link className={ui.arrow} to={sitePagePath('engine')}>
                {toEngine}
              </Link>
            ) : null}
            {next ? (
              <Link className={ui.arrow} to={sitePagePath(next)}>
                {field('site-placeholder', 'next')}: {field(`page-${next}`, 'kicker')}
              </Link>
            ) : null}
            {FLAGS.joinBeta ? (
              <a className={`${ui.btn} ${ui.btnInk}`} href={`${BASE}beta/`}>
                {toBeta}
                <span aria-hidden="true">→</span>
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
