# クエスト掲示板 API一覧・設計方針

本ドキュメントは、クエスト掲示板アプリケーションにおける RESTful API の一覧と命名規則、設計方針を定義したものです。  
使用技術やディレクトリ構成、Atomic Designに基づくUI設計、バックエンドの責務分離設計と整合性を保つことを目的とします。

---

## 🛠 使用技術（参考）

- フロントエンド：React, TypeScript, Next.js（Atomic Design準拠）
- バックエンド：Node.js (Express), TypeScript
- DB：Prisma
- 認証：Firebase Authentication
- パッケージ管理：pnpm
- コード整形・Lint：Biome

---

## ✅ API一覧

| エンドポイント名                 | 対象画面                 | 概要                                               |
| -------------------------------- | ------------------------ | ---------------------------------------------------|
| `POST /api/session`              | ログイン後の初回通信     | Firebase IDトークンを受け取り、セッションを確立。   |
| `DELETE /api/session`            | ログアウト               | サーバー側のセッションまたはCookieを削除。         |
| `GET /api/users/me`              | マイページ               | Firebaseトークンをもとに、ユーザー情報を取得。     |
| `PUT /api/users/me`              | ユーザー情報編集         | プロフィール（名前・アバターなど）を更新。         |
| `GET /api/quests`                | クエスト一覧画面         | 公開中のクエストを一覧で取得。クエリで絞り込み可。 |
| `GET /api/quests/:id`            | クエスト詳細画面         | クエストの詳細情報を取得。                         |
| `POST /api/quests/:id/participants` | クエスト詳細          | 指定クエストに参加する。                           |
| `GET /api/mypage/entries`        | マイページ               | 自分が参加中のクエスト一覧を取得。                 |
| `GET /api/mypage/cleared`        | マイページ               | 達成済みのクエスト一覧を取得。                     |
| `POST /api/quests/:id/submissions` | クエスト提出画面      | 状態遷移や提出系の subordinate resource を作成。   |
| `GET /api/quests/:id/submission` | クエスト詳細画面         | 提出済み成果物の確認。                             |
| `GET /api/quests/:id/reviews`    | クエスト詳細画面         | クエストに対するレビュー一覧を取得。               |
| `POST /api/quests/:id/reviews`   | クエスト詳細画面         | クエストに対するレビューを作成。                   |
| `GET /api/rewards`               | ポイント交換所（予定）   | ポイントと交換可能な報酬一覧。                     |
| `POST /api/rewards/:id/exchange` | ポイント交換所（予定）   | 報酬との交換申請を行う。                           |
| `PUT /api/quests/:id`            | クエスト管理画面         | 既存クエストの内容を更新。                         |
| `DELETE /api/quests/:id`         | クエスト管理画面         | クエストを削除。                                   |
| `GET /api/admin/users`           | ユーザー管理画面         | 全ユーザー一覧を取得（管理者用）。                 |
| `GET /api/admin/roles`           | 権限管理画面             | 利用可能なロール一覧を取得（管理者用）。           |

---

## 🎯 命名設計の目的

- フロントエンドとバックエンドの連携を明確に
- コードやドキュメントから動作が直感的に分かる
- 保守性と拡張性を両立

---

## 🧱 基本構造

```
/api/{resources}/{resourceId?}/{sub-resources?}
```

- `/api` を共通プレフィックスとして利用
- リソースは小文字の **英語・複数形**
- 動詞は path に直接埋め込まず、必要なら `participants` `reviews` `submissions` のような subordinate resource で表現する
- パスパラメータ（`:id`）とクエリパラメータ（`?page=1` など）を適切に使い分け

---

## 🔧 **HTTPメソッドの使い分け**

| メソッド | 用途           | 例                             |
|----------|----------------|--------------------------------|
| `GET`    | データ取得     | `/api/quests`, `/api/users/me` |
| `POST`   | 作成/アクション| `/api/quests/:id/entry`        |
| `PUT`    | 更新           | `/api/users/me`                |
| `DELETE` | 削除           | `/api/quests/:id`              |

---

## 🔄 クエリパラメータの例

| 用途             | 例                                          |
|------------------|---------------------------------------------|
| ステータス絞り込み | `/api/quests?status=ongoing`               |
| ジャンル指定       | `/api/quests?genre=learning`               |
| ページネーション   | `/api/quests?page=2&limit=20`              |
| ソート             | `/api/quests?sort=createdAt_desc`          |

---

## 🏷️ 命名アンチパターンと改善例

| NG例                         | 問題点                               | 改善例                          |
|------------------------------|--------------------------------------|---------------------------------|
| `GET /getQuests`             | RESTの意味に反する                   | `GET /api/quests`              |
| `POST /questEntry`           | リソースベースではない               | `POST /api/quests/:id/participants` |
| `PUT /api/quests/update`     | 動詞が冗長                           | `PUT /api/quests/:id`          |
| `POST /submitQuest`          | 不明確な動詞                         | `POST /api/quests/:id/submissions` |

---

## 🔁 クエスト登録時のデータフロー（責務の流れ）

```
[フロントエンド]
  POST /api/quests
        ▼
[Controller] quest.controller.ts
        ▼
[Service] quest.service.ts
        ▼
[Repository] quest.repository.ts（Prisma）
        ▼
[Database]
```

---

## 📁 バージョニング戦略（推奨）

将来的なAPIの互換性維持のため、次のようなバージョニングを推奨します：

```
/api/v1/quests
/api/v1/users/me
```

---

## 📝 補足

- OpenAPI (Swagger) によるドキュメント自動生成にも対応予定
- Firebase 認証により、認証系APIの大部分はクライアント側で完結
- 管理者専用APIには RBAC に基づく保護を必須とします
- すべてのレスポンスは JSON形式、HTTPステータスコード準拠

---
