-- Cloudflare D1 (SQLite) スキーマ。
-- 移行元: src/backend/db/schema.rb と db/migrate/*.rb（ActiveRecord）。
-- マスタ（areas / departments / symptoms / clinics / clinic_departments）と初期枠は
-- 末尾の seed セクションで投入する（src/backend/db/seeds.rb と同じ値）。
-- 日時は UTC の ISO 8601 文字列（ミリ秒付き）で保持する。
-- 注意: D1 のマイグレーションは明示的な BEGIN/COMMIT を書かない。

CREATE TABLE areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  kana TEXT,
  en_name TEXT,
  aliases TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE symptoms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  normalized TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (keyword, department_id)
);
CREATE INDEX idx_symptoms_normalized ON symptoms(normalized);

CREATE TABLE clinics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  area_id INTEGER NOT NULL REFERENCES areas(id),
  address TEXT,
  phone_display TEXT,
  rating REAL CHECK (rating IS NULL OR (rating >= 1.0 AND rating <= 5.0)),
  open_time TEXT,
  close_time TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_clinics_area ON clinics(area_id);

CREATE TABLE clinic_departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id),
  department_id INTEGER NOT NULL REFERENCES departments(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (clinic_id, department_id)
);

-- 1 日の枠の時刻（Rails の seeds.rb の slot_times に相当）。文字列をコードに書かず DB で持つ。
CREATE TABLE slot_time_templates (
  slot_time TEXT PRIMARY KEY
);

CREATE TABLE available_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id),
  slot_date TEXT NOT NULL,
  slot_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reserved')),
  capacity INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (clinic_id, slot_date, slot_time)
);
CREATE INDEX idx_available_slots_date_status ON available_slots(slot_date, status);

CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES sessions(session_id),
  clinic_id INTEGER NOT NULL REFERENCES clinics(id),
  slot_id INTEGER NOT NULL REFERENCES available_slots(id),
  age_group TEXT NOT NULL CHECK (age_group IN ('child', 'teen', 'adult', 'senior')),
  symptom_note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled')),
  reserved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_reservations_session ON reservations(session_id);

-- 日次リセットの実行履歴（reset_date は UTC の日付。同じ日に二重実行しないための一意制約）。
CREATE TABLE reset_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reset_date TEXT NOT NULL UNIQUE,
  executed_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ===== seed（マスタ・初期枠）=====
INSERT INTO areas (id, name, kana, en_name, aliases) VALUES
  (1, '渋谷', 'シブヤ', 'shibuya', '渋谷区,しぶや'),
  (2, '新宿', 'シンジュク', 'shinjuku', '新宿区,しんじゅく'),
  (3, '池袋', 'イケブクロ', 'ikebukuro', '豊島区,いけぶくろ'),
  (4, '品川', 'シナガワ', 'shinagawa', '品川区,しながわ'),
  (5, '銀座', 'ギンザ', 'ginza', '中央区,ぎんざ'),
  (6, '上野', 'ウエノ', 'ueno', '台東区,うえの'),
  (7, '秋葉原', 'アキハバラ', 'akihabara', '千代田区,あきはばら'),
  (8, '吉祥寺', 'キチジョウジ', 'kichijoji', '武蔵野市,きちじょうじ'),
  (9, '横浜', 'ヨコハマ', 'yokohama', '横浜市,よこはま'),
  (10, '川崎', 'カワサキ', 'kawasaki', '川崎市,かわさき');

INSERT INTO departments (id, name, description) VALUES
  (1, '内科', '内科的疾患全般を診療します'),
  (2, '外科', '外科的処置・手術を行います'),
  (3, '整形外科', '骨・関節・筋肉の疾患を診療します'),
  (4, '眼科', '目の疾患を診療します'),
  (5, '耳鼻科', '耳・鼻・喉の疾患を診療します'),
  (6, '皮膚科', '皮膚疾患を診療します'),
  (7, '小児科', '小児の疾患を診療します'),
  (8, '神経内科', '神経系疾患を診療します'),
  (9, '消化器科', '消化器系疾患を診療します'),
  (10, '呼吸器科', '呼吸器系疾患を診療します'),
  (11, '歯科', '歯・口腔の疾患を診療します'),
  (12, '総合内科', '総合的な内科疾患を診療します');

INSERT INTO symptoms (id, keyword, normalized, department_id, priority) VALUES
  (1, '発熱', '発熱', 1, 1),
  (2, '咳', '咳', 1, 2),
  (3, '倦怠感', '倦怠感', 1, 2),
  (4, '頭痛', '頭痛', 1, 3),
  (5, '下痢', '下痢', 1, 3),
  (6, '切り傷', '切り傷', 2, 1),
  (7, '打撲', '打撲', 2, 2),
  (8, '骨折', '骨折', 2, 1),
  (9, 'やけど', 'やけど', 2, 2),
  (10, '腫れ', '腫れ', 2, 3),
  (11, '腰痛', '腰痛', 3, 1),
  (12, '膝の痛み', '膝の痛み', 3, 1),
  (13, '肩こり', '肩こり', 3, 2),
  (14, '捻挫', '捻挫', 3, 2),
  (15, '関節痛', '関節痛', 3, 2),
  (16, '目が痛い', '目が痛い', 4, 1),
  (17, '視力低下', '視力低下', 4, 2),
  (18, '充血', '充血', 4, 2),
  (19, '目のかゆみ', '目のかゆみ', 4, 3),
  (20, '目やに', '目やに', 4, 3),
  (21, '鼻水', '鼻水', 5, 1),
  (22, '耳が痛い', '耳が痛い', 5, 1),
  (23, 'のどが痛い', 'のどが痛い', 5, 2),
  (24, '鼻づまり', '鼻づまり', 5, 2),
  (25, '難聴', '難聴', 5, 3),
  (26, 'かゆみ', 'かゆみ', 6, 1),
  (27, '湿疹', '湿疹', 6, 1),
  (28, 'じんましん', 'じんましん', 6, 2),
  (29, 'にきび', 'にきび', 6, 3),
  (30, '水虫', '水虫', 6, 3),
  (31, '子供の発熱', '子供の発熱', 7, 1),
  (32, '子供の咳', '子供の咳', 7, 2),
  (33, '夜泣き', '夜泣き', 7, 3),
  (34, '食欲不振', '食欲不振', 7, 3),
  (35, '成長不良', '成長不良', 7, 3),
  (36, 'めまい', 'めまい', 8, 1),
  (37, '手足のしびれ', '手足のしびれ', 8, 1),
  (38, '物忘れ', '物忘れ', 8, 2),
  (39, '歩行障害', '歩行障害', 8, 2),
  (40, 'けいれん', 'けいれん', 8, 1),
  (41, '腹痛', '腹痛', 9, 1),
  (42, '胃が痛い', '胃が痛い', 9, 1),
  (43, '嘔吐', '嘔吐', 9, 2),
  (44, '胸やけ', '胸やけ', 9, 2),
  (45, '便秘', '便秘', 9, 3),
  (46, '息切れ', '息切れ', 10, 1),
  (47, '慢性的な咳', '慢性的な咳', 10, 1),
  (48, '喘息', '喘息', 10, 1),
  (49, '痰', '痰', 10, 2),
  (50, '胸の痛み', '胸の痛み', 10, 2),
  (51, '歯が痛い', '歯が痛い', 11, 1),
  (52, '歯茎の腫れ', '歯茎の腫れ', 11, 2),
  (53, '虫歯', '虫歯', 11, 1),
  (54, '歯の欠け', '歯の欠け', 11, 2),
  (55, '口臭', '口臭', 11, 3),
  (56, '全身倦怠感', '全身倦怠感', 12, 1),
  (57, '体重減少', '体重減少', 12, 2),
  (58, '高血圧', '高血圧', 12, 2),
  (59, '糖尿病', '糖尿病', 12, 2),
  (60, '高脂血症', '高脂血症', 12, 3);

INSERT INTO clinics (id, name, area_id, address, phone_display, rating, open_time, close_time) VALUES
  (1, '渋谷セントラルクリニック', 1, '東京都渋谷区道玄坂1-1-1', '03-1234-5678', 4.5, '09:00', '18:00'),
  (2, '渋谷メディカルセンター', 1, '東京都渋谷区渋谷2-2-2', '03-1234-5679', 4, '10:00', '20:00'),
  (3, '新宿ファミリークリニック', 2, '東京都新宿区西新宿1-1-1', '03-2345-6789', 4.2, '09:00', '18:00'),
  (4, '新宿健康クリニック', 2, '東京都新宿区新宿3-3-3', '03-2345-6790', 3.8, '10:00', '20:00'),
  (5, '池袋ウェストクリニック', 3, '東京都豊島区西池袋1-1-1', '03-3456-7890', 4.3, '09:00', '18:00'),
  (6, '池袋メディカルプラザ', 3, '東京都豊島区池袋2-2-2', '03-3456-7891', 4.1, '10:00', '20:00'),
  (7, '品川シーサイドクリニック', 4, '東京都品川区東品川1-1-1', '03-4567-8901', 4.4, '09:00', '18:00'),
  (8, '品川駅前クリニック', 4, '東京都品川区北品川2-2-2', '03-4567-8902', 3.9, '10:00', '20:00'),
  (9, '銀座中央クリニック', 5, '東京都中央区銀座1-1-1', '03-5678-9012', 4.7, '09:00', '18:00'),
  (10, '銀座メディカルケア', 5, '東京都中央区銀座5-5-5', '03-5678-9013', 4.5, '10:00', '20:00'),
  (11, '上野パーククリニック', 6, '東京都台東区上野2-2-2', '03-6789-0123', 4, '09:00', '18:00'),
  (12, '上野駅前内科', 6, '東京都台東区上野3-3-3', '03-6789-0124', 3.7, '10:00', '20:00'),
  (13, '秋葉原テックメディカル', 7, '東京都千代田区外神田1-1-1', '03-7890-1234', 4.1, '09:00', '18:00'),
  (14, '秋葉原駅前クリニック', 7, '東京都千代田区外神田4-4-4', '03-7890-1235', 3.8, '10:00', '20:00'),
  (15, '吉祥寺グリーンクリニック', 8, '東京都武蔵野市吉祥寺本町1-1-1', '0422-12-3456', 4.6, '09:00', '18:00'),
  (16, '吉祥寺メディカルセンター', 8, '東京都武蔵野市吉祥寺南町2-2-2', '0422-12-3457', 4.3, '10:00', '20:00'),
  (17, '横浜みなとクリニック', 9, '神奈川県横浜市中区山下町1-1', '045-123-4567', 4.4, '09:00', '18:00'),
  (18, '横浜駅前メディカル', 9, '神奈川県横浜市西区高島2-2-2', '045-123-4568', 4, '10:00', '20:00'),
  (19, '川崎健康クリニック', 10, '神奈川県川崎市川崎区砂子1-1-1', '044-123-4567', 3.9, '09:00', '18:00'),
  (20, '川崎ウェルネスクリニック', 10, '神奈川県川崎市中原区小杉2-2-2', '044-123-4568', 4.2, '10:00', '20:00');

INSERT INTO clinic_departments (id, clinic_id, department_id) VALUES
  (1, 1, 1),
  (2, 1, 2),
  (3, 2, 2),
  (4, 2, 3),
  (5, 3, 3),
  (6, 3, 4),
  (7, 4, 4),
  (8, 4, 5),
  (9, 5, 5),
  (10, 5, 6),
  (11, 6, 6),
  (12, 6, 7),
  (13, 7, 7),
  (14, 7, 8),
  (15, 8, 8),
  (16, 8, 9),
  (17, 9, 9),
  (18, 9, 10),
  (19, 10, 10),
  (20, 10, 11),
  (21, 11, 11),
  (22, 11, 12),
  (23, 12, 12),
  (24, 12, 1),
  (25, 13, 1),
  (26, 13, 2),
  (27, 14, 2),
  (28, 14, 3),
  (29, 15, 3),
  (30, 15, 4),
  (31, 16, 4),
  (32, 16, 5),
  (33, 17, 5),
  (34, 17, 6),
  (35, 18, 6),
  (36, 18, 7),
  (37, 19, 7),
  (38, 19, 8),
  (39, 20, 8),
  (40, 20, 9);

INSERT INTO slot_time_templates (slot_time) VALUES ('10:00'), ('14:00');

-- 初期枠: 投入日（UTC）から 7 日分（今日〜+6 日）。以後は日次リセットで 1 日ずつ補充する。
WITH RECURSIVE window_days(slot_date) AS (
  SELECT date('now')
  UNION ALL
  SELECT date(slot_date, '+1 day') FROM window_days WHERE slot_date < date('now', '+6 days')
)
INSERT INTO available_slots (clinic_id, slot_date, slot_time, status, capacity)
SELECT c.id, d.slot_date, t.slot_time, 'open', 1
FROM clinics AS c
CROSS JOIN window_days AS d
CROSS JOIN slot_time_templates AS t;
