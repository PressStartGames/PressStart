import type { ReactNode } from 'react';
import { Link } from 'react-router';

// The inline Markdown CONTENT.md uses: **bold**, *italic*, `code`, [text](href).
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;

export function Inline({ text }: { text: string }): ReactNode {
  const parts = text.split(TOKEN);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('[')) {
      const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
      if (m) {
        const href = m[2] ?? '';
        const label = m[1] ?? '';
        return href.startsWith('/') ? (
          <Link key={i} to={href}>
            {label}
          </Link>
        ) : (
          <a key={i} href={href}>
            {label}
          </a>
        );
      }
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
