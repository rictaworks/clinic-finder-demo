# clinic-finder-demo

症状・場所・予約空き枠の 3 条件から最適なクリニックを探すデモ用ウェブアプリ。

---

## 自動ログイン

このアプリは**ログイン不要**です。

初回アクセス時に匿名セッション（Cookie ベース）が自動発行されます。セッション ID がオーナーキーとして機能するため、アカウント作成・ログイン操作は一切不要です。

**開発環境では追加の設定なしにすぐ利用できます。**

> デモ版のため、予約・セッションは毎日 JST 03:00（UTC 18:00）に自動リセットされます。マスタデータ（クリニック・診療科・地域）はリセットされません。

---

## ページ一覧

開発環境ベース URL: `http://localhost:3000`

| ページ名 | URL |
|---|---|
| トップ（症状・場所検索） | [/](http://localhost:3000/) |
| 検索結果 | [/search](http://localhost:3000/search) |
| クリニック詳細 | [/clinics/\[id\]](http://localhost:3000/clinics/1) |
| 仮予約フォーム | [/clinics/\[id\]/reserve](http://localhost:3000/clinics/1/reserve) |
| 予約確認 | [/reservations/\[id\]](http://localhost:3000/reservations/1) |
| 予約キャンセル | [/reservations/\[id\]/cancel](http://localhost:3000/reservations/1/cancel) |

---

## API 一覧

API 仕様詳細: [SPEC/api.md](SPEC/api.md)

開発環境ベース URL: `http://localhost:3001`

| タイトル | エンドポイント |
|---|---|
| セッション発行（F01） | `POST /api/v1/sessions` |
| クリニック検索（F02/F03/F04） | `POST /api/v1/search` |
| クリニック詳細取得（F05） | `GET /api/v1/clinics/:id` |
| 仮予約登録（F06） | `POST /api/v1/reservations` |
| 予約確認（F07） | `GET /api/v1/reservations/:id` |
| 予約キャンセル（F07） | `PATCH /api/v1/reservations/:id/cancel` |

---

## セットアップ

```bash
# フロントエンド（Next.js）
cd src/frontend && npm install && npm run dev

# バックエンド（Rails）
cd src/backend && bundle install && rails db:setup && rails server -p 3001
```

詳細: [ENV/DEVELOPMENT.md](ENV/DEVELOPMENT.md)

---

## 仕様・設計ドキュメント

| ドキュメント | リンク |
|---|---|
| 全体仕様 | [clinic-finder-demo-spec.md](clinic-finder-demo-spec.md) |
| API 仕様 | [SPEC/api.md](SPEC/api.md) |
| ER 図 | [SPEC/er.md](SPEC/er.md) |
| DFD | [SPEC/dfd.md](SPEC/dfd.md) |
| シーケンス図 | [SPEC/sequence.md](SPEC/sequence.md) |
| クラス図 | [SPEC/class.md](SPEC/class.md) |
| 状態遷移図 | [SPEC/state.md](SPEC/state.md) |
| ユースケース図 | [SPEC/usecase.md](SPEC/usecase.md) |
| 開発環境 | [ENV/DEVELOPMENT.md](ENV/DEVELOPMENT.md) |
| 本番環境 | [ENV/PRODUCTION.md](ENV/PRODUCTION.md) |
