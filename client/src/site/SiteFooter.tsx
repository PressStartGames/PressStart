import { Link } from 'react-router';
import { counts, field } from '../content';
import { DISCORD_URL } from '../lib/config';
import { sitePagePath } from '../routes';
import { href, list, navModel } from './data';
import styles from './Footer.module.css';
import { PixelIcon } from './PixelIcon';

const model = navModel();
const LEGAL = ['privacy', 'terms', 'cookies'] as const;

// The footer: the wordmark and the line, the Discord door, the full site map (the no-JS phone menu
// links here, #site-map), the legal links and the engine commit the counts were synced from.
export function SiteFooter() {
  const [engineCol = '', proveCol = '', resourcesCol = '', companyCol = ''] = list(
    'site-footer',
    'columns',
  );
  const engine = [
    model.overview,
    ...model.columns.flatMap((c) => (c.move === 'prove' ? [] : c.entries)),
  ].filter((e) => e.id !== 'licensing');
  const prove = model.columns.find((c) => c.move === 'prove')?.entries ?? [];
  const columns = [
    { title: engineCol, entries: engine },
    { title: proveCol, entries: prove },
    { title: resourcesCol, entries: model.resources },
    { title: companyCol, entries: model.company },
  ];
  const legal = list('site-footer', 'legal');

  return (
    <footer className={styles.footer} aria-label={field('site-footer', 'label')}>
      <div className={`frame ${styles.inner}`}>
        <div className={styles.brand}>
          <p className={styles.wordmark}>
            <span className={styles.mark} aria-hidden="true">
              <span />
            </span>
            {field('site-header', 'wordmark')}
          </p>
          <p className={styles.line}>{field('site-footer', 'line')}</p>
          <a className={styles.discord} href={DISCORD_URL} rel="noopener">
            <span className={styles.discordIcon} aria-hidden="true">
              <PixelIcon name="talk" size={20} />
            </span>
            <span>
              <span className={styles.discordLabel}>{field('site-footer', 'discord')}</span>
              <span className={styles.discordNote}>{field('site-footer', 'discord-note')}</span>
            </span>
          </a>
        </div>
        <nav id="site-map" className={styles.map} aria-label={field('site-footer', 'map-label')}>
          {columns.map((c) => (
            <div key={c.title} className={styles.col}>
              <p className={styles.colHead}>{c.title}</p>
              <ul>
                {c.entries.map((e) => (
                  <li key={e.id}>
                    <Link to={sitePagePath(e.id)}>{e.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className={`frame ${styles.base}`}>
        <ul className={styles.legal}>
          {LEGAL.map((id, i) => (
            <li key={id}>
              <Link to={href(id)}>{legal[i] ?? id}</Link>
            </li>
          ))}
        </ul>
        <p className={styles.synced}>
          {field('site-footer', 'synced')} <code>{counts.engineCommit.slice(0, 7)}</code> ·{' '}
          {counts.syncedAt}
        </p>
      </div>
    </footer>
  );
}
