// A D1-shaped wrapper over Node's built-in SQLite, with the real migrations applied, so the admin
// tests run the Worker's actual SQL.
import { readdirSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

export function memoryD1(): D1Database {
  const db = new DatabaseSync(':memory:');
  const dir = fileURLToPath(new URL('../migrations/', import.meta.url).href);
  for (const f of readdirSync(dir).sort()) db.exec(readFileSync(dir + f, 'utf8'));
  const prepare = (sql: string) => {
    let args: unknown[] = [];
    const stmt = {
      bind(...a: unknown[]) {
        args = a;
        return stmt;
      },
      async first<T>() {
        return (db.prepare(sql).get(...(args as never[])) as T) ?? null;
      },
      async all<T>() {
        return {
          results: db.prepare(sql).all(...(args as never[])) as T[],
          success: true,
          meta: {},
        };
      },
      async run() {
        const r = db.prepare(sql).run(...(args as never[]));
        return { success: true, meta: { changes: Number(r.changes) } };
      },
    };
    return stmt;
  };
  return { prepare } as unknown as D1Database;
}
