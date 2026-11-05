import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { field } from '../../content';
import { Inline } from '../../content/inline';
import { AUDIENCES } from '../../content/schema';
import { list, pad, paragraphs } from '../text';
import ui from '../ui.module.css';
import styles from './Audiences.module.css';

const ID = 'site-audiences';

// Four ways in: one tablist styled as a channel selector, one panel per audience. Without JavaScript
// the tablist is hidden and all four panels read in order; with it, only the chosen panel shows and
// its headline replays as the channel changes. Arrow keys, Home and End move between channels.
export function Audiences() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const channel = field(ID, 'channel');

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = AUDIENCES.length;
    const next =
      e.key === 'ArrowRight'
        ? (selected + 1) % n
        : e.key === 'ArrowLeft'
          ? (selected - 1 + n) % n
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? n - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className={`act-light ${styles.section}`} aria-labelledby="audiences-title">
      <div className="frame">
        <div className={styles.head}>
          <p className={`${ui.plate} rv`}>{field(ID, 'label')}</p>
          <h2 id="audiences-title" className={styles.title} data-m="words">
            {field(ID, 'headline')}
          </h2>
        </div>

        <div
          className={`${styles.tabs} rv`}
          role="tablist"
          aria-label={field(ID, 'tabs-label')}
          style={{ '--sel': selected } as CSSProperties}
        >
          {AUDIENCES.map((id, i) => (
            <button
              key={id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={`aud-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={i === selected}
              aria-controls={`aud-panel-${id}`}
              tabIndex={i === selected ? 0 : -1}
              className={styles.tab}
              onClick={() => setSelected(i)}
              onKeyDown={onKey}
            >
              <span className={styles.ch} aria-hidden="true">
                {channel} {pad(i + 1)}
              </span>
              <span className={styles.tabName}>{field(`site-audience-${id}`, 'tab')}</span>
            </button>
          ))}
          <span className={styles.indicator} aria-hidden="true" />
        </div>

        {AUDIENCES.map((id, i) => {
          const sid = `site-audience-${id}`;
          const on = i === selected;
          return (
            <div
              key={id}
              id={`aud-panel-${id}`}
              role="tabpanel"
              aria-labelledby={`aud-tab-${id}`}
              className={styles.panel}
              data-inactive={on ? undefined : ''}
            >
              <div className={styles.panelInner} key={on ? `on-${selected}` : 'off'}>
                <div className={styles.copy}>
                  <p className={styles.noJsTab}>
                    {channel} {pad(i + 1)} · {field(sid, 'tab')}
                  </p>
                  <h3 className={styles.panelTitle}>{field(sid, 'headline')}</h3>
                  {paragraphs(sid).map((p) => (
                    <p key={p} className={styles.body}>
                      <Inline text={p} />
                    </p>
                  ))}
                </div>
                <ul className={styles.points}>
                  {list(sid, 'points').map((p, j) => (
                    <li key={p} style={{ '--j': j } as CSSProperties}>
                      <span className={styles.n}>{pad(j + 1)}</span>
                      <span>{p}</span>
                      <span className={styles.ok} aria-hidden="true">
                        ✓
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
