# トラブルシューティング

ローカル起動、Firebase 認証、DB、スクリーンショット生成で詰まりやすい問題の確認手順です。

## `DATABASE_URL` が未設定

症状:

- Prisma が `Environment variable not found: DATABASE_URL` を出す
- `pnpm docs:screenshots` の fixture 作成で失敗する

確認:

```bash
test -f apps/backend/.env.local && echo ok
```

対応:

```bash
cp apps/backend/.env.local.example apps/backend/.env.local
```

`DATABASE_URL` を MySQL の接続情報に合わせて設定します。

## Firebase Admin SDK の秘密鍵エラー

症状:

- backend 起動時に `Invalid PEM formatted message`
- backend 起動時に Firebase Admin SDK の初期化に失敗する

対応:

- Firebase コンソールの「サービス アカウント」から新しい秘密鍵 JSON を取得する
- `FIREBASE_PRIVATE_KEY` をダブルクォートで囲む
- JSON 内の `\n` を消さない

```ini
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

起動ログに次が出れば Admin SDK は初期化できています。

```text
[firebase] Firebase Admin SDK をサービスアカウントで初期化しました
```

## `auth/api-key-not-valid`

症状:

- ログイン時に `Firebase: Error (auth/api-key-not-valid...)`

確認:

- `apps/frontend/.env.local` の `NEXT_PUBLIC_FIREBASE_API_KEY` が Firebase Web アプリの `apiKey` と一致しているか
- frontend を env 変更後に再起動したか
- ブラウザのアクセス先が `http://localhost:3000` か

注意:

Firebase API key に referrer 制限がある場合、`http://127.0.0.1:3000` では失敗し、`http://localhost:3000` では成功することがあります。

## `INVALID_LOGIN_CREDENTIALS`

症状:

- Firebase REST ログイン、または画面ログインで `INVALID_LOGIN_CREDENTIALS`

対応:

- Firebase Console > Authentication > Users に対象メールが存在するか確認する
- パスワードを再設定する
- E2E / スクショ用のユーザーと `apps/e2e/tests/manual-screenshots.spec.ts` の固定ユーザーが一致しているか確認する

現在のスクリーンショット用ユーザー:

| 用途 | メール | パスワード |
| --- | --- | --- |
| 一般ユーザー | `manager@test.com` | `password123` |
| 管理者 | `master@test.com` | `password123` |

## `User not found`

症状:

- Firebase ログインは成功するが、backend の `/api/users/me` が 404
- backend ログに `User not found`

原因:

Firebase Auth の UID と DB の `users.firebase_uid` が一致していません。

確認:

```bash
pnpm --filter backend seed
```

それでも直らない場合は、Firebase Authentication の UID を確認し、DB の `users.firebase_uid` と合わせます。スクリーンショット spec は実ログインから UID を取得して DB を upsert するため、`pnpm docs:screenshots` 実行時は自動で補正されます。

## 3000 / 3001 ポートが使用中

症状:

- frontend が 3002 など別ポートで起動する
- backend が起動できない

確認:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:3001 -sTCP:LISTEN
```

対応:

- 既存プロセスを止める
- `.env.local` の `PORT` を変更する

スクリーンショット生成は `http://localhost:3000` と `http://localhost:3001` を前提にしています。別ポートで起動した場合は `apps/e2e/.env` の URL も合わせます。

## Playwright の Chromium が起動しない

症状:

- `pnpm docs:screenshots` で `browserType.launch` が失敗する
- macOS で `Crashpad/settings.dat: Operation not permitted` が出る

対応:

- 通常のターミナルから実行する
- Playwright のブラウザを再インストールする

```bash
pnpm --filter e2e exec playwright install chromium
```

Codex の sandbox 環境では Chromium が起動できない場合があります。その場合は、接続済みの Playwright ブラウザ操作ツールから `localhost` にアクセスして、`apps/docs/public/manual/*.png` に直接保存する代替手順を使います。

## スクリーンショット画像が VitePress に出ない

確認:

```bash
find apps/docs/public/manual -maxdepth 1 -type f -name '*.png' | sort
pnpm build:docs
```

本文の参照は `/manual/*.png` です。実ファイルは `apps/docs/public/manual/*.png` に置きます。
