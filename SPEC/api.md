# API 仕様

ベース URL（開発）: `http://localhost:3001`
ベース URL（本番）: `https://clinic-finder-demo.railway.app`

全エンドポイントは `/api/v1/` プレフィックスを使用する。
セッション管理は Cookie ベース（`session_id`）。

---

## F01: セッション発行

**POST /api/v1/sessions**

初回アクセス時に匿名セッションを発行する。Cookie がすでに有効な場合は既存セッションを返す。

### リクエスト

```http
POST /api/v1/sessions HTTP/1.1
Content-Type: application/json
```

### レスポンス 201 Created

```json
{
  "session_id": "abc123...",
  "expires_at": "2026-06-28T18:00:00Z"
}
```

---

## F02/F03/F04: クリニック検索

**POST /api/v1/search**

症状・場所・空き有無の 3 条件でクリニックを複合スコア順に返す。

### リクエスト

```json
{
  "symptoms": ["頭痛", "発熱"],
  "location": "新宿",
  "has_slot": true
}
```

### レスポンス 200 OK

```json
{
  "clinics": [
    {
      "clinic_id": 1,
      "name": "新宿クリニック",
      "area": "新宿",
      "address": "東京都新宿区...",
      "rating": 4.5,
      "departments": ["内科", "神経内科"],
      "score": 85,
      "available_slots_count": 3
    }
  ],
  "matched_departments": ["内科", "神経内科"]
}
```

### スコア計算

```
スコア = 診療科マッチ度(40点) + 空き枠数スコア(30点) + クリニック評価(30点)
```

---

## F05: クリニック詳細取得

**GET /api/v1/clinics/:id**

クリニックの詳細情報と直近 7 日の予約枠を返す。

### レスポンス 200 OK

```json
{
  "clinic_id": 1,
  "name": "新宿クリニック",
  "area": "新宿",
  "address": "東京都新宿区...",
  "phone_display": "03-XXXX-XXXX",
  "rating": 4.5,
  "open_time": "09:00",
  "close_time": "18:00",
  "departments": ["内科", "神経内科"],
  "available_slots": [
    {
      "slot_id": 101,
      "slot_date": "2026-06-28",
      "slot_time": "10:00",
      "status": "open",
      "capacity": 2
    }
  ]
}
```

### エラー 404 Not Found

```json
{ "error": "clinic_not_found" }
```

---

## F06: 仮予約登録

**POST /api/v1/reservations**

セッション単位の仮予約を登録する。同日二重予約・競合は拒否する。

### リクエスト

```json
{
  "clinic_id": 1,
  "slot_id": 101,
  "age_group": "30s",
  "symptom_note": "頭痛と発熱が続いています",
  "honeypot": ""
}
```

### レスポンス 201 Created

```json
{
  "reservation_id": "rsv_abc123",
  "status": "pending",
  "reserved_at": "2026-06-27T10:30:00Z"
}
```

### エラー

| コード | 説明 |
|---|---|
| 409 Conflict | 同スロットが既に予約済み（CAS 失敗） |
| 422 Unprocessable | 同日二重予約 / ハニーポット検出 |
| 401 Unauthorized | セッション無効 |

---

## F07: 予約確認

**GET /api/v1/reservations/:id**

セッション所有者のみ参照可能。

### レスポンス 200 OK

```json
{
  "reservation_id": "rsv_abc123",
  "clinic": { "clinic_id": 1, "name": "新宿クリニック" },
  "slot": { "slot_date": "2026-06-28", "slot_time": "10:00" },
  "age_group": "30s",
  "status": "pending",
  "reserved_at": "2026-06-27T10:30:00Z"
}
```

---

## F07: 予約キャンセル

**PATCH /api/v1/reservations/:id/cancel**

セッション所有者のみキャンセル可能。スロットを `open` に戻す。

### レスポンス 200 OK

```json
{
  "reservation_id": "rsv_abc123",
  "status": "cancelled"
}
```

### エラー

| コード | 説明 |
|---|---|
| 403 Forbidden | セッション所有者でない |
| 404 Not Found | 予約が存在しない |

---

## F08: 日次 DB リセット（内部 cron）

エンドポイントなし。Rails の `whenever` gem により UTC 18:00 に自動実行。

処理内容:
1. `reservations` 全件を `cancelled` に更新後レコード削除
2. `sessions` 全件削除
3. `available_slots` の `status` を `open` にリセット
4. `reset_logs` にリセット日時を記録
