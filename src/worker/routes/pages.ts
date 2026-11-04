import type { Context } from 'hono';
import { Hono } from 'hono';
import { SHELL_PAGE_ID } from '../config/constants';
import type { AppBindings } from '../env';

/**
 * 詳細ページは静的書き出しで 1 枚（/clinic/_, /reservations/_）だけ作り、
 * 任意の ID はその shell を返す。ID はブラウザ側で URL から読む（Workers Assets は動的ルートを持たない）。
 * ".txt" などの拡張子つき（Next の RSC 取得）は shell にせず、アセットの 404 をそのまま返す。
 */
async function serveDetailShell(c: Context<AppBindings>, prefix: string, id: string): Promise<Response> {
  if (id.includes('.')) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  const shellUrl = new URL(`${prefix}${SHELL_PAGE_ID}`, c.req.url);
  return c.env.ASSETS.fetch(new Request(shellUrl, { method: 'GET' }));
}

export function pageRoutes(): Hono<AppBindings> {
  const pages = new Hono<AppBindings>();
  pages.get('/clinic/:id', (c) => serveDetailShell(c, '/clinic/', c.req.param('id')));
  pages.get('/reservations/:id', (c) => serveDetailShell(c, '/reservations/', c.req.param('id')));
  return pages;
}
