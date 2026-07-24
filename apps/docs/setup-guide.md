# 環境構築・起動

このページはローカルで frontend、backend、docs を起動するための手順です。秘密情報を含む `.env` / `.env.local` は Git 管理しません。

## 必要なもの

- Node.js
- pnpm
- Docker / Docker Compose
- Firebase プロジェクト
- Firebase Authentication のメール/パスワードログイン

## 初回セットアップ

```bash
pnpm install
cp apps/frontend/.env.local.example apps/frontend/.env.local
cp apps/backend/.env.local.example apps/backend/.env.local
cp apps/e2e/.env.example apps/e2e/.env
```

## Firebase 設定

### フロントエンド

Firebase コンソールで、対象プロジェクトの「プロジェクトの設定」>「全般」>「マイアプリ」> Web アプリの「SDK の設定と構成」を開きます。

`firebaseConfig` の値を `apps/frontend/.env.local` に入れます。

| firebaseConfig | `.env.local` |
| --- | --- |
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

`NEXT_PUBLIC_API_BASE_URL` は通常 `http://localhost:3001` のままで構いません。

### バックエンド

Firebase コンソールで「プロジェクトの設定」>「サービス アカウント」>「新しい秘密鍵の生成」から JSON を取得します。

JSON の値を `apps/backend/.env.local` に入れます。

| JSON | `.env.local` |
| --- | --- |
| `project_id` | `FIREBASE_PROJECT_ID` |
| `client_email` | `FIREBASE_CLIENT_EMAIL` |
| `private_key` | `FIREBASE_PRIVATE_KEY` |

`FIREBASE_PRIVATE_KEY` はダブルクォートで囲み、改行は `\n` のまま保持します。

```ini
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## DB セットアップ

```bash
docker compose up -d
docker compose ps
pnpm db:generate
pnpm db:push
pnpm --filter backend seed
```

`apps/backend/.env.local` の `DATABASE_URL` は `docker-compose.yml` の MySQL 設定と合わせます。

## 起動

全サービスを起動します。

```bash
pnpm dev
```

個別に確認する場合は次を使います。

```bash
pnpm dev:frontend
pnpm dev:backend
pnpm dev:docs
```

確認先:

| 対象 | URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:3001/api/quests` |
| Swagger UI | `http://localhost:3001/api/docs` |
| Docs | `http://localhost:5173` |

## 操作マニュアルのスクリーンショット更新

通常は次を実行します。

```bash
pnpm docs:screenshots
```

前提:

- frontend は `http://localhost:3000`
- backend は `http://localhost:3001`
- MySQL と seed 済み DB が利用可能
- Firebase のテストユーザーでログイン可能
- `apps/e2e/.env` が作成済み

生成先は `apps/docs/public/manual/*.png` です。

Firebase API key の referrer 制限がある場合、ブラウザのアクセス先は `127.0.0.1` ではなく `localhost` を使ってください。

## 検証

```bash
pnpm build:docs
pnpm --filter frontend test
pnpm --filter backend typecheck
pnpm --filter backend test
```

変更範囲に応じて必要なものを実行します。スクリーンショットだけを更新した場合でも、少なくとも `pnpm build:docs` で VitePress の参照切れがないことを確認します。
