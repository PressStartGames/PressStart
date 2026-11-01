import type { CSSProperties } from 'react';
import { Body } from '../components/Body';
import { Reveal } from '../components/Reveal';
import { counts, field, section, splitList } from '../content';
import { Inline } from '../content/inline';
import styles from './BuiltToday.module.css';

const SEGMENTS = 16;

function areaLabels(): Record<string, { name: string; detail: string }> {
  const out: Record<string, { name: string; detail: string }> = {};
  for (const item of splitList(field('built', 'area-labels'), '|')) {
    const [id = '', rest = ''] = item.split('=').map((s) => s.trim());
    const [name = rest, detail = ''] = rest.split('·').map((s) => s.trim());
    out[id] = { name, detail };
  }
  return out;
}

function tile(text: string): { value: string; label: string } {
  const m = /^(\d+(?: of \d+)?)\s+(.*)$/.exec(text);
  return { value: m?.[1] ?? '', label: m?.[2] ?? text };
}

// LEVEL SELECT: the catalog's seven areas as stage tiles with segmented pixel meters; the "how to
// play" insert explains what the checklist is; three readouts below.
export function BuiltToday({ index, label }: { index: string; label: string }) {
  const s = section('built');
  const labels = areaLabels();
  const areas = [...counts.catalog.areas].sort((a, b) => b.built / b.total - a.built / a.total);
  const legend = splitList(field('built', 'bar-legend'), '|');
  const tiles = splitList(field('built', 'tiles')).map(tile);
  const unit = field('built', 'area-unit');
  return (
    <section id="built" className="section" aria-labelledby="built-title">
      <div className="frame row">
        <div className="spine">
          <span className="spine-index">{index}</span>
          <span className="spine-label">{label}</span>
        </div>
        <div>
          <Reveal>
            <h2 id="built-title" className={styles.title}>
              {field('built', 'headline')}
            </h2>
          </Reveal>
          <div className={styles.grid}>
            <Reveal as="ul" className={styles.stages} delay={80} aria-label="Coverage by area">
              {areas.map((a, i) => {
                const l = labels[a.id] ?? { name: a.title, detail: '' };
                const built = Math.round((a.built / a.total) * SEGMENTS);
                const partial = Math.round(((a.built + a.partial) / a.total) * SEGMENTS) - built;
                const pct = Math.round((a.built / a.total) * 100);
                return (
                  <li key={a.id} className={styles.stage} style={{ '--i': i } as CSSProperties}>
                    <span className={styles.stageNo}>
                      {field('built', 'stage-label')} {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className={styles.stageName}>{l.name}</h3>
                    <p className={styles.stageDetail}>{l.detail}</p>
                    <div
                      className={styles.meter}
                      role="img"
                      aria-label={`${l.name}: ${a.built} of ${a.total} ${unit} (${pct}%), ${a.partial} partly, ${a.skip} skipped`}
                    >
                      {Array.from({ length: SEGMENTS }, (_, k) => (
                        <span
                          key={k}
                          className={styles.seg}
                          data-state={
                            k < built ? 'built' : k < built + partial ? 'partial' : 'rest'
                          }
                          style={{ '--k': k } as CSSProperties}
                        />
                      ))}
                    </div>
                    <span className={styles.stageReadout}>
                      <b>{a.built}</b> / {a.total} · {pct}% {unit}
                    </span>
                  </li>
                );
              })}
            </Reveal>
            <Reveal className={styles.insert} delay={160}>
              <p className={styles.insertTitle}>{field('built', 'insert-title')}</p>
              <div className={styles.insertBody}>
                <Body blocks={s.blocks} skip={['field']} />
              </div>
              <ul className={styles.legend} aria-hidden="true">
                {legend.slice(0, 3).map((name, i) => (
                  <li key={name}>
                    <span className={styles.seg} data-state={['built', 'partial', 'rest'][i]} />
                    {name}
                  </li>
                ))}
              </ul>
              <dl className={styles.readouts}>
                {tiles.map((t) => (
                  <div key={t.label} className={styles.readout}>
                    <dt className={styles.readoutLabel}>{t.label}</dt>
                    <dd className={styles.readoutValue}>{t.value}</dd>
                  </div>
                ))}
              </dl>
              <p className={styles.proof}>
                <Inline text={field('built', 'proof')} />
              </p>
              <p className="mono">
                synced {counts.syncedAt} · engine {counts.engineCommit.slice(0, 7)}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
