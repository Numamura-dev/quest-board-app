# クエスト掲示板 開発ガイド

クエスト掲示板は、ユーザーがクエストを投稿し、参加し、レビューできる Web アプリです。モノレポ構成で、Next.js フロントエンド、Express API、Prisma + MySQL、VitePress ドキュメントサイトを管理しています。

## 目次

- [プロダクト概要](#プロダクト概要)
- [リポジトリ構成](#リポジトリ構成)
- [前提条件](#前提条件)
- [クイックスタート](#クイックスタート)
- [環境変数](#環境変数)
- [データベース](#データベース)
- [起動方法](#起動方法)
- [検証コマンド](#検証コマンド)
- [E2E テスト](#e2e-テスト)
- [ドキュメントサイト](#ドキュメントサイト)
- [API ドキュメント](#api-ドキュメント)
- [トラブルシューティング](#トラブルシューティング)

## プロダクト概要

主なユースケース:

- クエスト一覧の閲覧
- クエスト詳細の確認
- クエストの作成、編集、削除
- クエストへの参加
- レビュー投稿
- マイページでの自分の活動確認
- 管理者によるユーザー管理

主要なデータフロー:

```text
ブラウザ
  -> apps/frontend (Next.js)
  -> apps/backend (Express API)
  -> Prisma
  -> MySQL

認証:
Firebase Authentication
  -> frontend でログイン状態を管理
  -> backend で Firebase ID token を検証
```

## リポジトリ構成

```text
repo
├─ apps
│  ├─ frontend   # UI、画面、hooks、API client
│  ├─ backend    # API、service、Prisma、認証
│  ├─ docs       # VitePress ドキュメントサイト
│  └─ e2e        # Playwright E2E テスト
├─ packages
│  └─ types      # frontend / backend 共有型
├─ docs          # AI / 開発運用の正本ドキュメント
├─ prompt        # 補助テンプレート
├─ AGENTS.md     # AI 共通ルールの正本
├─ CLAUDE.md     # Claude Code 向け互換エントリ
└─ README.md     # セットアップと全体像
```

変更内容ごとの主な確認先:

| 変更内容 | 主な確認先 |
| --- | --- |
| 画面、導線、表示 | `apps/frontend/src/app`, `apps/frontend/src/components` |
| API 呼び出し | `apps/frontend/src/services` |
| 認証 | `apps/frontend/src/hooks`, `apps/frontend/src/services/firebase.ts`, `apps/backend/src/middlewares/auth.middleware.ts` |
| API 追加、修正 | `apps/backend/src/routes`, `apps/backend/src/controllers`, `apps/backend/src/services` |
| DB 変更 | `apps/backend/prisma/schema.prisma`, `apps/backend/src/dataAccessor` |
| テスト | `apps/frontend/src/__tests__`, `apps/backend/src/__tests__`, `apps/e2e/tests` |
| ルール、設計 | `AGENTS.md`, `docs/architecture.md`, `docs/ai-execution.md` |

AI エージェントが最初に読む文書は `README.md`、`AGENTS.md`、`docs/architecture.md`、`docs/ai-execution.md`、`prompt/agent.md`、関連コード / 関連テストです。`CLAUDE.md` は Claude Code 向けの互換エントリです。

## 前提条件

以下をインストールしてください。

- Node.js v22.x
- pnpm v10.x
- Docker / Docker Compose
- Firebase プロジェクト

確認コマンド:

```bash
node --version
pnpm --version
docker --version
docker compose version
```

pnpm が未インストールの場合:

```bash
npm install -g pnpm
```

## クイックスタート

初回は次の順で進めると、依存関係、DB、アプリ起動まで確認できます。

```bash
git clone https://github.com/Numamura-dev/quest-board-app.git
cd quest-board-app

pnpm install

cp apps/frontend/.env.local.example apps/frontend/.env.local
cp apps/backend/.env.local.example apps/backend/.env.local

docker compose up -d
pnpm db:generate
pnpm db:push
pnpm --filter backend seed

pnpm dev
```

起動後の確認先:

| サービス | URL |
| --- | --- |
| フロントエンド | `http://localhost:3000` |
| バックエンド API | `http://localhost:3001/api/openapi.json` |
| Swagger UI | `http://localhost:3001/api/docs` |
| MySQL | `localhost:3306` |

`pnpm dev` は workspace 内の `dev` script を持つ package を並列起動します。frontend / backend は起動対象です。docs を確認したい場合は、別途 `pnpm dev:docs` を起動して `http://localhost:5173` を開いてください。

## 環境変数

`.env` / `.env.local` などの実ファイルは Git 管理しません。実値を共有してしまった場合は、秘密情報のローテーションを検討してください。

### フロントエンド

```bash
cp apps/frontend/.env.local.example apps/frontend/.env.local
```

`apps/frontend/.env.local` に Firebase Web アプリの設定値を入れます。

| 変数名 | 説明 |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase コンソール > プロジェクトの設定 > ウェブアプリ |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_API_BASE_URL` | backend URL。ローカル既定値は `http://localhost:3001` |
| `PORT` | frontend port。ローカル既定値は `3000` |

### バックエンド

```bash
cp apps/backend/.env.local.example apps/backend/.env.local
```

`apps/backend/.env.local.example` は `docker-compose.yml` の既定値と揃っています。通常のローカル開発では、そのままコピーした DB 接続設定で動きます。

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Prisma / MySQL
DATABASE_URL=mysql://app_user:app_password@localhost:3306/your_project_db
SHADOW_DATABASE_URL=mysql://root:rootpassword@localhost:3306/shadow_your_project_db
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=your_project_db
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password

# Backend
PORT=3001
NODE_ENV=development
FRONTEND_BASE_URL=http://localhost:3000
```

`SHADOW_DATABASE_URL` は Prisma が `db push` 時の差分検出に使う一時 DB です。shadow DB を自動作成できるよう、ローカルでは root ユーザーを使います。

Firebase 認証を含む動作確認には Firebase Admin SDK の値が必要です。未設定でも一部の build/test は進みますが、認証 API の実運用確認はできません。

## データベース

MySQL を起動します。

```bash
docker compose up -d
docker compose ps
```

Prisma Client を生成し、schema を DB に反映します。

```bash
pnpm db:generate
pnpm db:push
```

初期データが必要な場合:

```bash
pnpm --filter backend seed
```

migration を確認・適用する場合:

```bash
pnpm --filter backend prisma:migrate:deploy
```

ローカル開発の初回構築は `pnpm db:push` が簡単です。CI や本番相当の環境では、履歴管理された migration を使う方針に寄せてください。

## 起動方法

全体起動:

```bash
pnpm dev
```

個別起動:

```bash
pnpm dev:frontend
pnpm dev:backend
pnpm dev:docs
```

production build 後の backend 起動確認:

```bash
pnpm build
PORT=3001 node apps/backend/dist/app.js
```

backend は `DATABASE_URL` が未設定だと起動時に停止します。`apps/backend/.env.local` を作成してから起動してください。

## 検証コマンド

CI の主要保証は frontend test、backend test、security audit、frontend/backend/docs build です。ローカルでは次を目安に確認してください。

```bash
pnpm db:generate
pnpm --filter frontend test
pnpm --filter backend test
pnpm --filter backend typecheck
pnpm build
```

共有型 package `@quest-board/types` は `dist` へ build してから frontend/backend が参照します。通常は frontend/backend の `pretest` / `prebuild` / `predev` が自動で `pnpm --filter @quest-board/types run build` を実行します。手動で確認する場合は次を使います。

```bash
pnpm build:types
```

Biome 関連:

```bash
pnpm format:check
pnpm lint
pnpm lint:fix
pnpm precommit:biome
```

`pnpm lint` は repo 全体を対象にする重い静的チェックです。既存指摘が残っている場合は、今回差分の対象ファイルに絞った `pnpm exec biome check <files>` と CI 結果を併用して切り分けてください。

## E2E テスト

E2E を実行する場合のみ、環境変数を作成します。

```bash
cp apps/e2e/.env.example apps/e2e/.env
```

| 変数名 | 説明 |
| --- | --- |
| `FRONTEND_BASE_URL` | Playwright が開く frontend URL。既定値は `http://localhost:3000` |
| `API_BASE_URL` | API テスト用 backend URL。既定値は `http://localhost:3001` |

初回は Playwright browser をインストールします。

```bash
pnpm --filter e2e exec playwright install
```

E2E 実行前に DB、backend、frontend を起動してください。`pnpm dev` は起動し続けるため、E2E は別ターミナルで実行します。

```bash
docker compose up -d
pnpm db:generate
pnpm db:push
pnpm --filter backend seed
pnpm dev
```

別ターミナル:

```bash
pnpm --filter e2e test
```

## ドキュメントサイト

VitePress サイトは `apps/docs/` にあります。

```bash
pnpm dev:docs
pnpm build:docs
```

主なコンテンツ: スタイルガイド / コーディング規約 / API 一覧 / ディレクトリ構成 / 要件定義書 / テーブル定義書 / レビュー規約 / ログ設計書

## API ドキュメント

backend 起動後に確認できます。

- Swagger UI: `http://localhost:3001/api/docs`
- OpenAPI JSON: `http://localhost:3001/api/openapi.json`

request schema は `apps/backend/src/schemas/api.ts` の Zod schema を source of truth とし、OpenAPI ドキュメントも同じ schema から生成します。新しい API を追加する場合は controller に手書き validation を足すのではなく、schema を追加して `validateRequest` から利用してください。

## Firebase のセットアップ

1. Firebase コンソールでプロジェクトを作成
2. Authentication を有効化し、メール / パスワードなどのログイン方法を設定
3. ウェブアプリを追加し、設定値を `apps/frontend/.env.local` に記入
4. サービスアカウントの秘密鍵を生成し、`apps/backend/.env.local` に記入

Firebase Admin SDK の秘密鍵は Firebase コンソール > プロジェクトの設定 > サービスアカウント > 新しい秘密鍵の生成 から取得できます。

## トラブルシューティング

### MySQL に接続できない

```bash
docker compose ps
docker compose logs mysql
```

`DATABASE_URL` が `docker-compose.yml` の `MYSQL_DATABASE` / `MYSQL_USER` / `MYSQL_PASSWORD` と一致しているか確認してください。

### `pnpm db:push` で shadow DB 権限エラーが出る

`apps/backend/.env.local` の `SHADOW_DATABASE_URL` を root ユーザーにしてください。

```env
SHADOW_DATABASE_URL=mysql://root:rootpassword@localhost:3306/shadow_your_project_db
```

### Prisma Client の型が見つからない

```bash
pnpm db:generate
```

### `@quest-board/types` の entry が解決できない

```bash
pnpm build:types
```

通常は frontend/backend の test/build/dev 前に自動実行されます。clean checkout 直後に個別ツールを直接起動した場合は、手動で実行してください。

### backend が `DATABASE_URL が未設定です` で起動しない

`apps/backend/.env.local` を作成してください。

```bash
cp apps/backend/.env.local.example apps/backend/.env.local
```

### ポートが使用中

`.env.local` の `PORT` を変更するか、競合しているプロセスを終了してください。

### 最小 smoke test

backend が起動している状態で OpenAPI JSON が 200 を返すことを確認します。

```bash
curl -i http://localhost:3001/api/openapi.json
```
