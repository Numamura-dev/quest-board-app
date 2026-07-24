# クエスト掲示板 開発ガイド

このプロジェクトは、モノレポ構成（frontend / backend / docs）で構築されたクエスト投稿・参加アプリです。

## プロダクト概要

クエスト掲示板は、ユーザーがクエストを投稿し、参加し、レビューできるアプリです。

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
  -> backend でトークンを検証
```

## リポジトリ全体像

AI エージェントはまず次の単位でリポジトリを見ると全体像を把握しやすいです。

```text
repo
├─ apps
│  ├─ frontend   # UI、画面、hooks、API client
│  ├─ backend    # API、service、Prisma、認証
│  ├─ docs       # 開発ドキュメントサイト
│  └─ e2e        # Playwright E2E テスト
├─ packages
│  └─ types      # 共有型
├─ docs          # AI / 開発運用の正本ドキュメント
├─ prompt        # 補助テンプレート
├─ AGENTS.md     # AI 共通ルールの正本
├─ CLAUDE.md     # 互換用の案内
└─ README.md     # セットアップと全体像
```

## 変更箇所の当たり方

変更内容ごとの主な確認先:

| 変更内容 | 主な確認先 |
|--------|------|
| 画面、導線、表示 | `apps/frontend/src/app`, `apps/frontend/src/components` |
| API 呼び出し | `apps/frontend/src/services` |
| 認証 | `apps/frontend/src/hooks`, `apps/frontend/src/services/firebase.ts`, `apps/backend/src/middlewares/auth.middleware.ts` |
| API 追加、修正 | `apps/backend/src/routes`, `apps/backend/src/controllers`, `apps/backend/src/services` |
| DB 変更 | `apps/backend/prisma/schema.prisma`, `apps/backend/src/dataAccessor` |
| テスト | `apps/frontend/src/__tests__`, `apps/backend/src/__tests__`, `apps/e2e/tests` |
| ルール、設計 | `AGENTS.md`, `docs/architecture.md`, `docs/ai-execution.md` |

## AI向けドキュメント導線

AI が最初に読むべき文書セットは次の 6 つです。

1. `README.md`
2. `AGENTS.md`
3. `docs/architecture.md`
4. `docs/ai-execution.md`
5. `prompt/agent.md`
6. 関連コード / 関連テスト

役割は次のとおりです。

- `README.md`: セットアップ、開発コマンド、リポジトリ全体像
- `AGENTS.md`: AI エージェント共通ルールの正本
- `docs/architecture.md`: repo 構造、レイヤー責務、変更判断の基準
- `docs/ai-execution.md`: 調査、実装、検証、報告の進め方
- `prompt/agent.md`: 他エージェントに渡す短い実行テンプレート

補助テンプレートは source-of-truth ではありません。

- `prompt/create_issue.md`: 改善 issue を新規起票するときの補助テンプレート
- `prompt/modify_issue.md`: 既存 issue を整理、修正するときの補助テンプレート
- `CLAUDE.md`: `AGENTS.md` への互換エントリ

---

## 技術スタック

| レイヤー | 技術 |
|--------|------|
| フロントエンド | Next.js 15, React 19, Tailwind CSS |
| バックエンド | Express.js, TypeScript |
| 認証 | Firebase Authentication |
| データベース | MySQL 8.0 (Docker) + Prisma ORM |
| パッケージ管理 | pnpm (Workspace) |
| Linter | Biome |

---

## 前提条件

以下をインストールしてください。

- **Node.js** v22.x（`node --version` で確認）
- **pnpm** v10.x（`pnpm --version` で確認）
- **Docker** / **Docker Compose**（MySQLの起動に使用）
- **Firebase プロジェクト**（認証機能に使用）

```bash
# pnpm が未インストールの場合
npm install -g pnpm
```

---

## セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/Numamura-dev/quest-board-app.git
cd quest-board-app
```

### 2. 依存パッケージをインストール

```bash
pnpm install
```

### 3. 環境変数を設定

#### フロントエンド

```bash
cp apps/frontend/.env.local.example apps/frontend/.env.local
```

`apps/frontend/.env.local` を開き、Firebase プロジェクトの設定値を入力してください。

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase コンソール > プロジェクトの設定 > ウェブアプリ |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | 同上 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | 同上 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | 同上 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 同上 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 同上 |
| `NEXT_PUBLIC_API_BASE_URL` | バックエンドのURL（デフォルト: `http://localhost:3001`） |
| `PORT` | フロントエンドのポート番号（デフォルト: `3000`） |

#### バックエンド

```bash
cp apps/backend/.env.local.example apps/backend/.env.local
```

`apps/backend/.env.local` を開き、各項目を設定してください。
```env
# Firebase Admin SDK（Firebase コンソール > プロジェクトの設定 > サービスアカウント から取得）
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Prisma / MySQL（docker-compose.yml のデフォルト値に合わせて設定）
DATABASE_URL=mysql://app_user:app_password@localhost:3306/your_project_db
SHADOW_DATABASE_URL=mysql://app_user:app_password@localhost:3306/your_project_shadow_db
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=your_project_db
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password

# Backend
PORT=3001
NODE_ENV=development
FRONTEND_BASE_URL=http://localhost:3000
```

