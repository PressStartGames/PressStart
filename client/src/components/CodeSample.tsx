import styles from './CodeSample.module.css';

// Selectable code in the mono face. The text is copied verbatim from the engine (CONTENT.md records
// the commit); nothing is highlighted by a parser that could misread it, only comments are dimmed.
export function CodeSample({
  lang,
  text,
  caption,
}: {
  lang: string;
  text: string;
  caption?: string;
}) {
  const lines = text.split('\n');
  return (
    <figure className={styles.figure}>
      <div className={styles.chrome} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.lang}>{lang}</span>
      </div>
      <pre className={styles.pre} tabIndex={0}>
        <code>
          {lines.map((line, i) => {
            const c = line.indexOf('//');
            return (
              <span key={i} className={styles.line}>
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
