import { Hono } from 'hono';
import { INPUT_LIMITS } from '../config/constants';
import { MESSAGES } from '../config/messages';
import type { AppBindings } from '../env';
import { BadRequestError } from '../lib/errors';
import { writeLog } from '../lib/logger';
import { castBoolean, readBodyParams, toPositiveInt, toTrimmedString } from '../lib/params';
import { createServices } from '../container';
import { sessionMiddleware } from '../middleware/session';
import { passesHoneypot } from '../services/honeypotGuard';

/** Rails 版 API と同じパス・同じ JSON 形を維持する（フロントの lib/api.ts と対応）。 */
export function apiRoutes(): Hono<AppBindings> {
  const api = new Hono<AppBindings>();

  // F01: 匿名セッション発行（Cookie が有効なら既存を延長）。
  // 本文は返さない。セッション ID は HttpOnly の Cookie だけで渡し、JavaScript から読めないようにする。
  api.post('/sessions', sessionMiddleware(), (c) => c.body(null, 201));

  // F02-F04: 症状・地域・空き枠でクリニックを検索
  api.post('/search', async (c) => {
    const params = await readBodyParams(c.req.raw);
    const symptom = toTrimmedString(params.symptom);
    const area = toTrimmedString(params.area);
    if (symptom.length > INPUT_LIMITS.SYMPTOM_MAX_LENGTH) {
      throw new BadRequestError('symptom too long');
    }
    if (area.length > INPUT_LIMITS.AREA_MAX_LENGTH) {
      throw new BadRequestError('area too long');
    }
    const services = createServices(c.env.DB);
    const result = await services.search.search({
      symptom,
      area,
      hasSlot: castBoolean(params.has_slot) === true,
    });
    return c.json(result);
  });

  // F05: クリニック詳細（直近 7 日の枠つき）
  api.get('/clinics/:id', async (c) => {
    const clinicId = toPositiveInt(c.req.param('id'));
    const detail = clinicId === null ? null : await createServices(c.env.DB).clinic.findDetail(clinicId);
    if (!detail) {
      return c.json({ error: MESSAGES.notFound, message: MESSAGES.clinicNotFound }, 404);
    }
    return c.json(detail);
  });

  // F06: 仮予約（ハニーポットと投入時間の検査つき）
  api.post('/reservations', sessionMiddleware(), async (c) => {
    const params = await readBodyParams(c.req.raw);
    if (!passesHoneypot(params, Date.now())) {
      throw new BadRequestError('honeypot check failed');
    }
    const symptomNote = params.symptom_note === undefined || params.symptom_note === null ? null : String(params.symptom_note);
    if (symptomNote !== null && symptomNote.length > INPUT_LIMITS.SYMPTOM_NOTE_MAX_LENGTH) {
      throw new BadRequestError('symptom_note too long');
    }
    const services = createServices(c.env.DB);
    const reservation = await services.reservation.reserve({
      clinicId: toPositiveInt(params.clinic_id),
      slotId: toPositiveInt(params.slot_id),
      ageGroup: toTrimmedString(params.age_group),
      symptomNote,
      sessionId: c.get('sessionId'),
    });
    return c.json(reservation, 201);
  });

  // F07: 予約確認（所有者のみ。他人の予約は存在しない予約と同じ 404）
  api.get('/reservations/:id', sessionMiddleware(), async (c) => {
    const reservationId = toPositiveInt(c.req.param('id'));
    if (reservationId === null) {
      return c.json({ error: MESSAGES.notFound, message: MESSAGES.reservationNotFound }, 404);
    }
    const reservation = await createServices(c.env.DB).reservation.getOwned(reservationId, c.get('sessionId'));
    return c.json(reservation);
  });

  // F07: 予約キャンセル（所有者のみ。open に戻す）
  api.delete('/reservations/:id', sessionMiddleware(), async (c) => {
    const reservationId = toPositiveInt(c.req.param('id'));
    if (reservationId === null) {
      return c.json({ error: MESSAGES.notFound, message: MESSAGES.reservationNotFound }, 404);
    }
    const reservation = await createServices(c.env.DB).reservation.cancel(reservationId, c.get('sessionId'));
    writeLog('info', 'ReservationRoute', 'cancel responded');
    return c.json(reservation);
  });

  return api;
}
