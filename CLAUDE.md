# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

セットアップ・環境変数の詳細は README.md を参照。主要コマンド:

```bash
pnpm dev                        # 全サービス並列起動 (frontend:3000 / backend:3001 / docs)
pnpm dev:frontend | dev:backend | dev:docs  # 個別起動
pnpm build                      # 全体ビルド (docs -> frontend -> backend の順)
pnpm lint / pnpm lint:fix       # Biome check / 自動修正 (--apply)

docker compose up -d            # MySQL 起動 (DB 操作前に必須)
pnpm db:generate                # Prisma クライアント生成
pnpm db:push                    # スキーマを DB へ反映
pnpm db:studio                  # Prisma Studio (DB GUI)
pnpm --filter backend seed      # シードデータ投入
```

### テスト・型チェック

```bash
pnpm --filter backend test                 # Jest (backend, ts-jest, node 環境)
pnpm --filter backend typecheck            # tsc --noEmit
pnpm --filter backend test:coverage        # カバレッジ
pnpm --filter frontend test                # Vitest (frontend, jsdom + RTL)
pnpm --filter frontend test:coverage

# 単一テスト
pnpm --filter backend test -- questService.test.ts   # ファイル指定 (Jest)
pnpm --filter backend test -- -t "作成"               # テスト名で絞り込み
pnpm --filter frontend test -- QuestCard              # Vitest はパターン一致で実行
pnpm --filter e2e test                                # Playwright (要 apps/e2e/.env, 起動中のサーバー)
```

`test:prepush` (backend) は `typecheck` と `test --runInBand` を実行する重い検証。

テストファイルの配置場所:
- backend: `apps/backend/src/__tests__/{config,controllers,middlewares,routes,services,utils}/`
- frontend: `apps/frontend/src/__tests__/{components,constants,hooks,services}/`

## 環境変数

`apps/backend/.env.local` と `apps/frontend/.env.local` を作成する（各 `.env.local.example` をコピーして値を埋める）。

| ファイル | 主要変数 | 取得元 |
|---|---|---|
| backend | `FIREBASE_PROJECT_ID` `FIREBASE_CLIENT_EMAIL` `FIREBASE_PRIVATE_KEY` | Firebase コンソール > サービスアカウント > 秘密鍵生成 |
| backend | `DATABASE_URL` `SHADOW_DATABASE_URL` | `docker-compose.yml` のデフォルト値を参照 |
| frontend | `NEXT_PUBLIC_FIREBASE_*` | Firebase コンソール > ウェブアプリ |
| frontend | `NEXT_PUBLIC_API_BASE_URL` | dev: `http://localhost:3001` |

## アプリケーション概要

「クエスト掲示板」は社内向けのタスク投稿・参加アプリ。

**ユーザー種別と権限:**
- **一般ユーザー**: クエストへの参加・レビュー投稿・マイページ閲覧
- **管理者 (ADMIN)**: クエストの作成・編集・ステータス変更・削除復元・ユーザー管理。`constants/roles.ts` の `ROLES.ADMIN` で判定

**クエストのステータス遷移:**
```
draft（下書き）→ pending（承認待ち、一般ユーザーが submit）
  → active（公開中、管理者が承認）→ in_progress（進行中）→ completed（完了）
  → inactive（停止中、管理者が一時停止）
```
論理削除あり（`deleted_at`）。`restore` で復元可能。`reactivate` で inactive → active に戻す。

設計詳細は `apps/docs/` の VitePress サイト（`pnpm dev:docs`）を参照。要件定義・ER 図・API 一覧・コーディング規約など一式がある。

## アーキテクチャ

pnpm workspace のモノレポ。`apps/*` (frontend / backend / docs / e2e) と `packages/types` で構成。

### backend (Express + Prisma + Firebase Admin)

リクエストは**厳格な層構造**を通る。新機能は層を飛ばさず縦に追加する:

```
routes/*.ts       → URL とミドルウェア (authMiddleware / requireAdmin) の割り当て
controllers/*.ts  → asyncHandler でラップし、validateRequest で zod 検証してから service を呼ぶ。HTTP の入出力のみ担当
services/*.ts     → ビジネスロジック
dataAccessor/dbAccessor/*.ts → Prisma を触る唯一の層 (Quest / User / Review など)
```

