import { useId, useRef } from 'react';
import { field, section } from '../../content';
import styles from './Code.module.css';
import { useInView } from './useInView';

// A verbatim engine sample from CONTENT.md (`site-sample-*`): the code block exactly as copied, its
// commit, file and lines. Selectable text; only comments are dimmed (no parser that could misread it).
// `lit` lights 1-based lines (the step in view on /engine). Lines print in order the first time the
// sample scrolls into view; the prerendered HTML is the final state.
export function Code({
  sample,
  caption,
  lit = [],
  label,
}: {
  sample: string;
  caption: string;
  lit?: number[];
  label: string;
}) {
  const block = section(sample).blocks.find((b) => b.type === 'code');
  const ref = useRef<HTMLElement>(null);
  const captionId = useId();
  useInView(ref);
  if (!block || block.type !== 'code') return null;
  const lines = block.text.split('\n');
  const commit = field(sample, 'sample-commit');
  const source = field(sample, 'sample-source');
  return (
    <figure className={styles.figure} ref={ref} data-io data-lit={lit.length ? '' : undefined}>
      <div className={styles.chrome} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.file}>{source}</span>
        <span className={styles.lang}>{block.lang}</span>
      </div>
      <pre
        className={styles.pre}
        tabIndex={0}
        role="region"
        aria-labelledby={captionId}
        data-scroller
      >
        <code>
          {lines.map((line, i) => {
            const c = line.indexOf('//');
            return (
              <span
                key={i}
                className={styles.line}
                data-on={lit.includes(i + 1) || undefined}
                style={{ '--i': i } as React.CSSProperties}
              >
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
      <figcaption id={captionId} className={styles.caption}>
        <span className="provenance">{label}</span>
        <span>{caption}</span>
        <span className={styles.source}>
          {source} · {field(sample, 'sample-lines')} · {commit.slice(0, 7)}
        </span>
      </figcaption>
    </figure>
  );
}
