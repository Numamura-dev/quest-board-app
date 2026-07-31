# ログ設計書

## 目的

Quest Board backend のログを、開発時は読みやすく、本番では機械処理しやすい形式で統一する。

## 対象

- `apps/backend`
- HTTP リクエストログ
- アプリケーションエラーログ
- Google OAuth 初期化ログ
- service 層の業務エラーログ

## 採用ライブラリ

- `pino`
- `pino-http`
- `pino-pretty`

## 基本方針

- 本番環境では JSON 形式で出力する
- 開発環境では `pino-pretty` で整形して表示する
- ログレベルは `info` `warn` `error` を使い分ける
- すべてのログメッセージは日本語で記述する
- 構造化フィールドに `err` や業務キーを含め、検索しやすくする

## ログレベルの使い分け

### `info`

- サーバー起動
- 正常終了した HTTP リクエスト
- 初期化完了

### `warn`

- 4xx 系リクエスト
- 既知のアプリケーションエラー
- フォールバック発生

### `error`

- 5xx 系リクエスト
- 未処理例外
- 外部サービス初期化失敗
- service 層の想定外エラー

## 出力項目

### 共通

- `level`
- `time`
- メッセージ

### HTTP リクエストログ

- `req.method`
- `req.url`
- `res.statusCode`

### エラーログ

- `err`
- 業務識別子
  - 例: `userId`, `questId`, `googleSub`

## 実装位置

- 共通 logger: `apps/backend/src/config/logger.ts`
- リクエストログ: `apps/backend/src/app.ts`
- グローバルエラーハンドラ: `apps/backend/src/middlewares/errorHandler.ts`
- Google OAuth 初期化: `apps/backend/src/config/auth.ts`

## 運用ルール

- 新しい `console.log` / `console.warn` / `console.error` は追加しない
- backend のログは必ず共通 logger を経由する
- 業務エラーでは可能な限り識別子を構造化フィールドに入れる
- 個人情報や秘密情報をそのままログに出さない

## 今後の拡張候補

- リクエスト ID の付与
- OpenTelemetry 連携
- 外部ログ基盤への転送
- 監査ログと運用ログの分離
