import type { MiddlewareHandler } from 'hono';
import { SESSION_COOKIE_NAME, SESSION_TTL_HOURS } from '../config/constants';
import type { AppBindings, Env } from '../env';
import { buildSessionCookie, readCookie } from '../lib/cookie';
import { SessionRepository } from '../repo/sessionRepository';
import { SessionService } from '../services/sessionService';

/**
 * Cookie に Secure を付けるか。APP_ENV が 'development' のときだけ外す（未設定・その他は本番扱い）。
 * 開発時のみ `wrangler dev --var APP_ENV:development` で指定する。
 */
export function isSecureCookieEnv(env: Env): boolean {
  return env.APP_ENV !== 'development';
}

/** 匿名セッションを解決して c.get('sessionId') に入れ、Cookie を発行・延長する。 */
export function sessionMiddleware(): MiddlewareHandler<AppBindings> {
  return async (c, next) => {
    const existing = readCookie(c.req.header('Cookie'), SESSION_COOKIE_NAME);
    const service = new SessionService(new SessionRepository(c.env.DB), () => new Date());
    const sessionId = await service.resolve(existing);
    c.set('sessionId', sessionId);
    c.header(
      'Set-Cookie',
      buildSessionCookie(SESSION_COOKIE_NAME, sessionId, SESSION_TTL_HOURS * 60 * 60, isSecureCookieEnv(c.env)),
    );
    await next();
  };
}
