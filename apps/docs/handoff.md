# 引き継ぎ資料

ZIP で受け取った開発者が、15 分程度で全体像と最初の作業導線を把握するための入口です。詳細なセットアップ手順は `README.md`、開発ルールは `AGENTS.md` を正本として参照してください。

---

## 1. この資料の目的

- 初見の開発者が、何のアプリかを把握する
- どのディレクトリと資料を先に見るべきかを整理する
- ローカル起動までの最短ルートを確認する
- 詳細仕様ではなく、自己参照を始めるための地図として使う

---

## 2. プロダクト概要

クエスト掲示板は、ユーザーがクエストを投稿し、参加し、レビューできるアプリです。

- クエスト一覧を閲覧する
- クエスト詳細を確認する
- クエストを作成、編集、削除する
- クエストへ参加する
- 完了後にレビューを投稿する
- マイページで自分の活動を確認する
- 管理者がユーザーを管理する

大まかな流れ:

```text
ログイン
  -> クエスト閲覧
  -> クエスト作成 / 参加
  -> レビュー
  -> マイページで確認
```

---

## 3. 全体アーキテクチャ

| 領域 | 技術 / 役割 |
| --- | --- |
| Frontend | Next.js / React UI |
| Backend | Express API |
| DB | MySQL + Prisma |
| Auth | Google OAuth 2.0 |
| Docs | VitePress |

データの流れ:

```text
Browser
  -> apps/frontend
  -> apps/backend
  -> Prisma
  -> MySQL
```

認証は Google OAuth 2.0 の ID トークンを frontend で扱い、backend で検証します。

---

## 4. ディレクトリの見方

| パス | 見るもの |
| --- | --- |
| `apps/frontend` | 画面、UI コンポーネント、hooks、API client |
| `apps/backend` | API、controller、service、Prisma、認証 |
| `apps/e2e` | Playwright E2E テスト |
| `packages/types` | frontend / backend の共有型 |
| `apps/docs` | VitePress の開発資料 |
| `docs` | AI / 開発運用の正本ドキュメント |
| `prompt` | 補助テンプレート |

---

## 5. 最初に読む順番

1. `README.md`
2. `AGENTS.md`
3. `docs/architecture.md`
4. `docs/ai-execution.md`
5. 関連コード
6. 関連テスト

役割:

| 文書 | 目的 |
| --- | --- |
| `README.md` | セットアップ、起動、主要コマンド |
| `AGENTS.md` | AI エージェント向けの作業ルール |
| `docs/architecture.md` | レイヤー責務と変更判断 |
| `docs/ai-execution.md` | 調査、実装、検証、報告の流れ |

---

## 6. 環境構築の最短ルート

必要なもの:

- Node.js
- pnpm
- Docker / Docker Compose
- Google Cloud Console で OAuth 2.0 クライアント ID を発行済み

最短手順:

```bash
pnpm install
cp apps/frontend/.env.local.example apps/frontend/.env.local
cp apps/backend/.env.local.example apps/backend/.env.local
docker compose up -d
pnpm db:generate
pnpm db:push
pnpm --filter backend seed
pnpm dev
```

`.env.local` の具体的な値は `README.md` の環境変数セクションを参照してください。

---

## 7. ローカル起動後の確認先

| 対象 | 確認先 |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend OpenAPI JSON | `http://localhost:3001/api/openapi.json` |
| Swagger UI | `http://localhost:3001/api/docs` |
| Docs | `pnpm dev:docs` で起動 |

Docs は通常 `http://localhost:5173` で確認します。

---

## 8. 開発時によく触る場所

| 変更内容 | 主な入口 | 補足資料 |
| --- | --- | --- |
| 画面変更 | `apps/frontend/src/app`, `apps/frontend/src/components` | [FE のディレクトリ構成](./quest-frontend-directory.md) |
| API 呼び出し | `apps/frontend/src/services` | [API 一覧](./quest-apis.md) |
| API 追加 / 修正 | `apps/backend/src/routes`, `apps/backend/src/controllers`, `apps/backend/src/services` | [BE のディレクトリ構成](./quest-backend-directory.md) |
| DB 変更 | `apps/backend/prisma/schema.prisma`, `apps/backend/src/dataAccessor` | [テーブル定義書](./quest-tdd.md) |
| 認証変更 | `apps/frontend/src/hooks`, `apps/frontend/src/services/auth/googleAuth.ts`, `apps/backend/src/middlewares/auth.middleware.ts` | `README.md` |
| テスト追加 | `apps/frontend/src/__tests__`, `apps/backend/src/__tests__`, `apps/e2e/tests` | `apps/backend/src/__tests__/README.md` |

---

## 9. 検証コマンド

よく使う検証:

```bash
pnpm --filter frontend test
pnpm --filter backend test
pnpm --filter backend typecheck
pnpm build
```

必要時のみ実行:

```bash
pnpm --filter e2e test
```

ドキュメントだけを確認する場合:

```bash
pnpm build:docs
```

---

## 10. 引き継ぎ時の注意点

- `.env` / `.env.local` は ZIP に含めない
- Google OAuth クライアント ID は Google Cloud Console から再発行できるため、秘密鍵の共有は不要
- `node_modules` は ZIP に含めない
- `.next`、`dist`、coverage などの build artifact は ZIP に含めない
- 受領者は `README.md` の手順で clean setup する
- ZIP 受領後に `pnpm install` から再構築する前提で説明する

---

## 11. 困ったときの参照先

| 知りたいこと | 参照先 |
| --- | --- |
| API | [API 一覧](./quest-apis.md) |
| ER 図 / ER 説明 | [ER 図](./quest-er.md), [erd.png](./erd.png) |
| DB 定義 | [テーブル定義書](./quest-tdd.md) |
| コーディング規約 | [コーディング規約](./coding-standards.md) |
| ログ設計 | [ログ設計書](./logging-design.md) |
| レビュー規約 | [レビュー規約](./review_standards.md) |

