import { section } from '../../content';
import { Inline } from '../../content/inline';

// A section's body paragraphs from CONTENT.md (fields, lists and code are rendered by their owners).
export function Prose({ id, className }: { id: string; className?: string }) {
  return (
    <div className={className}>
      {section(id).blocks.map((b, i) =>
        b.type === 'p' ? (
          <p key={i}>
            <Inline text={b.text} />
          </p>
        ) : null,
      )}
    </div>
  );
}
