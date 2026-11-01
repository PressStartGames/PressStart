import type { Block } from '../content/parse';
import { Inline } from '../content/inline';
import { CodeSample } from './CodeSample';

// Renders a section's blocks in order. Fields are skipped unless named in `fieldsAs`, which maps a
// field key to how it renders (h3 for subheads, small for small print).
interface Props {
  blocks: Block[];
  fieldsAs?: Record<string, 'h3' | 'small'>;
  skip?: Array<Block['type']>;
  codeCaption?: string;
}

export function Body({ blocks, fieldsAs = {}, skip = [], codeCaption }: Props) {
  return blocks.map((b, i) => {
    if (skip.includes(b.type)) return null;
    switch (b.type) {
      case 'p':
        return (
          <p key={i}>
            <Inline text={b.text} />
          </p>
        );
      case 'ol':
        return (
          <ol key={i}>
            {b.items.map((item, j) => (
              <li key={j}>
                <Inline text={item} />
              </li>
            ))}
          </ol>
        );
      case 'code':
        return <CodeSample key={i} lang={b.lang} text={b.text} caption={codeCaption} />;
      case 'field': {
        const as = fieldsAs[b.key];
        if (as === 'h3') return <h3 key={i}>{b.value}</h3>;
        if (as === 'small')
          return (
            <p key={i} className="small">
              <Inline text={b.value} />
            </p>
          );
        return null;
      }
    }
  });
}
