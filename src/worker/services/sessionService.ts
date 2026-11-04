import { SESSION_TTL_HOURS } from '../config/constants';
import { writeLog } from '../lib/logger';
import { SessionRepository } from '../repo/sessionRepository';

/**
 * 匿名セッションの解決。Cookie の ID が有効なら延長して返し、無ければ新規発行する（Rails 版 SessionManager）。
 * セッション ID はオーナーキーなのでログに出さない。
 */
export class SessionService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly clock: () => Date,
  ) {}

  async resolve(existingSessionId: string | null): Promise<string> {
    const now = this.clock();
    const nowIso = now.toISOString();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();

    if (existingSessionId) {
      const active = await this.sessions.findActive(existingSessionId, nowIso);
      if (active) {
        await this.sessions.extend(existingSessionId, expiresAt, nowIso);
        return existingSessionId;
      }
    }

    const sessionId = crypto.randomUUID();
    await this.sessions.create(sessionId, expiresAt, nowIso);
    writeLog('info', 'SessionService', 'session created');
    return sessionId;
  }
}
