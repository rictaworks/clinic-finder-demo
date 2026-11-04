import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app';
import type { Env } from './env';
import { createTestEnv, type TestEnv } from './test/helpers/testEnv';

// 統合テスト: マイグレーション適用済みの D1 に対して HTTP の入出力を確かめる（Rails 版 request spec の対応）。
// 検証対象のパス・ステータス・JSON 形は、移行前の Rails 実装と frontend/lib/api.ts に合わせている。

const app = createApp();
let testEnv: TestEnv;
let env: Env;

beforeEach(() => {
  testEnv = createTestEnv();
  env = testEnv.env;
});

afterEach(() => {
  testEnv.d1.close();
});

async function jsonRequest(method: string, path: string, body: unknown, cookie?: string): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cookie) {
    headers.Cookie = cookie;
  }
  return app.request(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }, env);
}

async function createSessionCookie(): Promise<string> {
  const res = await app.request('/api/sessions', { method: 'POST' }, env);
  expect(res.status).toBe(201);
  const setCookie = res.headers.get('set-cookie') ?? '';
  const match = /clinic_session_id=([^;]+)/.exec(setCookie);
  if (!match?.[1]) {
    throw new Error('session cookie was not set');
  }
  return `clinic_session_id=${match[1]}`;
}

function openSlotIds(clinicId: number): number[] {
  const rows = testEnv.d1.raw
    .prepare("SELECT id FROM available_slots WHERE clinic_id = ? AND status = 'open' ORDER BY slot_date, slot_time")
    .all(clinicId) as unknown as { id: number }[];
  return rows.map((row) => row.id);
}

/** 投入から 10 秒経過した、ハニーポットを通る予約本文。 */
function reservationBody(clinicId: number, slotId: number, overrides: Record<string, unknown> = {}) {
  return {
    clinic_id: clinicId,
    slot_id: slotId,
    age_group: 'adult',
    symptom_note: '発熱',
    website: '',
    submitted_at: Date.now() - 10_000,
    ...overrides,
  };
}

describe('GET /health', () => {
  it('ok を返す', async () => {
    const res = await app.request('/health', {}, env);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('ok');
  });
});

describe('POST /api/sessions（F01）', () => {
  it('201 を返す。本文は空で、セッション ID は HttpOnly の Cookie だけで渡す', async () => {
    const res = await app.request('/api/sessions', { method: 'POST' }, env);
    expect(res.status).toBe(201);
    expect(await res.text()).toBe('');
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toMatch(/^clinic_session_id=[0-9a-f-]{36};/);
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');
  });

  it('開発環境（APP_ENV=development）だけ Secure を外す', async () => {
    const res = await app.request('/api/sessions', { method: 'POST' }, env);
    expect(res.headers.get('set-cookie')).not.toContain('Secure');
  });

  it('本番（APP_ENV=production）と APP_ENV 未設定では Secure を付ける', async () => {
    const production: Env = { ...env, APP_ENV: 'production' };
    const prodRes = await app.request('/api/sessions', { method: 'POST' }, production);
    expect(prodRes.headers.get('set-cookie')).toContain('Secure');
    const unset: Env = { ...env, APP_ENV: undefined };
    const unsetRes = await app.request('/api/sessions', { method: 'POST' }, unset);
    expect(unsetRes.headers.get('set-cookie')).toContain('Secure');
  });

  it('既存の有効な Cookie があれば同じ session_id を延長して使う', async () => {
    const cookie = await createSessionCookie();
    const res = await app.request('/api/sessions', { method: 'POST', headers: { Cookie: cookie } }, env);
    expect(res.status).toBe(201);
    expect(res.headers.get('set-cookie')).toContain(cookie);
  });
});

