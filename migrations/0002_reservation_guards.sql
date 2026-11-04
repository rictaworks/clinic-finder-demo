-- 予約の整合性を DB 側で保証する。
-- 同じ枠の二重予約・同じセッションの同日重複を、予約作成のトランザクション内で拒否する（同時実行でも安全）。
-- 0001 で作った reservations に、枠の日付（slot_date）を複製して持たせる。
-- 注意: D1 のマイグレーションは明示的な BEGIN/COMMIT を書かない。

ALTER TABLE reservations ADD COLUMN slot_date TEXT;

UPDATE reservations
SET slot_date = (SELECT s.slot_date FROM available_slots AS s WHERE s.id = reservations.slot_id)
WHERE slot_date IS NULL;

-- 有効（pending）な予約は、同じ枠に 1 件だけ。
CREATE UNIQUE INDEX uq_reservations_pending_slot
  ON reservations(slot_id)
  WHERE status = 'pending';

-- 有効（pending）な予約は、同じセッション・同じクリニック・同じ日付に 1 件だけ。
CREATE UNIQUE INDEX uq_reservations_pending_day
  ON reservations(session_id, clinic_id, slot_date)
  WHERE status = 'pending';
