import { Hono } from 'hono';
import { MESSAGES } from './config/messages';
import type { AppBindings } from './env';
import { BadRequestError, DomainError, NotFoundError } from './lib/errors';
import { writeLog } from './lib/logger';
import { apiRoutes } from './routes/api';
import { pageRoutes } from './routes/pages';

/** HTTP アプリ本体。Worker の fetch から呼ぶ（テストからも直接呼べる）。 */
export function createApp(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();

  app.route('/api', apiRoutes());
  app.route('/', pageRoutes());
  app.get('/health', (c) => c.text('ok'));

  app.notFound((c) => c.json({ error: MESSAGES.notFound }, 404));

  app.onError((error, c) => {
    if (error instanceof BadRequestError) {
      return c.json({ error: MESSAGES.badRequest }, 400);
    }
    if (error instanceof DomainError) {
      return c.json({ error: error.message }, 422);
    }
    if (error instanceof NotFoundError) {
      return c.json({ error: MESSAGES.notFound, message: error.message }, 404);
    }
    writeLog('error', 'App', 'unhandled error', {
      name: error instanceof Error ? error.name : 'unknown',
      message: error instanceof Error ? error.message : String(error),
    });
    return c.json({ error: MESSAGES.internalError }, 500);
  });

  return app;
}