- **入力検証は `apps/backend/src/schemas/api.ts` の zod schema が single source of truth。** controller に手書きの `if` を足さず、schema を追加して `validateRequest(req, { body, params, query })` で使う。同じ schema から `src/openapi/document.ts` が OpenAPI を生成する (`GET /api/openapi.json`, Swagger UI: `/api/docs`)。
- **エラーは `utils/appError.ts` の `AppError` / `badRequest` / `notFound` / `unauthorized` / `forbidden` を throw する。** `asyncHandler` が捕捉し、末尾の `errorHandler` ミドルウェアが JSON レスポンス化する。個々の controller で try/catch や res.status は書かない。
- **認証**: `authMiddleware` が `Authorization: Bearer <Firebase IDトークン>` を検証して `req.user` に付与。`requireAdmin` が DB 上の `role === ROLES.ADMIN` を確認 (`constants/roles.ts`)。Firebase Admin は `config/firebase.ts` の副作用 import で初期化。
- ログは pino (`config/logger.ts`)。`app.ts` がミドルウェア順・CORS・ルーティングを集約。

### frontend (Next.js App Router + Atomic Design)

- `src/app/` = App Router のページ (`login` / `signUp` / `quests/[id]` / `mypage` / `admin/dashboard`)。UI は `components/` を **atoms → molecules → organisms → pages** の atomic design で構成。
- **API 呼び出しは必ず `src/services/httpClient.ts` 経由。** `apiClient` (公開 API) と `authenticatedApiClient` (Firebase IDトークンを自動付与) を使い分ける。fetch を直接書かない。ドメイン別ラッパーは `services/quest.ts` などにある。
- 認証状態は `hooks/useAuth.ts`、Firebase client 初期化は `services/firebase.ts`。

### packages/types

`@quest-board/types` を frontend / backend 双方が import。クエストのステータス・難易度・種別などの enum とラベル、共有型を集約。**両側で使う定数・型はここに置き、二重定義しない。**

## Biome について

lint/format コマンドはすべて `node scripts/run-biome.cjs` 経由で呼ばれる。これは macOS/Linux/Windows でプラットフォーム固有の Biome バイナリを解決するためのラッパーで、`biome` を直接呼ぶと環境によって失敗する。`pnpm lint` / `pnpm lint:fix` を使えばラッパーが自動で使われる。

## Git / Branch

- issue 対応は原則 `git worktree` で分離。作業ブランチは 1 issue / 1 task ごとに切る。

  ```bash
  git worktree add .claude/worktrees/<name> -b <branch-name>
  # 作業後
  git worktree remove .claude/worktrees/<name>
  ```

- **ブランチ命名**: `feat/issue-<番号>-<概要>` / `fix/<概要>` / `docs/<概要>` / `chore/<概要>` / `refactor/<概要>`
- **`main` への直接 push は pre-push フックでブロックされる。** feature ブランチから PR を出す。
- push 前に upstream との差分と競合有無を確認する。

## コミット規約

- Claude が行ったコミットは本文に `(by Claude)` と明記する。

  ```
  fix: バグの説明

  詳細説明（必要な場合）

  (by Claude)
  ```

- コミット著者はリポジトリの `git config user.name` / `git config user.email` をそのまま使う。

## フックの責務

- **pre-commit**: Biome format/lint (差分)。frontend に差分があれば `frontend test:precommit` も実行。軽い検証に限定。
- **pre-push**: `main` 直 push のブロック。重いローカル検証はここに寄せる。
- **CI**: リポジトリ全体の lint / typecheck / build / DB を含む検証を最終保証とする。

## 進め方の規約

- 返答・レビューコメント・PR 本文・コミット本文は日本語。
- まず既存実装と既存差分を確認し、前提を決め打ちしない。**ユーザーの未コミット差分は勝手に戻さない。**
- 破壊的コマンドは明示的な依頼・承認がある場合のみ実行。
- 変更は必要最小限にとどめ、unrelated な修正を混ぜない。frontend / backend / docs をまたぐ変更は理由を説明する。
- 実装後は可能な範囲でテスト・型チェック・ビルドを実行し、単体テストを追加する (カバレッジ 80% 以上が目標)。実行できなかった検証・既存不具合による失敗は明記する。

## Issue / PR / Review

- **Issue**: `Summary` `Background` `Scope` `Acceptance Criteria` を必須。実装しない範囲は `Out of Scope` / `Notes`、確認手順は `Verification` に記す。
- **PR**: `Summary` と `Verification` を必須。影響が広い場合は `Risks` / `Notes`。hook や CI の既存失敗は今回変更と切り分けて書く。
- **Review**: findings first。severity を意識し根拠ファイルを示す。問題がなければ「追加指摘なし」と明示。推測はその旨を明記する。
