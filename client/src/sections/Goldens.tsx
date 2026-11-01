import type { CSSProperties } from 'react';
import { Body } from '../components/Body';
import { Reveal } from '../components/Reveal';
import { counts, field, section } from '../content';
import { isPixelArt, pictureFor, rowFor, sheetFiles } from '../lib/renders';
import { spotlightHandlers } from '../lib/useSpotlight';
import styles from './Goldens.module.css';

// The contact sheet: accepted goldens from the engine, each with its crate and test name. Raster
// goldens are responsive pictures; pixel-art goldens are scaled by an integer factor.
export function Goldens() {
  const s = section('goldens');
  return (
    <section id="goldens" className="section" aria-labelledby="goldens-title">
      <div className="column">
        <Reveal className="section-head" wipe>
          <h2 id="goldens-title">{field('goldens', 'headline')}</h2>
        </Reveal>
        <Reveal delay={80}>
          <Body blocks={s.blocks} skip={['field']} />
        </Reveal>
      </div>
      <Reveal as="ul" className={`breakout ${styles.sheet}`} delay={160} aria-label="Contact sheet">
        {sheetFiles.map((file, i) => {
          const row = rowFor(file);
          const pic = pictureFor(file);
          if (!row || !pic) return null;
          const pixel = isPixelArt(file);
          const crate = row.crate.replace('press_start_', '');
          return (
            <li
              key={file}
              className={`card ${styles.cell}`}
              style={{ '--i': i } as CSSProperties}
              {...spotlightHandlers()}
            >
              <figure className={styles.figure}>
                <div className={styles.crop} data-pixel={pixel || undefined}>
                  {pixel ? (
                    <img
                      className={styles.pixel}
                      src={pic.img.src}
                      width={row.width}
                      height={row.height}
                      alt={`${row.test}, an accepted golden of ${row.crate}`}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <picture>
                      {pic.sources['avif'] && (
                        <source
                          type="image/avif"
                          srcSet={pic.sources['avif']}
                          sizes="(max-width: 720px) 50vw, 400px"
                        />
                      )}
                      {pic.sources['webp'] && (
                        <source
                          type="image/webp"
                          srcSet={pic.sources['webp']}
                          sizes="(max-width: 720px) 50vw, 400px"
                        />
                      )}
                      <img
                        className={styles.raster}
                        src={pic.img.src}
                        srcSet={pic.sources['png']}
                        sizes="(max-width: 720px) 50vw, 400px"
                        width={pic.img.w}
                        height={pic.img.h}
                        alt={`${row.test}, an accepted golden of ${row.crate}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                  )}
                  <span className={`${styles.corner} ${styles.tl}`} aria-hidden="true" />
                  <span className={`${styles.corner} ${styles.tr}`} aria-hidden="true" />
                  <span className={`${styles.corner} ${styles.bl}`} aria-hidden="true" />
                  <span className={`${styles.corner} ${styles.br}`} aria-hidden="true" />
                  <span className={styles.badge} aria-hidden="true">
                    {field('goldens', 'sheet-label')}
                  </span>
                </div>
                <figcaption className={styles.caption}>
                  <span className={styles.crate}>{crate}</span>
                  <span className={styles.test}>{row.test}</span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </Reveal>
      <Reveal className={`column ${styles.sheetNote}`} delay={240}>
        <p className="mono">
          {field('goldens', 'sheet-caption')} · engine {counts.engineCommit.slice(0, 7)}
        </p>
      </Reveal>
    </section>
  );
}
