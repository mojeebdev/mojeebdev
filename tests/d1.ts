import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { D1Database, D1PreparedStatement, D1Result } from "@/lib/server/types";

/**
 * A minimal D1 stand-in over Node's built-in SQLite, with the migrations applied. It mirrors the D1 API surface the
 * app uses (prepare/bind/first/all/run/batch) so the real SQL is exercised in tests.
 */
export function createTestD1(): D1Database & { raw: DatabaseSync } {
  const db = new DatabaseSync(":memory:");
  const dir = path.join(import.meta.dirname, "..", "migrations");
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".sql")).sort()) db.exec(readFileSync(path.join(dir, f), "utf8"));

  const statement = (sql: string, params: unknown[] = []): D1PreparedStatement & { exec(): D1Result } => {
    const values = () => params.map((v) => (v === undefined ? null : v)) as (string | number | null)[];
    const exec = (): D1Result => {
      const stmt = db.prepare(sql);
      if (/^\s*(select|with)/i.test(sql)) return { results: stmt.all(...values()) as Record<string, unknown>[], success: true, meta: {} };
      const r = stmt.run(...values());
      return { results: [], success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
    };
    return {
      bind: (...v: unknown[]) => statement(sql, v),
      first: async <T,>() => (exec().results[0] as T) ?? null,
      all: async <T,>() => exec() as D1Result<T>,
      run: async <T,>() => exec() as D1Result<T>,
      exec,
    };
  };

  return {
    raw: db,
    prepare: (sql: string) => statement(sql),
    batch: async <T,>(stmts: D1PreparedStatement[]) => {
      db.exec("BEGIN");
      try {
        const out = stmts.map((s) => (s as ReturnType<typeof statement>).exec());
        db.exec("COMMIT");
        return out as D1Result<T>[];
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
  };
}
