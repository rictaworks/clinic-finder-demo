import { createApp } from './app';
import type { Env } from './env';
import { writeLog } from './lib/logger';
import { runDailyReset } from './services/dailyResetService';

const app = createApp();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  /** 日次リセット（wrangler.jsonc の triggers.crons = UTC 18:00）。 */
  async scheduled(controller: ScheduledController, env: Env): Promise<void> {
    const outcome = await runDailyReset(env.DB, new Date(controller.scheduledTime));
    writeLog('info', 'Scheduled', 'daily reset checked', { outcome });
  },
} satisfies ExportedHandler<Env>;