describe('POST /api/search（F02-F04）', () => {
  it('症状から診療科を返し、クリニックを点数順に返す', async () => {
    const res = await jsonRequest('POST', '/api/search', { symptom: '発熱', area: '', has_slot: false });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      departments: { id: number; name: string }[];
      area_id: number | null;
      clinics: { clinic: { id: number; departments: { name: string }[] }; score: number; available_slots_count: number }[];
    };
    // 「発熱」は 内科 の「発熱」と、小児科 の「子供の発熱」（部分一致）に当たる。優先度・id 順で並ぶ。
    expect(body.departments.map((d) => d.name)).toEqual(['内科', '小児科']);
    expect(body.area_id).toBeNull();
    expect(body.clinics.length).toBe(20);
    const clinic1 = body.clinics.find((item) => item.clinic.id === 1);
    expect(clinic1?.clinic.departments.map((d) => d.name)).toContain('内科');
    const scores = body.clinics.map((item) => item.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('地域名で絞り込み、area_id を返す', async () => {
    const res = await jsonRequest('POST', '/api/search', { symptom: '', area: '新宿', has_slot: false });
    const body = (await res.json()) as { area_id: number; clinics: { clinic: { id: number } }[] };
    expect(body.area_id).toBe(2);
    expect(body.clinics.map((item) => item.clinic.id).sort((a, b) => a - b)).toEqual([3, 4]);
  });

  it('フォーム形式（urlencoded）のボディも受け付ける', async () => {
    const res = await app.request(
      '/api/search',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'symptom=%E9%A0%AD%E7%97%9B&area=%E6%B8%8B%E8%B0%B7&has_slot=true',
      },
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { departments: { name: string }[]; clinics: unknown[] };
    expect(body.departments.map((d) => d.name)).toEqual(['内科']);
    expect(body.clinics.length).toBe(2);
  });

  it('has_slot=true は空き枠が無いクリニックを除外する', async () => {
    testEnv.d1.raw.exec("UPDATE available_slots SET status = 'reserved' WHERE clinic_id = 2");
    const res = await jsonRequest('POST', '/api/search', { symptom: '', area: '渋谷', has_slot: true });
    const body = (await res.json()) as { clinics: { clinic: { id: number } }[] };
    expect(body.clinics.map((item) => item.clinic.id)).toEqual([1]);
  });

  it('入力の上限を超えると 400（症状 100 字・地域 50 字）', async () => {
    const longSymptom = await jsonRequest('POST', '/api/search', { symptom: 'あ'.repeat(101), area: '', has_slot: false });
    expect(longSymptom.status).toBe(400);
    expect(await longSymptom.json()).toEqual({ error: 'Bad request' });
    const longArea = await jsonRequest('POST', '/api/search', { symptom: '', area: 'あ'.repeat(51), has_slot: false });
    expect(longArea.status).toBe(400);
    const atLimit = await jsonRequest('POST', '/api/search', { symptom: 'あ'.repeat(100), area: '', has_slot: false });
    expect(atLimit.status).toBe(200);
  });

  it('予約の症状メモは 500 字まで。超えると 400', async () => {
    const cookie = await createSessionCookie();
    const slotId = openSlotIds(1)[0] as number;
    const tooLong = await jsonRequest('POST', '/api/reservations', reservationBody(1, slotId, { symptom_note: 'あ'.repeat(501) }), cookie);
    expect(tooLong.status).toBe(400);
  });

  it('16KB を超えるボディは 400', async () => {
    const res = await jsonRequest('POST', '/api/search', { symptom: '', area: '', pad: 'x'.repeat(20_000) });
    expect(res.status).toBe(400);
  });

  it('解釈できない JSON は 400', async () => {
    const res = await app.request(
      '/api/search',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' },
      env,
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Bad request' });
  });
});

describe('GET /api/clinics/:id（F05）', () => {
  it('クリニック詳細と直近 7 日の枠（1 日 2 枠 × 7 日 = 14 件）を返す', async () => {
    const res = await app.request('/api/clinics/1', {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      id: number;
      name: string;
      rating: number;
      area: { id: number; name: string };
      departments: unknown[];
      slots: { slot_date: string; slot_time: string; status: string; capacity: number }[];
    };
    expect(body.id).toBe(1);
    expect(body.name).toBe('渋谷セントラルクリニック');
    expect(typeof body.rating).toBe('number');
    expect(body.area).toMatchObject({ id: 1, name: '渋谷' });
    expect(body.departments).toHaveLength(2);
    expect(body.slots).toHaveLength(14);
    expect(body.slots.every((slot) => slot.status === 'open' && slot.capacity === 1)).toBe(true);
  });

  it('存在しない ID と不正な ID は 404', async () => {
    const missing = await app.request('/api/clinics/99999', {}, env);
    expect(missing.status).toBe(404);
    expect(await missing.json()).toMatchObject({ error: 'Not found' });
    const invalid = await app.request('/api/clinics/abc', {}, env);
    expect(invalid.status).toBe(404);
  });
});

describe('予約（F06-F07）', () => {
  it('作成 → 確認 → キャンセル（枠は open に戻る）→ 再キャンセルは 422', async () => {
    const cookie = await createSessionCookie();
    const slotId = openSlotIds(1)[0] as number;

    const created = await jsonRequest('POST', '/api/reservations', reservationBody(1, slotId), cookie);
    expect(created.status).toBe(201);
    const reservation = (await created.json()) as { id: number; status: string; clinic: { id: number }; slot: { status: string } };
    expect(reservation.status).toBe('pending');
    expect(reservation.clinic.id).toBe(1);
    expect(reservation.slot.status).toBe('reserved');

    const shown = await app.request(`/api/reservations/${reservation.id}`, { headers: { Cookie: cookie } }, env);
    expect(shown.status).toBe(200);
    expect(((await shown.json()) as { id: number }).id).toBe(reservation.id);

    const cancelled = await app.request(
      `/api/reservations/${reservation.id}`,
      { method: 'DELETE', headers: { Cookie: cookie } },
      env,
    );
    expect(cancelled.status).toBe(200);
    expect(((await cancelled.json()) as { status: string }).status).toBe('cancelled');
    const slotRow = testEnv.d1.raw.prepare('SELECT status FROM available_slots WHERE id = ?').get(slotId) as { status: string };
    expect(slotRow.status).toBe('open');

    const again = await app.request(
      `/api/reservations/${reservation.id}`,
      { method: 'DELETE', headers: { Cookie: cookie } },
      env,
    );
    expect(again.status).toBe(422);
    expect(await again.json()).toEqual({ error: 'Already cancelled' });
  });

  it('同じ枠は二重に予約できない（422）', async () => {
    const first = await createSessionCookie();
    const second = await createSessionCookie();
    const slotId = openSlotIds(1)[0] as number;
    expect((await jsonRequest('POST', '/api/reservations', reservationBody(1, slotId), first)).status).toBe(201);
    const conflict = await jsonRequest('POST', '/api/reservations', reservationBody(1, slotId), second);
    expect(conflict.status).toBe(422);
    expect(await conflict.json()).toEqual({ error: 'Slot not available' });
  });

  it('同じセッションが同じ日に同じクリニックを再予約すると 422', async () => {
    const cookie = await createSessionCookie();
    const [firstSlot, secondSlot] = openSlotIds(1);
    expect((await jsonRequest('POST', '/api/reservations', reservationBody(1, firstSlot as number), cookie)).status).toBe(201);
    const duplicate = await jsonRequest('POST', '/api/reservations', reservationBody(1, secondSlot as number), cookie);
    expect(duplicate.status).toBe(422);
    expect(await duplicate.json()).toEqual({ error: 'Already reserved for this clinic on this date' });
    // 同じトランザクション内で拒否されるため、2 件目の枠は確保されずに open のまま残る
    const secondRow = testEnv.d1.raw.prepare('SELECT status FROM available_slots WHERE id = ?').get(secondSlot as number) as { status: string };
    expect(secondRow.status).toBe('open');
  });

  it('過去日の枠は予約できない（422）', async () => {
    testEnv.d1.raw.exec(
      "INSERT INTO available_slots (clinic_id, slot_date, slot_time, status, capacity) VALUES (1, '2020-01-01', '10:00', 'open', 1)",
    );
    const pastSlot = (testEnv.d1.raw.prepare("SELECT id FROM available_slots WHERE slot_date = '2020-01-01'").get() as { id: number }).id;
    const cookie = await createSessionCookie();
    const res = await jsonRequest('POST', '/api/reservations', reservationBody(1, pastSlot), cookie);
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: 'Slot date is in the past' });
  });

  it('枠が別のクリニックのものなら 422', async () => {
    const cookie = await createSessionCookie();
    const slotOfClinic2 = openSlotIds(2)[0] as number;
    const res = await jsonRequest('POST', '/api/reservations', reservationBody(1, slotOfClinic2), cookie);
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: 'Slot does not belong to clinic' });
  });

  it('存在しない枠・不正な年齢層は 422', async () => {
    const cookie = await createSessionCookie();
    const missingSlot = await jsonRequest('POST', '/api/reservations', reservationBody(1, 999999), cookie);
    expect(missingSlot.status).toBe(422);
    expect(await missingSlot.json()).toEqual({ error: 'Slot not found' });

    const slotId = openSlotIds(1)[0] as number;
    const badAge = await jsonRequest('POST', '/api/reservations', reservationBody(1, slotId, { age_group: 'alien' }), cookie);
    expect(badAge.status).toBe(422);
    expect(await badAge.json()).toEqual({ error: 'Validation failed' });
  });

  it('ハニーポットに値がある・投入が早すぎる場合は 400', async () => {
    const cookie = await createSessionCookie();
    const slotId = openSlotIds(1)[0] as number;
    const filled = await jsonRequest('POST', '/api/reservations', reservationBody(1, slotId, { _hp: 'bot' }), cookie);
    expect(filled.status).toBe(400);
    const tooFast = await jsonRequest(
      'POST',
      '/api/reservations',
      reservationBody(1, slotId, { submitted_at: Date.now() - 500 }),
      cookie,
    );
    expect(tooFast.status).toBe(400);
    expect(await tooFast.json()).toEqual({ error: 'Bad request' });
  });

  it('Cookie が無い予約は新しいセッションを発行して作成する（Rails 版と同じ）', async () => {
    const slotId = openSlotIds(1)[0] as number;
    const res = await jsonRequest('POST', '/api/reservations', reservationBody(1, slotId));
    expect(res.status).toBe(201);
    expect(res.headers.get('set-cookie')).toContain('clinic_session_id=');
  });

  it('他人の予約と存在しない予約は、どちらも同じ 404 を返す（予約 ID の存在を漏らさない）', async () => {
    const owner = await createSessionCookie();
    const other = await createSessionCookie();
    const slotId = openSlotIds(1)[0] as number;
    const created = (await (await jsonRequest('POST', '/api/reservations', reservationBody(1, slotId), owner)).json()) as {
      id: number;
    };

    const shownByOther = await app.request(`/api/reservations/${created.id}`, { headers: { Cookie: other } }, env);
    const shownMissing = await app.request('/api/reservations/999999', { headers: { Cookie: other } }, env);
    expect(shownByOther.status).toBe(404);
    expect(shownMissing.status).toBe(404);
    expect(await shownByOther.json()).toEqual(await shownMissing.json());

    const cancelledByOther = await app.request(
      `/api/reservations/${created.id}`,
      { method: 'DELETE', headers: { Cookie: other } },
      env,
    );
    const cancelledMissing = await app.request('/api/reservations/999999', { method: 'DELETE', headers: { Cookie: other } }, env);
    expect(cancelledByOther.status).toBe(404);
    expect(cancelledMissing.status).toBe(404);
    expect(await cancelledByOther.json()).toEqual(await cancelledMissing.json());
  });
});

describe('画面の配信（詳細ページは shell を返す）', () => {
  it('/clinic/:id と /reservations/:id は shell（_）を返し、拡張子つきはそのまま渡す', async () => {
    const detail = await app.request('/clinic/42', {}, env);
    expect(await detail.text()).toBe('asset:/clinic/_');
    const reservation = await app.request('/reservations/7', {}, env);
    expect(await reservation.text()).toBe('asset:/reservations/_');
    const rsc = await app.request('/clinic/42.txt', {}, env);
    expect(await rsc.text()).toBe('asset:/clinic/42.txt');
  });

  it('存在しない API パスは JSON の 404', async () => {
    const res = await app.request('/api/nope', {}, env);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});
