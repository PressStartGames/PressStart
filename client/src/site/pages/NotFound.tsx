import { Link } from 'react-router';
import { field, splitList } from '../../content';
import { paragraphs } from '../lib/copy';
import { PixelIcon } from '../ui/PixelIcon';
import ui from '../ui/ui.module.css';
import styles from './NotFound.module.css';

// "Tick not found": the 404 drawn as a checksum mismatch, and the way back.
export function NotFound() {
  const id = 'site-not-found';
  const diff = splitList(field(id, 'diff'), '|');
  return (
    <div className={`${ui.wrap} ${styles.page}`}>
      <div>
        <p className={`${ui.kicker} ${ui.red}`}>
          <span className={ui.kickerDot} aria-hidden="true" />
          {field(id, 'kicker')}
        </p>
        <h1 className={styles.title}>{field(id, 'headline')}</h1>
        <p className={styles.text}>{paragraphs(id)[0]}</p>
        <p className={styles.actions}>
          <Link className={`${ui.btn} ${ui.btnRed}`} to="/">
            {field(id, 'cta')}
          </Link>
        </p>
      </div>
      <div className={styles.screen}>
        <PixelIcon name="critter" className={styles.ghost} />
        <dl className={styles.diff}>
          {diff.map((line) => {
            const [k = '', v = ''] = line.split('·').map((s) => s.trim());
            return (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
