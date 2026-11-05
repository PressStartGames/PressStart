import { field, splitList } from '../../content';
import { vars } from '../lib/vars';
import { PixelIcon } from '../ui/PixelIcon';
import styles from './Features.module.css';

export type ArtName = 'verbs' | 'docs' | 'ticks' | 'pixels' | 'modes' | 'offline';

const DOC_TONES = ['var(--l3-red)', 'var(--l3-amber)', 'var(--l3-blue)', 'var(--l3-green)'];

// One feature card's small illustration. Drawn in HTML/CSS from CONTENT.md labels; each plays once
// when its card scrolls in (Features.module.css, [data-seen]) and is complete without JavaScript.
export function FeatureArt({ name }: { name: ArtName }) {
  const list = (key: string) => splitList(field('site-features', key), '|');
  switch (name) {
    case 'verbs':
      return (
        <div className={`${styles.art} ${styles.screenArt}`}>
          <ul className={styles.verbs}>
            {list('verbs').map((v, i) => {
              const [verb = '', what = ''] = v.split('·').map((s) => s.trim());
              return (
                <li key={verb} style={vars({ '--i': i })}>
                  <span className={styles.prompt}>▸</span>
                  <b>{verb}</b>
                  <span className={styles.what}>{what}</span>
                </li>
              );
            })}
          </ul>
        </div>
      );
    case 'docs':
      return (
        <div className={`${styles.art} ${styles.dotArt}`}>
          <ul className={styles.docs}>
            {list('docs').map((d, i) => (
              <li
                key={d}
                style={vars({
                  '--i': i - 1.5,
                  '--col': i % 2,
                  '--row': Math.floor(i / 2),
                  '--c': DOC_TONES[i] ?? 'var(--ink)',
                })}
              >
                <PixelIcon name="doc" className={styles.docIcon} />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'ticks': {
      const [a = '', b = '', bug = ''] = list('ticks');
      return (
        <div className={`${styles.art} ${styles.screenArt} ${styles.ticks}`}>
          {[a, b].map((run, i) => (
            <div key={run} className={styles.tickRow} style={vars({ '--i': i })}>
              <span className={styles.tickLabel}>{run}</span>
              <span className={styles.ruler}>
                <span className={styles.pin} />
              </span>
            </div>
          ))}
          <span className={styles.bug}>{bug}</span>
        </div>
      );
    }
    case 'pixels': {
      const [golden = '', run = '', verdict = ''] = list('pixels');
      return (
        <div className={`${styles.art} ${styles.dotArt} ${styles.pixels}`}>
          <figure>
            <PixelIcon name="critter" className={styles.critter} />
            <figcaption>{golden}</figcaption>
          </figure>
          <span className={styles.equals} aria-hidden="true">
            =
          </span>
          <figure className={styles.scanned}>
            <PixelIcon name="critter" className={styles.critter} />
            <span className={styles.scan} aria-hidden="true" />
            <figcaption>{run}</figcaption>
          </figure>
          <span className={styles.pass}>{verdict}</span>
        </div>
      );
    }
    case 'modes':
      return (
        <div className={`${styles.art} ${styles.window}`}>
          <span className={styles.windowBar} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <ul className={styles.modes}>
            {list('modes').map((m, i) => (
              <li key={m} style={vars({ '--i': i })}>
                {m}
              </li>
            ))}
          </ul>
          <span className={styles.bubbles} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
      );
    case 'offline':
      return (
        <div className={`${styles.art} ${styles.dotArt} ${styles.offline}`}>
          <PixelIcon name="cloud" className={styles.cloud} />
          <span className={styles.offlineLabel}>{field('site-features', 'offline')}</span>
        </div>
      );
  }
}
