# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

---

## Claude Safety Rules

### 削除系コマンドの禁止（重要）

以下のルールはこのワークスペース内のすべての会話で絶対に守られる：

- Claude はファイルまたはディレクトリを削除するコマンドを一切生成してはならない。
  例：rm, rm -rf, rm *, rmdir, unlink, cache --delete,
      lftp mirror --delete, rsync --delete, git clean -df, find -delete 等。

- 削除が必要な場合でも、Claude は削除コマンドを提案せず、
  「手動で削除してください」といった説明に留めること。

- 削除の推奨・削除操作の自動判断も禁止。

- ssh / lftp / デプロイ系スクリプトを生成する場合でも、
  削除コマンドの生成は禁止。

これらはすべての会話・コード生成に適用される。

---

## プロジェクト概要

症状・場所・予約空き枠の 3 条件からクリニックを探すデモ用ウェブアプリ。

詳細仕様: @clinic-finder-demo-spec.md

## 技術スタック

| 層 | 技術 |
|---|---|
| フロントエンド | Next.js (React) |
| バックエンド | Rails (API mode) |
| DB | SQLite（デモ版固定） |
| テスト Rails | RSpec |
| テスト Next.js | Jest |
| E2E テスト | Playwright |
| アイコン | Font Awesome（絵文字禁止） |
| 図解 | Mermaid |
| デプロイ | フロント: Vercel / バック: Railway |

---

## ディレクトリ構成

| ディレクトリ | 用途 |
|---|---|
| `TASKS/` | タスク管理 |
| `DEBUG/` | バグ報告 |
| `CLIENT/` | クライアント要望 |
| `WORK/` | 作業報告 |
| `ENV/DEVELOPMENT.md` | 開発環境設定 |
| `ENV/PRODUCTION.md` | 本番環境設定 |
| `SPEC/` | 仕様書・ER図・DFD・シーケンス図・クラス図・状態遷移図・ユースケース図 |
| `DELETE/` | ゴミ箱（手動でのみ移動する） |
| `.claude/agents/` | エージェント定義 |
| `src/` | ソースコード（変更は PR 必須） |
| `test/pr***/` | PR 連動テストスクリプト |

---

## TDD（厳守）

サイクル: **plan → red test → coding → green test**

- **Rails**: RSpec
- **Next.js**: Jest
- **E2E / フロントエンド確認**: `curl` / `wget --mirror` / Playwright

---

## コーディング規約

- 制御構文・条件構文以外はクラスまたは関数に書くこと
- **グローバル変数禁止**（セキュリティ上の理由）
- 文字列リテラルは設定ファイルまたは DB に分離すること（ハードコード禁止）
- フォールバック禁止。例外処理を必ず実装すること
- デバッグトレースできるようにコードを書くこと（適切なログ出力を実装すること）
- ネイティブの `alert()` / `confirm()` / `prompt()` はプロジェクト全体で使用禁止
- 環境変数は `.env` を参照すること

---

## 品質・セキュリティ参照ファイル

| ファイル | 内容 |
|---|---|
| @.claude/development-principles.md | 開発原則（YAGNI / KISS / DRY / SOLID） |
| @.claude/CC.md | コンプライアンスチェックリスト（DC） |
| @.claude/QC10.md | 品質チェックリスト QC10 |
| @.claude/TM.md | テストメソッド・フレームワーク |
| @.claude/OWASP10.md | OWASP Top 10 セキュリティ |

**commit 前に必ず `/security-review` を実行すること。**

---

## ブランチ・PR ルール

- **main ブランチでの作業禁止**
- `src/*` 以外は main ブランチへの push 可
- `src/*` の変更は必ず PR を作成する
- PR 本文には**非エンジニア向けのユーザーテスト手順**を丁寧に記載すること

---

## デザイン

`app-ui/` にモックが配置されている場合は必ずそれに従うこと。
現在のモック: `app-ui/Clinic Finder Demo (standalone).html`

---

## エージェント定義（`.claude/agents/`）

| エージェント | 役割 |
|---|---|
| `director` | 全体方針・意思決定 |
| `project-manager` | タスク・スケジュール管理 |
| `designer` | UI/UX 設計（app-ui/ モック参照） |
| `debugger` | バグ調査・修正（DEBUG/ 連動） |
| `tester` | テスト設計・実行（TM.md 参照） |
| `data-scientist` | データ分析・クリニックスコア最適化 |
| `deployer` | Vercel / Railway デプロイ・インフラ |
| `writer` | ドキュメント・PR・ユーザー向け文章作成 |
| `service-manager` | サービス運用・監視・日次リセット管理 |

### サブエージェント

**`pr-checker`**: 全 PR を日本語でまとめ、非エンジニア向けユーザーテスト手順を PR 本文に記載する。レビューは行わない。

**`pr-tester`**: 全 PR のユーザーテスト手順実行スクリプトを作成する。TM.md 記載のテストを Jest / RSpec で実装。`test/pr***/` に作成し、対象は開発サーバーとする。

---

## 自社開発ルール

- 画像は AI 生成、文章はライターエージェントが担当
- 規模に応じてマイクロサービス / MVC / API Gateway / メッセージングを適用
- 安全なライブラリ・OSS・SaaS を優先し、車輪の再発明を避けてオリジナルコードを少なく保つ
- **基本スタック**: Next.js + Rails + PostgreSQL（本番） / SQLite（デモ版）
  - AI・解析が必要な場合: FastAPI で API を追加してもよい
  - 高速並列・リアルタイム通信が必要な場合: Gin で API を追加してもよい
- **デプロイ先**: フロント → 無料 Vercel / バック・管理画面 → 無料 Railway（or Render）
- **認証**: Google ログイン
- **作業範囲**: ウェブはデプロイ以降、デスクトップ/スマホはビルド以降、ESP32 は焼き込み以降は Claude Desktop で作業
- **ドメイン**: 原則 `rictaworks.jp` のサブドメイン
- **多言語**: 日本語・英語・フランス語・中国語・ロシア語・スペイン語・アラビア語（管理画面は日本語のみ）
- 環境判定を必ず実装し、開発環境は認証済み状態に分岐すること
- 文字列リテラルをファイル / DB に分離し、ハードコードをチェックするテストを書くこと
