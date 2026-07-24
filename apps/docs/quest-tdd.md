# クエスト掲示板 システム テーブル定義書

::: tip このページの使い方
DB テーブルの項目と関係を確認するための資料です。
実装時は `apps/backend/prisma/schema.prisma` を正本として確認し、このページは設計理解とレビュー補助に使ってください。
:::

---

## 1. users（ユーザー）

| カラム名      | 型           | 制約                      | 説明                                              |
| ------------- | ------------ | ------------------------- | ------------------------------------------------- |
| id            | BIGINT       | PK, AUTO_INCREMENT        | ユーザーID                                        |
| name          | VARCHAR(100) | NOT NULL                  | 氏名                                              |
| email         | VARCHAR(255) | UNIQUE, NOT NULL          | メールアドレス                                    |
| password_hash | VARCHAR(255) | NOT NULL                  | パスワードハッシュ                                |
| role          | ENUM         | NOT NULL                  | ユーザーロール（user, trainee, manager, master）  |
| joined_at     | DATETIME     | DEFAULT CURRENT_TIMESTAMP | 登録日時                                          |
| deleted_at    | DATETIME     | NULLABLE                  | 論理削除用                                        |

---

## 2. quests（クエスト）

| カラム名     | 型           | 制約                        | 説明                                         |
| ------------ | ------------ | --------------------------- | -------------------------------------------- |
| id           | BIGINT       | PK, AUTO_INCREMENT          | クエストID                                   |
| title        | VARCHAR(255) | NOT NULL                    | クエストタイトル                             |
| description  | TEXT         |                             | 詳細説明                                     |
| genre        | VARCHAR(100) |                             | ジャンル                                     |
| target_role  | ENUM         |                             | 対象ロール（user, graduateなど）             |
| created_by   | BIGINT       | FK (users.id)               | 作成者ユーザーID                             |
| status       | ENUM         | NOT NULL                    | ステータス（draft, open, closed, completed） |
| published_at | DATETIME     |                             | 公開日時                                     |
| created_at   | DATETIME     | DEFAULT CURRENT_TIMESTAMP   | 作成日時                                     |
| updated_at   | DATETIME     | ON UPDATE CURRENT_TIMESTAMP | 更新日時                                     |

---

## 3. quest_entries（エントリー情報）

| カラム名     | 型       | 制約                      | 説明                                           |
| ------------ | -------- | ------------------------- | ---------------------------------------------- |
| id           | BIGINT   | PK, AUTO_INCREMENT        | エントリーID                                   |
| user_id      | BIGINT   | FK (users.id)             | エントリーしたユーザーID                       |
| quest_id     | BIGINT   | FK (quests.id)            | クエストID                                     |
| status       | ENUM     | NOT NULL                  | 状態（pending, approved, rejected, completed） |
| submitted_at | DATETIME |                           | 成果物提出日時                                 |
| approved_at  | DATETIME |                           | 承認日時                                       |
| created_at   | DATETIME | DEFAULT CURRENT_TIMESTAMP | エントリー日時                                 |

---

## 4. reviews（レビュー）

| カラム名       | 型       | 制約                      | 説明                               |
| -------------- | -------- | ------------------------- | ---------------------------------- |
| id             | BIGINT   | PK, AUTO_INCREMENT        | レビューID                         |
| quest_id       | BIGINT   | FK (quests.id)            | 対象クエストID                     |
| user_id        | BIGINT   | FK (users.id)             | 投稿者ユーザーID                   |
| target_user_id | BIGINT   | FK (users.id)             | 対象ユーザーID（レビューされる側） |
| rating         | INT      |                           | 評価（1〜5など）                   |
| comment        | TEXT     |                           | コメント内容                       |
| created_at     | DATETIME | DEFAULT CURRENT_TIMESTAMP | 投稿日時                           |

---

## 5. rewards（報酬）

| カラム名   | 型       | 制約                      | 説明                         |
| ---------- | -------- | ------------------------- | ---------------------------- |
| id         | BIGINT   | PK, AUTO_INCREMENT        | 報酬ID                       |
| user_id    | BIGINT   | FK (users.id)             | 報酬受け取りユーザーID       |
| quest_id   | BIGINT   | FK (quests.id)            | 対象クエストID               |
| type       | ENUM     | NOT NULL                  | 報酬種別（incentive, point） |
| amount     | INT      | NOT NULL                  | 報酬額（ポイント数など）     |
| granted_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 付与日時                     |

---

## 6. notifications（通知）

| カラム名   | 型       | 制約                      | 説明                                       |
| ---------- | -------- | ------------------------- | ------------------------------------------ |
| id         | BIGINT   | PK, AUTO_INCREMENT        | 通知ID                                     |
| user_id    | BIGINT   | FK (users.id)             | 対象ユーザーID                             |
| type       | ENUM     |                           | 通知種別（entry_approved, new_quest など） |
| content    | TEXT     |                           | 通知内容                                   |
| is_read    | BOOLEAN  | DEFAULT FALSE             | 既読フラグ                                 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 通知日時                                   |

---

## 7. titles（称号）

| カラム名    | 型           | 制約               | 説明                           |
| ----------- | ------------ | ------------------ | ------------------------------ |
| id          | BIGINT       | PK, AUTO_INCREMENT | 称号ID                         |
| name        | VARCHAR(100) | UNIQUE             | 称号名（例：村人、冒険者など） |
| description | TEXT         |                    | 説明                           |

---

## 8. user_titles（ユーザー称号履歴）

| カラム名   | 型       | 制約                      | 説明       |
| ---------- | -------- | ------------------------- | ---------- |
| id         | BIGINT   | PK, AUTO_INCREMENT        | ID         |
| user_id    | BIGINT   | FK (users.id)             | ユーザーID |
| title_id   | BIGINT   | FK (titles.id)            | 称号ID     |
| awarded_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 取得日時   |

---

## 9. quest_recommendations（レコメンド履歴）

| カラム名   | 型       | 制約                      | 説明                       |
| ---------- | -------- | ------------------------- | -------------------------- |
| id         | BIGINT   | PK, AUTO_INCREMENT        | ID                         |
| user_id    | BIGINT   | FK (users.id)             | ユーザーID                 |
| quest_id   | BIGINT   | FK (quests.id)            | レコメンドされたクエストID |
| reason     | TEXT     |                           | レコメンド理由             |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 登録日時                   |
