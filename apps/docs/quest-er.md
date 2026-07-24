# クエスト掲示板 ER 図

DB の全体関係を Mermaid ER 図で確認するためのページです。
各テーブルの項目説明は [テーブル定義](./quest-tdd.md) を参照してください。

```mermaid
erDiagram

users {
  BIGINT id PK
  VARCHAR name
  VARCHAR email UNIQUE
  VARCHAR password_hash
  VARCHAR role
  DATETIME joined_at
  DATETIME deleted_at
}

quests {
  BIGINT id PK
  VARCHAR title
  TEXT description
  VARCHAR genre
  VARCHAR target_role
  BIGINT created_by FK
  VARCHAR status
  DATETIME published_at
  DATETIME created_at
  DATETIME updated_at
}

quest_entries {
  BIGINT id PK
  BIGINT user_id FK
  BIGINT quest_id FK
  VARCHAR status
  DATETIME submitted_at
  DATETIME approved_at
  DATETIME created_at
}

reviews {
  BIGINT id PK
  BIGINT quest_id FK
  BIGINT user_id FK
  BIGINT target_user_id FK
  INT rating
  TEXT comment
  DATETIME created_at
}

rewards {
  BIGINT id PK
  BIGINT user_id FK
  BIGINT quest_id FK
  VARCHAR type
  INT amount
  DATETIME granted_at
}

notifications {
  BIGINT id PK
  BIGINT user_id FK
  VARCHAR type
  TEXT content
  BOOLEAN is_read
  DATETIME created_at
}

titles {
  BIGINT id PK
  VARCHAR name UNIQUE
  TEXT description
}

user_titles {
  BIGINT id PK
  BIGINT user_id FK
  BIGINT title_id FK
  DATETIME awarded_at
}

quest_recommendations {
  BIGINT id PK
  BIGINT user_id FK
  BIGINT quest_id FK
  TEXT reason
  DATETIME created_at
}

%% Relationships
users ||--o{ quests : creates
users ||--o{ quest_entries : makes
users ||--o{ reviews : writes
reviews }o--|| users : targets
users ||--o{ rewards : receives
users ||--o{ notifications : receives
users ||--o{ user_titles : earns
users ||--o{ quest_recommendations : gets

quests ||--o{ quest_entries : has
quests ||--o{ reviews : has
quests ||--o{ rewards : has
quests ||--o{ quest_recommendations : is_recommended

titles ||--o{ user_titles : assigned_to
```
