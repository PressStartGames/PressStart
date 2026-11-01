import type { CSSProperties } from 'react';
import { Body } from '../components/Body';
import { NumberTile } from '../components/NumberTile';
import { Reveal } from '../components/Reveal';
import { counts, field, section, splitList } from '../content';
import { Inline } from '../content/inline';
import { spotlightHandlers } from '../lib/useSpotlight';
import styles from './BuiltToday.module.css';

// "89 engine crates" -> { value: 89, label: "engine crates" }; "103 of 404 things built" keeps "of 404" in the label.
function tile(text: string): { value: number; label: string } {
  const m = /^(\d+)\s+(.*)$/.exec(text);
  return { value: Number(m?.[1] ?? 0), label: m?.[2] ?? text };
}

// "world = World building · scenes, terrain" -> { id, name, detail }
function areaLabels(): Record<string, { name: string; detail: string }> {
  const out: Record<string, { name: string; detail: string }> = {};
  for (const item of splitList(field('built', 'area-labels'), '|')) {
    const [id = '', rest = ''] = item.split('=').map((s) => s.trim());
    const [name = rest, detail = ''] = rest.split('·').map((s) => s.trim());
    out[id] = { name, detail };
  }
  return out;
}

export function BuiltToday() {
  const s = section('built');
  const tiles = splitList(field('built', 'tiles')).map(tile);
  const legend = splitList(field('built', 'bar-legend'), '|');
  const labels = areaLabels();
  const areas = [...counts.catalog.areas].sort((a, b) => b.built / b.total - a.built / a.total);
  const unit = field('built', 'area-unit');
  return (
    <section id="built" className="section" aria-labelledby="built-title">
      <div className="column">
        <Reveal className="section-head" wipe>
          <h2 id="built-title">{field('built', 'headline')}</h2>
        </Reveal>
        <Reveal delay={60}>
          <Body blocks={s.blocks} skip={['field']} />
        </Reveal>
      </div>
      <Reveal
        className={`breakout ${styles.areas}`}
        delay={120}
        as="ul"
        aria-label="Coverage by area"
      >
        {areas.map((a, i) => {
          const l = labels[a.id] ?? { name: a.title, detail: '' };
          const rest = a.total - a.built - a.partial - a.skip;
          const pct = Math.round((a.built / a.total) * 100);
          return (
            <li
              key={a.id}
              className={`card ${styles.area}`}
              style={{ '--i': i } as CSSProperties}
              {...spotlightHandlers()}
            >
              <div className={styles.areaHead}>
                <h3 className={styles.areaName}>{l.name}</h3>
                <span className={styles.areaPct}>
                  <b>{a.built}</b>
                  <span className={styles.areaOf}> / {a.total}</span>
                </span>
              </div>
              <p className={styles.areaDetail}>{l.detail}</p>
              <div
                className={styles.bar}
                role="img"
                aria-label={`${l.name}: ${a.built} of ${a.total} ${unit} (${pct}%), ${a.partial} partly, ${a.skip} skipped`}
              >
                <span
                  className={`${styles.seg} ${styles.segBuilt}`}
                  style={{ '--w': `${(a.built / a.total) * 100}%`, '--i': 0 } as CSSProperties}
                />
                <span
                  className={`${styles.seg} ${styles.segPartial}`}
                  style={{ '--w': `${(a.partial / a.total) * 100}%`, '--i': 1 } as CSSProperties}
                />
                <span
                  className={`${styles.seg} ${styles.segSkip}`}
                  style={{ '--w': `${(a.skip / a.total) * 100}%`, '--i': 2 } as CSSProperties}
                />
                <span
                  className={`${styles.seg} ${styles.segRest}`}
                  style={{ '--w': `${(rest / a.total) * 100}%`, '--i': 3 } as CSSProperties}
                />
              </div>
              <span className={styles.areaUnit}>
                {pct}% {unit}
              </span>
            </li>
          );
        })}
      </Reveal>
      <div className="column">
        <Reveal className={styles.legendWrap} delay={160}>
          <ul className={styles.legend} aria-hidden="true">
            {legend.map((name, i) => (
              <li key={name} className={styles.legendItem}>
                <span
                  className={`${styles.swatch} ${[styles.segBuilt, styles.segPartial, styles.segSkip, styles.segRest][i] ?? ''}`}
                />
                {name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
      <Reveal className={`breakout ${styles.tiles}`} delay={200}>
        {tiles.map((t, i) => (
          <NumberTile key={t.label} value={t.value} label={t.label} accent={i === 1} />
        ))}
      </Reveal>
      <div className="column">
        <Reveal delay={240} className={styles.text}>
          <p className={styles.proof}>
            <Inline text={field('built', 'proof')} />
          </p>
          <p className={`mono ${styles.synced}`}>
            synced {counts.syncedAt} · engine {counts.engineCommit.slice(0, 7)}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
