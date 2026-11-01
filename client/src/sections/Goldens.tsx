import type { CSSProperties } from 'react';
import { Body } from '../components/Body';
import { Reveal } from '../components/Reveal';
import { counts, field, section, splitList } from '../content';
import { featuredFile, isPixelArt, pictureFor, rowFor, stripFiles } from '../lib/renders';
import { spotlightHandlers } from '../lib/useSpotlight';
import styles from './Goldens.module.css';

// Goldens are test evidence, not screenshots. One featured golden is shown the way the engine
// treats it: "this run" against "the golden", a wipe between them, the verdict, the three steps.
// Five more follow as a small filmstrip with their crate and test names.
export function Goldens() {
  const s = section('goldens');
  const featured = rowFor(featuredFile);
  const featuredPic = pictureFor(featuredFile);
  const steps = splitList(field('goldens', 'review-steps'), '|');
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
      {featured && featuredPic && (
        <Reveal className={`breakout ${styles.review}`} delay={160}>
          <figure className={styles.reviewFigure}>
            <div className={styles.compare} {...spotlightHandlers()}>
              <div className={styles.layer}>
                <picture>
                  {featuredPic.sources['avif'] && (
                    <source
                      type="image/avif"
                      srcSet={featuredPic.sources['avif']}
                      sizes="(max-width: 900px) 100vw, 1200px"
                    />
                  )}
                  {featuredPic.sources['webp'] && (
                    <source
                      type="image/webp"
                      srcSet={featuredPic.sources['webp']}
                      sizes="(max-width: 900px) 100vw, 1200px"
                    />
                  )}
                  <img
                    src={featuredPic.img.src}
                    srcSet={featuredPic.sources['png']}
                    sizes="(max-width: 900px) 100vw, 1200px"
                    width={featuredPic.img.w}
                    height={featuredPic.img.h}
                    alt={`${featured.test}, an accepted golden of ${featured.crate}`}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <span className={`${styles.tag} ${styles.tagLeft}`}>
                  {field('goldens', 'review-candidate')}
                </span>
              </div>
              <div className={`${styles.layer} ${styles.layerGolden}`} aria-hidden="true">
                <picture>
                  {featuredPic.sources['avif'] && (
                    <source
                      type="image/avif"
                      srcSet={featuredPic.sources['avif']}
                      sizes="(max-width: 900px) 100vw, 1200px"
                    />
                  )}
                  {featuredPic.sources['webp'] && (
                    <source
                      type="image/webp"
                      srcSet={featuredPic.sources['webp']}
                      sizes="(max-width: 900px) 100vw, 1200px"
                    />
                  )}
                  <img
                    src={featuredPic.img.src}
                    srcSet={featuredPic.sources['png']}
                    sizes="(max-width: 900px) 100vw, 1200px"
                    width={featuredPic.img.w}
                    height={featuredPic.img.h}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <span className={`${styles.tag} ${styles.tagRight}`}>
                  {field('goldens', 'review-golden')}
                </span>
              </div>
              <span className={styles.divider} aria-hidden="true" />
              <span className={styles.verdict}>{field('goldens', 'review-verdict')}</span>
            </div>
            <figcaption className={styles.reviewCaption}>
              <ol className={styles.steps}>
                {steps.map((st, i) => (
                  <li key={st} style={{ '--i': i } as CSSProperties}>
                    <span className={styles.stepMark} aria-hidden="true" />
                    {st}
                  </li>
                ))}
              </ol>
              <p className="mono">
                {featured.crate.replace('press_start_', '')} · {featured.test} · engine{' '}
                {featured.engineCommit.slice(0, 7)}
              </p>
            </figcaption>
          </figure>
        </Reveal>
      )}
      <Reveal className={`breakout ${styles.stripWrap}`} delay={220}>
        <p className={`mono ${styles.stripLabel}`}>{field('goldens', 'strip-label')}</p>
        <ul className={styles.strip} aria-label={field('goldens', 'strip-label')}>
          {stripFiles.map((file, i) => {
            const row = rowFor(file);
            const pic = pictureFor(file);
            if (!row || !pic) return null;
            const pixel = isPixelArt(file);
            return (
              <li key={file} className={styles.cell} style={{ '--i': i } as CSSProperties}>
                <div className={styles.thumb} data-pixel={pixel || undefined}>
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
                    <img
                      src={pic.img.src}
                      srcSet={pic.sources['webp'] ?? pic.sources['png']}
                      sizes="240px"
                      width={pic.img.w}
                      height={pic.img.h}
                      alt={`${row.test}, an accepted golden of ${row.crate}`}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
                <span className={styles.caption}>
                  <span className={styles.crate}>{row.crate.replace('press_start_', '')}</span>
                  <span className={styles.test}>{row.test}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className={`small ${styles.sheetNote}`}>
          {field('goldens', 'sheet-caption')} · engine {counts.engineCommit.slice(0, 7)}
        </p>
      </Reveal>
    </section>
  );
}
