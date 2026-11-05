import { Link } from 'react-router';
import { field } from '../../content';
import { DISCORD_URL } from '../../lib/config';
import { crumbsFor, href, list, moveOf, navEntry } from '../data';
import { JoinBand } from '../JoinBand';
import { PixelIcon } from '../PixelIcon';
import ui from '../ui.module.css';
import { EnginePage } from './EnginePage';
import { OraclesPage } from './OraclesPage';
import styles from './Page.module.css';
import { PageHead } from './PageHead';

// Every main-site page outside the home page arrives here with its id (routes.tsx). The designed
// pages (/engine, /engine/oracles) render themselves; every other page is a plain placeholder: its
// own head, a note that it is being written, and the pages that exist today.
export function Stub({ id = '' }: { id?: string }) {
  if (id === 'engine') return <EnginePage />;
  if (id === 'engine-oracles') return <OraclesPage />;
  return <Placeholder id={id} />;
}

function Placeholder({ id }: { id: string }) {
  const links = list('site-stub', 'links');
  return (
    <>
      <PageHead id={`page-${id}`} move={moveOf(id)} crumbs={crumbsFor(id)}>
        {id === 'community' ? (
          <p className={styles.actions}>
            <a className={`${ui.btn} ${ui.primary}`} href={DISCORD_URL} rel="noopener">
              <PixelIcon name="talk" size={16} />
              {field('site-footer', 'discord')}
            </a>
          </p>
        ) : null}
      </PageHead>
      <section className={`frame ${styles.stub}`} aria-labelledby="stub-today">
        <p className={styles.notice}>
          <PixelIcon name="road" size={18} />
          {field('site-stub', 'label')}
        </p>
        <h2 id="stub-today" className={styles.todayHead}>
          {field('site-stub', 'today')}
        </h2>
        <ul className={styles.links}>
          {links.map((l) => {
            const e = navEntry(l);
            return (
              <li key={l}>
                <Link className={styles.linkCard} to={href(l)}>
                  <span className={styles.linkLabel}>
                    {e.label}
                    <span aria-hidden="true">→</span>
                  </span>
                  <span className={styles.linkNote}>{e.note}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <JoinBand />
    </>
  );
}
