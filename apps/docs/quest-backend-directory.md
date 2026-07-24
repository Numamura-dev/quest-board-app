# クエスト掲示板アプリケーション設計方針

::: tip このページの使い方
バックエンド実装で、routes、controllers、services、Prisma 周辺の入口を探すための資料です。
最新の実コードは `apps/backend/src` と `apps/backend/prisma` を確認し、このページは責務分離の補助として使ってください。
:::

## 1. バックエンド ディレクトリ構成案

backend/
├── src/
│   ├── controllers/         # ルーティングの処理
│   │   ├── auth.controller.ts
│   │   ├── quest.controller.ts
│   │   ├── user.controller.ts
│   │   └── role.controller.ts
│   ├── routes/              # エンドポイント定義
│   │   ├── auth.route.ts
│   │   ├── quest.route.ts
│   │   ├── user.route.ts
│   │   └── role.route.ts
│   ├── services/            # ビジネスロジック
│   │   ├── auth.service.ts
│   │   ├── quest.service.ts
│   │   ├── user.service.ts
│   │   └── role.service.ts
│   ├── middlewares/         # 認証・エラーハンドリングなど
│   │   ├── auth.middleware.ts
│   │   └── errorHandler.ts
│   ├── models/              # DBモデル（PrismaやTypeORMで拡張可能）
│   │   ├── user.model.ts
│   │   ├── quest.model.ts
│   │   ├── review.model.ts
│   │   ├── reward.model.ts
│   │   └── role.model.ts
│   ├── utils/               # ユーティリティ関数
│   │   ├── logger.ts
│   │   └── token.ts
│   ├── config/              # 環境変数やDB設定
│   │   ├── db.ts
│   │   └── config.ts
│   ├── types/               # 型定義
│   │   ├── user.d.ts
│   │   ├── quest.d.ts
│   │   └── auth.d.ts
│   ├── index.ts             # アプリのエントリーポイント
│   └── app.ts               # Express アプリ本体  ←エンドポイントそここで指示
├── .env                     # 環境変数
├── package.json
├── tsconfig.json
└── README.md

---

## 2. バックエンドにおけるデータの流れと責務

### データの流れ：クエスト新規作成

[フロントエンド]
     │ POST /api/quests
     ▼
[Next.js API Route (Controller)]
     │ リクエストバリデーション
     ▼
[Service層]  ←ここがディレクトリ構成で抜けてるので追加
     │ ビジネスロジックの処理
     ▼
[Repository層]
     │ データベース操作（Prismaなど）
     ▼
[DB]

---
