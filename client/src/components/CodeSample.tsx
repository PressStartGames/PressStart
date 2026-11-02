import styles from './CodeSample.module.css';

// Selectable code in the mono face. The text is copied verbatim from the engine (CONTENT.md records
// the commit); nothing is highlighted by a parser that could misread it, only comments are dimmed.
// `lit` lights the 1-based lines that belong to the procedure step in view; `progressRef` is a thin
// rule in the chrome that the scroll scrub fills.
export function CodeSample({
  lang,
  text,
  caption,
  lit = [],
  progressRef,
}: {
  lang: string;
  text: string;
  caption?: string;
  lit?: number[];
  progressRef?: React.Ref<HTMLSpanElement>;
}) {
  const lines = text.split('\n');
  const dimming = lit.length > 0;
  return (
    <figure className={styles.figure} data-lit={dimming || undefined}>
      <div className={styles.chrome} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.lang}>{lang}</span>
        <span className={styles.progress} ref={progressRef} />
      </div>
      <pre className={styles.pre} tabIndex={0}>
        <code>
          {lines.map((line, i) => {
            const c = line.indexOf('//');
            return (
              <span key={i} className={styles.line} data-on={lit.includes(i + 1) || undefined}>
                {c >= 0 ? (
                  <>
                    {line.slice(0, c)}
                    <span className={styles.comment}>{line.slice(c)}</span>
                  </>
                ) : (
                  line
                )}
                {'\n'}
              </span>
            );
          })}
        </code>
      </pre>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
