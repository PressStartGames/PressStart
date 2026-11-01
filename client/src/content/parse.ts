// Parses CONTENT.md (the repository's single source of page copy) into typed sections.
// No Vite or DOM dependency: scripts/check-content.ts runs this under plain Node.

export type Block =
  | { type: 'p'; text: string }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; lang: string; text: string }
  | { type: 'field'; key: string; value: string };

export interface Section {
  id: string;
  fields: Record<string, string>;
  blocks: Block[];
}

export type Content = Record<string, Section>;

const FIELD = /^([a-z][a-z0-9-]*):(?: (.*))?$/;
const NOTE = /\s*\*\([^)]*\)\*/g;
const ITEM = /^\d+\.\s+(.*)$/;

function stripNotes(text: string): string {
  return text.replace(NOTE, '').replace(/\s+$/, '').replace(/^\s+/, '');
}

function parseBlock(lines: string[], blocks: Block[]) {
  const first = lines[0];
  if (first === undefined) return;
  if (first.startsWith('*(')) return; // a note to the builder, never copy
  if (FIELD.test(first)) {
    let key = '';
    let value: string[] = [];
    const flush = () => {
      if (key) blocks.push({ type: 'field', key, value: stripNotes(value.join(' ')) });
    };
    for (const line of lines) {
      const m = FIELD.exec(line);
      if (m) {
        flush();
        key = m[1] ?? '';
        value = [m[2] ?? ''];
      } else {
        value.push(line);
      }
    }
    flush();
    return;
  }
  if (ITEM.test(first)) {
    const items: string[] = [];
    for (const line of lines) {
      const m = ITEM.exec(line);
      if (m) items.push(m[1] ?? '');
      else items[items.length - 1] += ' ' + line;
    }
    blocks.push({ type: 'ol', items: items.map(stripNotes) });
    return;
  }
  blocks.push({ type: 'p', text: stripNotes(lines.join(' ')) });
}

export function parseContent(md: string): Content {
  const content: Content = {};
  let section: Section | null = null;
  let pending: string[] = [];
  let code: { lang: string; lines: string[] } | null = null;

  const flushPending = () => {
    if (section && pending.length) parseBlock(pending, section.blocks);
    pending = [];
  };

  for (const rawLine of md.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (code) {
      if (line.startsWith('```')) {
        section?.blocks.push({ type: 'code', lang: code.lang, text: code.lines.join('\n') });
        code = null;
      } else {
        code.lines.push(line);
      }
      continue;
    }
    if (line.startsWith('## ')) {
      flushPending();
      section = { id: line.slice(3).trim(), fields: {}, blocks: [] };
      content[section.id] = section;
      continue;
    }
    if (!section) continue; // the preamble
    if (line.startsWith('```')) {
      flushPending();
      code = { lang: line.slice(3).trim(), lines: [] };
      continue;
    }
    if (line.trim() === '') {
      flushPending();
      continue;
    }
    pending.push(line);
  }
  flushPending();

  for (const s of Object.values(content)) {
    for (const b of s.blocks) if (b.type === 'field') s.fields[b.key] = b.value;
  }
  return content;
}

// {{catalog.built}} -> counts.catalog.built. Unknown paths throw so CI (check-content) refuses them.
export function fillPlaceholders(content: Content, counts: unknown): Content {
  const resolve = (path: string): string => {
    let v: unknown = counts;
    for (const key of path.split('.')) {
      if (v && typeof v === 'object' && key in (v as Record<string, unknown>)) {
        v = (v as Record<string, unknown>)[key];
      } else {
        throw new Error(`unknown placeholder {{${path}}}`);
      }
    }
    if (typeof v !== 'number' && typeof v !== 'string') {
      throw new Error(`placeholder {{${path}}} is not a value`);
    }
    return String(v);
  };
  const fill = (t: string) => t.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, (_, p: string) => resolve(p));
  const out: Content = {};
  for (const [id, s] of Object.entries(content)) {
    const blocks: Block[] = s.blocks.map((b) => {
      switch (b.type) {
        case 'p':
          return { ...b, text: fill(b.text) };
        case 'ol':
          return { ...b, items: b.items.map(fill) };
        case 'field':
          return { ...b, value: fill(b.value) };
        case 'code':
          return b;
      }
    });
    const fields = Object.fromEntries(Object.entries(s.fields).map(([k, v]) => [k, fill(v)]));
    out[id] = { id, fields, blocks };
  }
  return out;
}

// "a · b · c" or "a | b" -> ["a", "b", "c"]
export function splitList(value: string, sep: '·' | '|' = '·'): string[] {
  return value
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}

// "**Lead.** rest" -> { lead: "Lead.", rest: "rest" }
export function splitLead(text: string): { lead: string; rest: string } {
  const m = /^\*\*([^*]+)\*\*\s*(.*)$/s.exec(text);
  if (!m) return { lead: '', rest: text };
  return { lead: m[1] ?? '', rest: m[2] ?? '' };
}
