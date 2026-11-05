import { field } from '../../content';
import { rows } from '../lib/copy';
import styles from './PatchNotes.module.css';

const TAG_TONE: Record<string, string> = { Road: 'amber', Game: 'red', Engine: 'blue' };

// What landed lately (CONTENT.md site-news, from mission/roadmap.md: past dates only), with the work
// under way pinned on top. `limit` shortens it for the home page.
export function PatchNotes({ limit }: { limit?: number }) {
  const id = 'site-news';
  const notes = rows(id).slice(0, limit);
  return (
    <div className={styles.board}>
      <p className={styles.now}>
        <span className={styles.nowDot} aria-hidden="true" />
        <span className={styles.nowLabel}>{field(id, 'now-label')}</span>
        {field(id, 'now')}
      </p>
      <ol className={styles.list}>
        {notes.map(([date = '', tag = '', title = '', text = '']) => (
          <li key={title} className={styles.note}>
            <time className={styles.date} dateTime={date}>
              {date}
            </time>
            <span className={styles.tag} data-tone={TAG_TONE[tag] ?? 'ink'}>
              {tag}
            </span>
            <div>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.text}>{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
