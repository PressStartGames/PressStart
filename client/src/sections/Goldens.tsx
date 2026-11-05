import type { CSSProperties } from 'react';
import { Body } from '../components/Body';
import { Reveal } from '../components/Reveal';
import { Screen } from '../components/Screen';
import { counts, field, section, splitList } from '../content';
import {
  crateLabel,
  featuredFile,
  isPixelArt,
  pictureFor,
  rowFor,
  stripFiles,
} from '../lib/renders';
import styles from './Goldens.module.css';

// The review screen: "this run" over "the golden", a wipe between them, the verdict; the three
// steps as a mono checklist beside it; five more goldens as slides below.
export function Goldens({ index, label }: { index: string; label: string }) {
  const s = section('goldens');
  const featured = rowFor(featuredFile);
  const pic = pictureFor(featuredFile);
  const steps = splitList(field('goldens', 'review-steps'), '|');
  return (
    <section id="goldens" className="section" aria-labelledby="goldens-title">
      <div className="frame row">
        <div className="spine">
          <span className="spine-index">{index}</span>
          <span className="spine-label">{label}</span>
        </div>
        <div>
          <Reveal className={styles.copy}>
            <h2 id="goldens-title" className={styles.title}>
              {field('goldens', 'headline')}
            </h2>
            <div className={`measure ${styles.body}`}>
              <Body blocks={s.blocks} skip={['field']} />
            </div>
          </Reveal>
          {featured && pic && (
            <Reveal className={styles.review} delay={120}>
              <Screen
                label={`${crateLabel(featured.crate)} · ${featured.test}`}
                readout={`engine ${featured.engineCommit.slice(0, 7)}`}
                className={styles.reviewScreen}
              >
                <div className={styles.compare}>
                  <div className={styles.layer}>
                    <picture>
                      {pic.sources['avif'] && (
                        <source
                          type="image/avif"
                          srcSet={pic.sources['avif']}
                          sizes="(max-width: 900px) 100vw, 760px"
                        />
                      )}
                      {pic.sources['webp'] && (
                        <source
                          type="image/webp"
                          srcSet={pic.sources['webp']}
                          sizes="(max-width: 900px) 100vw, 760px"
                        />
                      )}
                      <img
                        src={pic.img.src}
                        srcSet={pic.sources['png']}
                        sizes="(max-width: 900px) 100vw, 760px"
                        width={pic.img.w}
                        height={pic.img.h}
                        alt={`${featured.test}, an accepted golden of the engine's ${crateLabel(featured.crate)} crate`}
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                    <span className={styles.tag}>{field('goldens', 'review-candidate')}</span>
                  </div>
                  <div className={`${styles.layer} ${styles.layerGolden}`} aria-hidden="true">
                    <picture>
                      {pic.sources['avif'] && (
                        <source
                          type="image/avif"
                          srcSet={pic.sources['avif']}
                          sizes="(max-width: 900px) 100vw, 760px"
                        />
                      )}
                      {pic.sources['webp'] && (
                        <source
                          type="image/webp"
                          srcSet={pic.sources['webp']}
                          sizes="(max-width: 900px) 100vw, 760px"
                        />
                      )}
                      <img
                        src={pic.img.src}
                        srcSet={pic.sources['png']}
                        sizes="(max-width: 900px) 100vw, 760px"
                        width={pic.img.w}
                        height={pic.img.h}
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
              </Screen>
              <ol className={styles.steps}>
                {steps.map((st, i) => (
                  <li key={st} style={{ '--i': i } as CSSProperties}>
                    <span className={styles.stepNo}>{String(i + 1).padStart(2, '0')}</span>
                    <span>{st}</span>
                    <span className={styles.stepOk}>ok</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}
          <Reveal className={styles.stripWrap} delay={200}>
            <p className="label">{field('goldens', 'strip-label')}</p>
            <ul className={styles.slides}>
              {stripFiles.map((file, i) => {
                const row = rowFor(file);
                const p = pictureFor(file);
                if (!row || !p) return null;
                const pixel = isPixelArt(file);
                return (
                  <li key={file} className={styles.slide} style={{ '--i': i } as CSSProperties}>
                    <div className={styles.thumb} data-pixel={pixel || undefined}>
                      <img
                        className={pixel ? styles.pixelImg : undefined}
                        src={p.img.src}
                        srcSet={pixel ? undefined : (p.sources['webp'] ?? p.sources['png'])}
                        sizes={pixel ? undefined : '240px'}
                        width={pixel ? row.width : p.img.w}
                        height={pixel ? row.height : p.img.h}
                        alt={`${row.test}, an accepted golden of the engine's ${crateLabel(row.crate)} crate`}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <span className={styles.slideCaption}>
                      <span className={styles.crate}>{crateLabel(row.crate)}</span>
                      <span className={styles.test}>{row.test}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="small">
              {field('goldens', 'sheet-caption')} · engine {counts.engineCommit.slice(0, 7)}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
