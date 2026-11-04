// テスト用の D1 互換アダプタ（Node 組み込みの node:sqlite の上に載せる）。
// 本番の D1 と同じく batch は 1 トランザクション。プレースホルダは番号付き（?1 ...）を使う。
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync, type StatementSync } from 'node:sqlite';

type Value = string | number | null;

function toValue(value: unknown): Value {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  return String(value);
}

class TestStatement {
  constructor(
    private readonly database: DatabaseSync,
    private readonly sql: string,
    private readonly values: Value[] = [],
  ) {}

  bind(...values: unknown[]): TestStatement {
    return new TestStatement(this.database, this.sql, values.map(toValue));
  }

  private statement(): StatementSync {
    return this.database.prepare(this.sql);
  }

  async all<T>(): Promise<{ results: T[]; success: true; meta: Record<string, unknown> }> {
    const rows = this.statement().all(...this.values) as unknown as T[];
    return { results: rows, success: true, meta: {} };
  }

  async first<T>(): Promise<T | null> {
    const row = this.statement().get(...this.values) as unknown as T | undefined;
    return row ?? null;
  }

  async run(): Promise<{ success: true; results: []; meta: { changes: number; last_row_id: number } }> {
    const info = this.statement().run(...this.values);
    return {
      success: true,
      results: [],
      meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) },
    };
  }
}

export interface TestD1 {
  db: D1Database;
  raw: DatabaseSync;
  close(): void;
}

/** 指定した SQL ファイル（マイグレーション）を流した、新しいインメモリ D1 を作る。 */
export function createTestD1(migrationSql: string): TestD1 {
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON');
  raw.exec(migrationSql);

  const db = {
    prepare(sql: string) {
      return new TestStatement(raw, sql);
    },
    async batch(statements: TestStatement[]) {
      raw.exec('BEGIN');
      try {
        const results = [];
        for (const statement of statements) {
          results.push(await statement.run());
        }
        raw.exec('COMMIT');
        return results;
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      }
    },
  };

  return {
    db: db as unknown as D1Database,
    raw,
    close: () => raw.close(),
  };
}

/** リポジトリの migrations/*.sql を名前順（番号順）に読んで連結する。本番の D1 マイグレーションと同じ順序。 */
export function readMigrations(): string {
  const directory = resolve(import.meta.dirname, '../../../../migrations');
  return readdirSync(directory)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => readFileSync(resolve(directory, name), 'utf8'))
    .join('\n');
}
