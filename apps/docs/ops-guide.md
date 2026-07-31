# 運用手順書（Xserver VPS）

本ページはクエスト掲示板を **Xserver VPS（Ubuntu）** へデプロイ・運用するための手順です。

## 前提条件

| 項目 | 内容 |
|---|---|
| OS | Ubuntu 22.04 LTS |
| Node.js | v22.x |
| パッケージマネージャ | pnpm |
| プロセス管理 | PM2 |
| Web サーバー | Nginx（リバースプロキシ） |
| DB | MySQL 8.0 |
| SSL | Let's Encrypt（Certbot） |

ドメインは事前に Xserver の DNS 設定でサーバー IP を向けておいてください。
Google Cloud Console で OAuth 2.0 クライアント ID を作成し、承認済みの JavaScript 生成元に `https://your-domain.com` を登録しておきます。

---

## 1. 初回サーバーセットアップ

SSH でサーバーに接続後、以下の順で進めます。

### 1-1. パッケージ更新

```bash
sudo apt update && sudo apt upgrade -y
```

### 1-2. Node.js v22 インストール

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v22.x.x が表示されることを確認
```

### 1-3. pnpm インストール

```bash
npm install -g pnpm
pnpm -v
```

### 1-4. PM2 インストール

```bash
npm install -g pm2
```

### 1-5. MySQL 8.0 インストール

```bash
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql

# 初期セキュリティ設定
sudo mysql_secure_installation
```

DB とユーザーを作成します。

```sql
-- MySQL に root でログイン
sudo mysql

CREATE DATABASE quest_board CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY '任意の強いパスワード';
GRANT ALL PRIVILEGES ON quest_board.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 1-6. Nginx インストール

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 1-7. Git インストール（未導入の場合）

```bash
sudo apt install -y git
```

---

## 2. アプリのデプロイ（初回）

### 2-1. リポジトリをクローン

```bash
cd /var/www
sudo git clone https://github.com/<org>/quest-board-app.git
sudo chown -R $USER:$USER /var/www/quest-board-app
cd /var/www/quest-board-app
```

### 2-2. 環境変数を設定

```bash
cp apps/backend/.env.local.example apps/backend/.env.local
cp apps/frontend/.env.local.example apps/frontend/.env.local
```

`apps/backend/.env.local` を編集します。

```ini
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

DATABASE_URL=mysql://app_user:パスワード@localhost:3306/quest_board
# SHADOW_DATABASE_URL は本番では使用しない（migrate deploy のみ使用）

PORT=3001
NODE_ENV=production
FRONTEND_BASE_URL=https://your-domain.com
```

`apps/frontend/.env.local` を編集します。

```ini
# Google OAuth 2.0
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api
PORT=3000
```

`GOOGLE_CLIENT_ID` と `NEXT_PUBLIC_GOOGLE_CLIENT_ID` は同じ OAuth 2.0 クライアント ID を指定します。

### 2-3. 依存関係インストール

```bash
pnpm install --frozen-lockfile
```

### 2-4. DB マイグレーション

```bash
pnpm db:generate
pnpm --filter backend exec prisma migrate deploy
```

> `migrate deploy` は本番用コマンドです。`db:push` は使わないでください。

必要であればシードデータを投入します（初回のみ）。

```bash
pnpm --filter backend seed
```

### 2-5. ビルド

```bash
pnpm build
```

`apps/frontend/.next/` と `apps/backend/dist/` が生成されます。

### 2-6. PM2 でプロセス起動

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # 表示されたコマンドを実行してサーバー再起動時に自動起動
```

`ecosystem.config.cjs` はリポジトリルートに以下の内容で作成します（初回のみ）。

```js
module.exports = {
  apps: [
    {
      name: "quest-frontend",
      cwd: "/var/www/quest-board-app/apps/frontend",
      script: "node_modules/.bin/next",
      args: "start",
      env: { NODE_ENV: "production", PORT: 3000 },
    },
    {
      name: "quest-backend",
      cwd: "/var/www/quest-board-app/apps/backend",
      script: "dist/app.js",
      env: { NODE_ENV: "production", PORT: 3001 },
    },
  ],
};
```

---

## 3. Nginx 設定

`/etc/nginx/sites-available/quest-board` を作成します。

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # フロントエンド（Next.js）
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # バックエンド API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

有効化して再起動します。

```bash
sudo ln -s /etc/nginx/sites-available/quest-board /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. SSL 設定（Let's Encrypt）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

自動更新の確認をします。

```bash
sudo certbot renew --dry-run
```

---

## 5. アップデート手順（定常運用）

コードの変更を本番に反映する場合の手順です。

```bash
cd /var/www/quest-board-app

# 最新を取得
git pull origin main

# 依存関係の更新（lock ファイルが変わった場合）
pnpm install --frozen-lockfile

# DB マイグレーション（スキーマ変更がある場合）
pnpm db:generate
pnpm --filter backend exec prisma migrate deploy

# ビルド
pnpm build

# プロセスを再起動
pm2 reload ecosystem.config.cjs
```

---

## 6. ログ確認

```bash
# アプリログ
pm2 logs quest-frontend
pm2 logs quest-backend

# 直近 200 行
pm2 logs --lines 200

# Nginx ログ
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 7. プロセス管理

```bash
pm2 list                        # 起動中のプロセス一覧
pm2 restart quest-backend       # バックエンドのみ再起動
pm2 stop quest-frontend         # 停止
pm2 delete quest-frontend       # 削除
```

---

## 8. MySQL バックアップ

```bash
# ダンプ（毎日 cron で実行する場合は /etc/cron.d/ に設定）
mysqldump -u app_user -p quest_board > /var/backups/quest_board_$(date +%Y%m%d).sql

# リストア
mysql -u app_user -p quest_board < /var/backups/quest_board_20260730.sql
```

---

## 9. トラブルシューティング

### アプリが起動しない

```bash
pm2 logs quest-backend --lines 50   # エラーログを確認
```

よくある原因：

- `.env.local` の値が空のまま
- `pnpm build` が完了していない（`dist/app.js` が存在しない）
- MySQL が起動していない → `sudo systemctl status mysql`

### 502 Bad Gateway

Nginx は起動しているがアプリが落ちている場合に発生します。

```bash
pm2 list          # ステータスが errored や stopped になっていないか確認
pm2 restart all
```

### DB 接続エラー

```bash
# MySQL の状態確認
sudo systemctl status mysql

# 接続テスト
mysql -u app_user -p quest_board -e "SELECT 1"
```

`DATABASE_URL` のパスワードや DB 名が正しいか確認してください。

### SSL 証明書の有効期限切れ

```bash
sudo certbot renew
sudo systemctl reload nginx
```
