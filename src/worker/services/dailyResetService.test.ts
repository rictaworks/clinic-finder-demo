import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Env } from '../env';
import { createTestEnv, type TestEnv } from '../test/helpers/testEnv';
import { runDailyReset } from './dailyResetService';

let testEnv: TestEnv;
let env: Env;

beforeEach(() => {
  testEnv = createTestEnv();
  env = testEnv.env;
});

afterEach(() => {
  testEnv.d1.close();
});

function count(sql: string): number {
  return (testEnv.d1.raw.prepare(sql).get() as { n: number }).n;
}

describe('runDailyReset（日次リセット）', () => {
  it('UTC 18 時に予約・セッションを消し、枠を open に戻し、参照期間の枠を補充する', async () => {
    // 検証用に、2026-11-06 の枠だけを持つ状態を作る
    testEnv.d1.raw.exec('DELETE FROM available_slots');
    testEnv.d1.raw.exec(
      "INSERT INTO available_slots (clinic_id, slot_date, slot_time, status, capacity) " +
        "SELECT c.id, '2026-11-06', t.slot_time, 'open', 1 FROM clinics AS c CROSS JOIN slot_time_templates AS t",
    );
    const slotId = (testEnv.d1.raw.prepare("SELECT id FROM available_slots WHERE clinic_id = 1 ORDER BY id LIMIT 1").get() as { id: number }).id;
    testEnv.d1.raw.exec(`UPDATE available_slots SET status = 'reserved' WHERE id = ${slotId}`);
    testEnv.d1.raw.exec(
      `INSERT INTO sessions (session_id, expires_at) VALUES ('s1', '2099-01-01T00:00:00.000Z');
       INSERT INTO reservations (session_id, clinic_id, slot_id, age_group, status, reserved_at)
       VALUES ('s1', 1, ${slotId}, 'adult', 'pending', '2026-11-05T10:00:00.000Z');`,
    );

    const outcome = await runDailyReset(env.DB, new Date('2026-11-06T18:00:00Z'));

    expect(outcome).toBe('reset');
    expect(count('SELECT COUNT(*) AS n FROM reservations')).toBe(0);
    expect(count('SELECT COUNT(*) AS n FROM sessions')).toBe(0);
    expect(count("SELECT COUNT(*) AS n FROM available_slots WHERE status <> 'open'")).toBe(0);
    // 2026-11-06 から +6 日（11-12）まで 7 日分。11-13 は含まない
    expect(count("SELECT COUNT(*) AS n FROM available_slots WHERE slot_date = '2026-11-12'")).toBe(40);
    expect(count("SELECT COUNT(*) AS n FROM available_slots WHERE slot_date = '2026-11-13'")).toBe(0);
    expect(count("SELECT COUNT(*) AS n FROM reset_logs WHERE reset_date = '2026-11-06'")).toBe(1);
  });

  it('開け直すのは参照期間（リセット日以降）の枠だけ。過去日の枠は触らない', async () => {
    testEnv.d1.raw.exec(
      "INSERT INTO available_slots (clinic_id, slot_date, slot_time, status, capacity) VALUES (1, '2026-10-30', '10:00', 'reserved', 1)",
    );

    await runDailyReset(env.DB, new Date('2026-11-06T18:00:00Z'));

    const past = testEnv.d1.raw.prepare("SELECT status FROM available_slots WHERE slot_date = '2026-10-30'").get() as { status: string };
    expect(past.status).toBe('reserved');
  });

  it('同じ UTC 日付では二重に実行しない', async () => {
    await runDailyReset(env.DB, new Date('2026-11-06T18:00:00Z'));
    const second = await runDailyReset(env.DB, new Date('2026-11-06T18:00:00Z'));
    expect(second).toBe('already_run');
    expect(count('SELECT COUNT(*) AS n FROM reset_logs')).toBe(1);
  });

  it('UTC 18 時以外の実行は何もしない', async () => {
    const outcome = await runDailyReset(env.DB, new Date('2026-11-06T17:00:00Z'));
    expect(outcome).toBe('not_reset_time');
    expect(count('SELECT COUNT(*) AS n FROM reset_logs')).toBe(0);
  });
});
