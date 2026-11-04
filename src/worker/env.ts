/** Worker のバインディング（wrangler.jsonc の d1_databases / assets と一致させる）。 */
export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  APP_ENV?: string;
}

/** リクエスト単位で c.set / c.get する値。 */
export interface AppVariables {
  sessionId: string;
}

export interface AppBindings {
  Bindings: Env;
  Variables: AppVariables;
}
