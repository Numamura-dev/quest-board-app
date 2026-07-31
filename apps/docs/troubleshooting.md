# トラブルシューティング

ローカル起動、Google OAuth 認証、DB、スクリーンショット生成で詰まりやすい問題の確認手順です。

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

## `Wrong recipient, payload audience != requiredAudience`

症状:

- ログイン後に backend が 401 を返す
- backend ログに `Wrong recipient, payload audience != requiredAudience`

原因:

`apps/frontend/.env.local` の `NEXT_PUBLIC_GOOGLE_CLIENT_ID` と `apps/backend/.env.local` の `GOOGLE_CLIENT_ID` が一致していません。

対応:

1. Google Cloud Console > 認証情報 でクライアント ID をコピーする
2. `apps/frontend/.env.local` と `apps/backend/.env.local` の両方に同じ値を設定する
3. frontend と backend を再起動する

## `User not found`

症状:

- Google ログインは成功するが、backend の `/api/users/me` が 404
- backend ログに `User not found`

原因:

Google Account の `sub` クレームと DB の `users.google_sub` が一致していません。

確認:

```bash
pnpm --filter backend seed
```

シードで補正されない場合は `users` テーブルを確認し、`google_sub` カラムが正しいか確認します。スクリーンショット spec は `google_sub = email` で upsert するため、`pnpm docs:screenshots` 実行時は自動で補正されます。

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
