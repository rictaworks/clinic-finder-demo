// D1 呼び出しの薄いヘルパー。プレースホルダは ?1, ?2 ... の番号付きで書く。

export type SqlParams = readonly unknown[];

export interface BatchStatement {
  sql: string;
  params: SqlParams;
}

export async function selectAll<T>(db: D1Database, sql: string, params: SqlParams = []): Promise<T[]> {
  const result = await db.prepare(sql).bind(...params).all<T>();
  return result.results;
}

export async function selectFirst<T>(db: D1Database, sql: string, params: SqlParams = []): Promise<T | null> {
  const row = await db.prepare(sql).bind(...params).first<T>();
  return row ?? null;
}

export async function runStatement(db: D1Database, sql: string, params: SqlParams = []): Promise<D1Result> {
  return db.prepare(sql).bind(...params).run();
}

/**
 * D1 の batch は 1 トランザクションとして実行される（途中で失敗すれば全体が戻る）。
 * 戻り値は文ごとの結果（meta.changes / meta.last_row_id を読む）。
 */
export async function runBatch(db: D1Database, statements: BatchStatement[]): Promise<D1Result[]> {
  return db.batch(statements.map((statement) => db.prepare(statement.sql).bind(...statement.params)));
}

/** 件数分の番号付きプレースホルダ（?1, ?2, ...）。 */
export function numberedPlaceholders(count: number): string {
  return Array.from({ length: count }, (_, index) => `?${index + 1}`).join(', ');
}
