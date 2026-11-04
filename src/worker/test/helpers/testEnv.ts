import type { Env } from '../../env';
import { createTestD1, readMigrations, type TestD1 } from './d1Adapter';

export interface TestEnv {
  env: Env;
  d1: TestD1;
}

/** マイグレーション適用済みの DB と、ASSETS のスタブ（静的配信は本番のみなので固定応答）を持つ環境。 */
export function createTestEnv(): TestEnv {
  const d1 = createTestD1(readMigrations());
  const assets = {
    fetch: async (input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : String(input);
      return new Response(`asset:${new URL(url).pathname}`, { status: 200 });
    },
  } as unknown as Fetcher;
  return {
    env: { DB: d1.db, ASSETS: assets, APP_ENV: 'development' },
    d1,
  };
}
