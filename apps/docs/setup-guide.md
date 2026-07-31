# 環境構築・起動

このページはローカルで frontend、backend、docs を起動するための手順です。秘密情報を含む `.env` / `.env.local` は Git 管理しません。

## 必要なもの

- Node.js
- pnpm
- Docker / Docker Compose
- Google アカウント（個人または組織アカウント）
- Google Cloud Console へのアクセス権

## 初回セットアップ

```bash
pnpm install
cp apps/frontend/.env.local.example apps/frontend/.env.local
cp apps/backend/.env.local.example apps/backend/.env.local
cp apps/e2e/.env.example apps/e2e/.env
```

## Google Cloud Console で OAuth クライアント ID を取得する

認証に Google OAuth 2.0 を使用します。Firebase コンソールは不要です。Google Cloud Console で OAuth 2.0 クライアント ID を発行します。

> スクリーンショットは `apps/docs/public/screenshots/google-oauth-setup/` に保存してあります。

### 1. プロジェクトを作成または選択する

1. [Google Cloud Console](https://console.cloud.google.com) にアクセスする
2. 画面上部のプロジェクト選択ドロップダウンから「新しいプロジェクト」を選択する
3. プロジェクト名を入力して「作成」をクリックする（既存プロジェクトを使う場合は選択するだけで OK）

### 2. OAuth 同意画面を設定する

1. 左メニューから「APIとサービス」→「OAuth 同意画面」を開く
2. User Type を **外部** または **内部**（組織アカウントの場合）で選択して「作成」をクリックする
3. 必須項目を入力する
   - アプリ名（例: `Quest Board`）
   - ユーザーサポートメール（自分のメールアドレス）
   - デベロッパーの連絡先情報（自分のメールアドレス）
4. 「保存して次へ」をクリックする（スコープ・テストユーザーの追加は不要）
5. 最後の「概要」画面で確認して完了

### 3. OAuth 2.0 クライアント ID を作成する

1. 左メニューから「APIとサービス」→「認証情報」を開く
2. 「認証情報を作成」→「OAuth 2.0 クライアント ID」をクリックする
3. アプリケーションの種類で **ウェブアプリケーション** を選択する
4. 名前を入力する（例: `Quest Board Web`）
5. 「承認済みの JavaScript 生成元」に以下を追加する
   ```
   http://localhost:3000
   ```
6. 「承認済みのリダイレクト URI」に以下を追加する
   ```
   http://localhost:3000
   ```
7. 「作成」をクリックする
8. 表示された **クライアント ID**（`xxx.apps.googleusercontent.com` の形式）をコピーする

::: warning クライアント シークレットは不要
このアプリは Google Identity Services（フロントエンド向け OAuth）を使用するため、クライアント シークレットは使いません。クライアント ID だけコピーしてください。
:::

## 環境変数を設定する

### フロントエンド（`apps/frontend/.env.local`）

```ini
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### バックエンド（`apps/backend/.env.local`）

```ini
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
DATABASE_URL=mysql://root:password@localhost:3306/quest_board
SHADOW_DATABASE_URL=mysql://root:password@localhost:3306/quest_board_shadow
```

`DATABASE_URL` と `SHADOW_DATABASE_URL` の値は `docker-compose.yml` のデフォルト設定に合わせます。

## DB セットアップ

```bash
docker compose up -d        # MySQL 起動
docker compose ps           # 起動確認（State が running になるまで待つ）
pnpm db:generate            # Prisma クライアント生成
pnpm db:push                # スキーマを DB へ反映
pnpm --filter backend seed  # シードデータ投入
```

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

## ログイン確認

1. `http://localhost:3000/login` にアクセスする
2. 「Google でログイン」ボタンが表示されることを確認する
3. Google アカウントでログインする
4. 初回ログイン時に MySQL の `users` テーブルへレコードが自動作成される
5. ログアウト → 再ログインで同じレコードが使われること（upsert）を確認する

## 操作マニュアルのスクリーンショット更新

通常は次を実行します。

```bash
pnpm docs:screenshots
```

前提:

- frontend は `http://localhost:3000`
- backend は `http://localhost:3001`
- MySQL と seed 済み DB が利用可能
- Google アカウントでログイン可能
- `apps/e2e/.env` が作成済み

生成先は `apps/docs/public/manual/*.png` です。

## 検証

```bash
pnpm build:docs
pnpm --filter frontend test
pnpm --filter backend typecheck
pnpm --filter backend test
```

変更範囲に応じて必要なものを実行します。スクリーンショットだけを更新した場合でも、少なくとも `pnpm build:docs` で VitePress の参照切れがないことを確認します。
