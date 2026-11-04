import { selectFirst, runStatement } from '../lib/d1';

export interface SessionRow {
  session_id: string;
  expires_at: string;
}

/** sessions テーブル。session_id がオーナーキーになる。 */
export class SessionRepository {
  constructor(private readonly db: D1Database) {}

  findActive(sessionId: string, nowIso: string): Promise<SessionRow | null> {
    return selectFirst<SessionRow>(
      this.db,
      'SELECT session_id, expires_at FROM sessions WHERE session_id = ?1 AND expires_at > ?2',
      [sessionId, nowIso],
    );
  }

  async create(sessionId: string, expiresAt: string, nowIso: string): Promise<void> {
    await runStatement(
      this.db,
      'INSERT INTO sessions (session_id, expires_at, created_at, updated_at) VALUES (?1, ?2, ?3, ?3)',
      [sessionId, expiresAt, nowIso],
    );
  }

  async extend(sessionId: string, expiresAt: string, nowIso: string): Promise<void> {
    await runStatement(
      this.db,
      'UPDATE sessions SET expires_at = ?2, updated_at = ?3 WHERE session_id = ?1',
      [sessionId, expiresAt, nowIso],
    );
  }
}
