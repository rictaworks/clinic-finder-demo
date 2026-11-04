// 1 行 1 JSON のログ。セッション ID・症状の本文など利用者の入力は出力しない。

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export function writeLog(level: LogLevel, scope: string, message: string, detail: Record<string, unknown> = {}): void {
  const line = JSON.stringify({ at: new Date().toISOString(), level, scope, message, ...detail });
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}