#### E2E（任意）

E2E テストを実行する場合のみ、example から `.env` を作成してください。

```bash
cp apps/e2e/.env.example apps/e2e/.env
```

| 変数名 | 説明 |
|--------|------|
| `FRONTEND_BASE_URL` | Playwright が開くフロントエンド URL（デフォルト: `http://localhost:3000`） |
| `API_BASE_URL` | API テスト用のバックエンド URL（デフォルト: `http://localhost:3001`） |

> `.env` / `.env.local` などの実ファイルは Git 管理しない方針です。過去に実値を含むファイルを共有していた場合は、秘密情報のローテーションも検討してください。

> **Firebase Admin SDK の取得方法**
> Firebase コンソール > プロジェクトの設定 > サービスアカウント > 「新しい秘密鍵の生成」

### 4. MySQL を起動（Docker）

```bash
docker compose up -d
```

MySQL が起動したことを確認:

```bash
docker compose ps
```

### 5. データベースのセットアップ（Prisma）

```bash
# Prisma クライアントを生成
pnpm db:generate

# スキーマをデータベースに反映
pnpm db:push

# migration を適用する場合（任意）
pnpm --filter backend prisma:migrate:deploy
```

`pnpm dev:backend` と backend の test は `apps/backend/.env.local` を基準に環境変数を読むため、repo root と `apps/backend` のどちらから実行しても同じ `DATABASE_URL` を参照できます。

---

## アプリの起動

### 全サービスを一括起動

```bash
pnpm dev
```

### 個別起動

```bash
# フロントエンドのみ（http://localhost:3000）
pnpm dev:frontend

# バックエンドのみ（http://localhost:3001）
pnpm dev:backend

# ドキュメントのみ
pnpm dev:docs
```

---

## 利用可能なコマンド一覧

| コマンド | 説明 |
|--------|------|
| `pnpm dev` | 全サービスを開発モードで起動 |
| `pnpm build` | 全サービスをビルド |
| `pnpm lint` | Biome でコードをチェック |
| `pnpm lint:fix` | Biome で自動修正 |
| `pnpm openapi:diff-to-zod -- --base <base-openapi.json> --head <head-openapi.json> [--out <output.ts>]` | OpenAPI 差分から zod schema の叩き台を生成 |
| `pnpm db:generate` | Prisma クライアントを生成 |
| `pnpm db:push` | スキーマをDBに反映 |
| `pnpm db:studio` | Prisma Studio（DB GUI）を起動 |
| `pnpm --filter backend prisma:migrate:deploy` | backend の migration を適用 |

---

## ポート一覧

| サービス | ポート |
|--------|------|
| フロントエンド | 3000 |
| バックエンド | 3001 |
| MySQL | 3306 |

---

## API ドキュメント

バックエンド起動後、以下で OpenAPI を確認できます。

- Swagger UI: `http://localhost:3001/api/docs`
- OpenAPI JSON: `http://localhost:3001/api/openapi.json`

現在の request schema は backend の `zod` を source of truth とし、OpenAPI ドキュメントも同じ schema から生成します。新しい API を追加する場合は、controller に手書きの `if` を足すのではなく、`apps/backend/src/schemas/api.ts` に schema を追加して `validateRequest` から利用してください。

API path は REST の原則に沿って設計します。動詞を path に埋め込むより、resource と HTTP method で意味を表現してください。

例:
- `POST /api/users/create` ではなく `POST /api/users`
- `GET /api/users/all` ではなく `GET /api/users`
- `POST /api/quests/:questId/join` ではなく `POST /api/quests/:questId/participants`
- `GET /api/reviews/quest/:questId` ではなく `GET /api/quests/:questId/reviews`
- `POST /api/quests/:id/restore` のような状態遷移も、可能なら `restorations` `activations` のような resource 名で表現する

既存 OpenAPI の差分から zod schema の叩き台を作る場合は、次のコマンドを使います。

```bash
pnpm openapi:diff-to-zod -- --base <base-openapi.json> --head <head-openapi.json> [--out <output.ts>]
```

VS Code では `.vscode/extensions.json` に OpenAPI 向けの推奨拡張を追加しています。workspace を開くと推奨が表示されます。

---

## Firebase のセットアップ

1. [Firebase コンソール](https://console.firebase.google.com/) でプロジェクトを作成
2. **Authentication** を有効化し、ログイン方法を設定（メール/パスワード など）
3. **ウェブアプリ** を追加し、設定値を `apps/frontend/.env.local` に記入
4. **サービスアカウント** の秘密鍵を生成し、`apps/backend/.env.local` に記入

---

## 🗄 DB 操作

```bash
# Prisma Studio（GUIでDBを確認）
pnpm db:studio

# シードデータを投入
pnpm --filter backend seed
```

---

## トラブルシューティング

**MySQL に接続できない場合**
```bash
# コンテナの状態を確認
docker compose ps
# ログを確認
docker compose logs mysql
```

**Prisma のエラーが出る場合**
```bash
# Prisma クライアントを再生成
pnpm db:generate
```

**ポートが使用中の場合**
`.env.local` の `PORT` を変更するか、競合しているプロセスを終了してください。
