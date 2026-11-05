import type { CSSProperties } from 'react';
import { field } from '../../content';
import { featuredFile, isPixelArt, pictureFor, rowFor, stripFiles } from '../../lib/renders';
import { pad, paragraphs } from '../text';
import ui from '../ui.module.css';
import styles from './Showcase.module.css';

const ID = 'site-showcase';
const FILES = [featuredFile, ...stripFiles];

// The film strip: Team Fights named as the first game, then the engine's accepted goldens as frames
// of film, each with its crate and test. On desktop with motion the strip is held on screen and runs
// sideways with the scroll (Motion.tsx, data-m="film"); elsewhere it is a swipeable row.
export function Showcase() {
  const golden = field(ID, 'golden');
  return (
    <div className="act-light">
      <section className={`act-dark ${styles.section}`} data-m="panel" aria-labelledby="show-title">
        <div className={styles.film} data-m="film">
          <div className={styles.sticky}>
            <div className={`frame ${styles.head}`}>
              <div>
                <p className={`${ui.plate} ${ui.onDark} rv`}>{field(ID, 'label')}</p>
                <h2 id="show-title" className={styles.title} data-m="words">
                  {field(ID, 'headline')}
                </h2>
              </div>
              <p className={`${styles.lede} rv`}>{paragraphs(ID)[0]}</p>
            </div>
            <div
              className={`${styles.viewport} scroll-x`}
              role="region"
              aria-label={field(ID, 'strip-label')}
              tabIndex={0}
            >
              <ol className={styles.track} data-track>
                <li className={`${styles.frameCard} ${styles.first}`}>
                  <p className={styles.firstKicker}>{field(ID, 'first-kicker')}</p>
                  <p className={styles.firstTitle}>{field(ID, 'first-title')}</p>
                  <p className={styles.firstBody}>{field(ID, 'first-body')}</p>
                </li>
                {FILES.map((file, i) => {
                  const row = rowFor(file);
                  const pic = pictureFor(file);
                  if (!row || !pic) return null;
                  const pixel = isPixelArt(file);
                  // Square goldens (turntables, sprites) sit whole on the matte, scaled crisp.
                  const square = row.width / row.height < 1.4;
                  return (
                    <li
                      key={file}
                      className={styles.frameCard}
                      style={{ '--i': i } as CSSProperties}
                    >
                      <div
                        className={styles.shot}
                        data-pixel={pixel || undefined}
                        data-square={square || undefined}
                      >
                        <picture>
                          {!pixel && pic.sources['avif'] ? (
                            <source
                              type="image/avif"
                              srcSet={pic.sources['avif']}
                              sizes="(max-width: 900px) 80vw, 34vw"
                            />
                          ) : null}
                          {!pixel && pic.sources['webp'] ? (
                            <source
                              type="image/webp"
                              srcSet={pic.sources['webp']}
                              sizes="(max-width: 900px) 80vw, 34vw"
                            />
                          ) : null}
                          <img
                            src={pic.img.src}
                            srcSet={pixel ? undefined : pic.sources['png']}
                            sizes={pixel ? undefined : '(max-width: 900px) 80vw, 34vw'}
                            width={pixel ? row.width : pic.img.w}
                            height={pixel ? row.height : pic.img.h}
                            alt={`${row.test}, ${golden}, ${row.crate}`}
                            loading="lazy"
                            decoding="async"
                          />
                        </picture>
                      </div>
                      <p className={styles.cap}>
                        <span className={styles.frameNo}>{pad(i + 1)}</span>
                        <span className={styles.test}>{row.test}</span>
                        <span className={styles.crate}>
                          {row.crate} · {golden}
                        </span>
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
