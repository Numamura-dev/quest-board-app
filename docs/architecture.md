# Architecture

このドキュメントは、リポジトリの構造と各レイヤーの責務を定義する。AI エージェントは実装対象の把握と変更箇所の切り分けに使う。

## 目的

- システム全体像を短時間で把握できるようにする
- レイヤーごとの責務と禁止事項を明確にする
- 変更時の判断基準を 1 か所に集約する

## AI が読むタイミング

- `AGENTS.md` を読んだ直後
- 変更対象レイヤーを決める前
- 既存コード調査の観点を絞る前

## システム概要

クエスト掲示板は以下の構成で動作する。

```text
Frontend (Next.js)
  -> Backend API (Express)
  -> Service Layer
  -> Prisma ORM
  -> MySQL
```

認証には Firebase Authentication を使用する。

## リポジトリ構造

```text
repo
├─ apps
│  ├─ frontend   # Next.js UI
│  ├─ backend    # Express API
│  ├─ docs       # プロダクト / 開発ドキュメントサイト
│  └─ e2e        # Playwright
<<<<<<< HEAD
=======
├─ packages
│  └─ types      # 共有型
>>>>>>> origin/main
├─ docs
│  ├─ architecture.md
│  └─ ai-execution.md
├─ prompt
│  ├─ agent.md
│  ├─ create_issue.md
│  └─ modify_issue.md
├─ AGENTS.md
<<<<<<< HEAD
├─ CLAUDE.md
=======
>>>>>>> origin/main
└─ README.md
```

## Backend Architecture

```text
Router
  -> Controller
  -> Service
  -> Data Access / Prisma
  -> MySQL
```

### Router

責務:

- エンドポイント定義
- ミドルウェア適用
- Controller 接続

含めない内容:

- ビジネスロジック
- DB 操作

### Controller

責務:

- Request / Response の取り扱い
- 入出力の検証
- Service 呼び出し
- HTTP エラーへの変換

含めない内容:

- 複雑なビジネスロジック
- 生の DB 操作

### Service

責務:

- ビジネスロジック
- 複数データの整合
- 永続化処理の組み立て

含めない内容:

- HTTP 固有のレスポンス制御
- UI 依存ロジック

### Data Access / Prisma

責務:

- データ永続化
- schema 管理
- query 実行

含めない内容:

- HTTP ロジック
- UI ロジック

## Frontend Architecture

```text
Page / Component
  -> Service / API Client
  -> Backend API
```

### Frontend

責務:

- UI 表示
- ユーザー操作
- 認証状態の利用
- API 呼び出し結果の表示

含めない内容:

- DB アクセス
- バックエンド相当のビジネスロジック
- API URL の重複定義

### API Client / Service

責務:

- API 呼び出しの集約
- request / response の整形
- 共通エラーハンドリング

含めない内容:

- 画面固有の描画ロジック
- DOM / UI 状態管理

<<<<<<< HEAD
=======
### Shared Types (`packages/types`)

責務:

- frontend / backend 間で共有する型定義
- レイヤーをまたいで一致させたい契約の集約

含めない内容:

- runtime のビジネスロジック
- UI 実装や API ハンドラ本体

>>>>>>> origin/main
### Docs App (`apps/docs`)

責務:

- 開発者向けドキュメントサイトの表示
- docs 配下や関連資料の案内

含めない内容:

- AI 共通ルールの正本管理
- frontend / backend の実装ロジック

## 実装判断ルール

変更時の優先順位は以下とする。

1. 既存コードとの一貫性
2. レイヤー責務との適合
3. シンプルさ
4. 可読性
5. 拡張性

複数案ある場合は、既存配置と既存命名に最も整合する案を選ぶ。

## 実装順序の目安

### バックエンド変更を含む場合

1. Prisma schema
2. Data Access
3. Service
4. Controller
5. Router
6. Frontend API Client
7. UI
8. Test

### フロントエンドのみの場合

1. API Client または state 処理
2. Component
3. Page / Route
4. Test

### バグ修正の場合

1. 再現条件の確認
2. 原因箇所の特定
3. 最小修正
4. 回帰防止テスト
<<<<<<< HEAD
=======

## 含める内容

- システム構造
- レイヤー責務
- 変更判断ルール
- 実装順序の目安

## 含めない内容

- AI エージェントの行動規範
- 具体的な実行フェーズ
- そのまま貼り付けるためのプロンプト本文
>>>>>>> origin/main
