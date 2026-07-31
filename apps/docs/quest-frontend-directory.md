# クエスト掲示板アプリケーション設計方針（App Router対応）

::: tip このページの使い方
フロントエンド実装で、画面、コンポーネント、hooks、services の入口を探すための資料です。
最新の実コードは `apps/frontend/src` を確認し、このページは配置方針と読み解きの補助として使ってください。
:::

## 使用技術
- フロントエンド：React, TypeScript, Next.js（App Router 構成）
- コンポーネント設計：Atomic Design（テンプレート層は除く）
- Google OAuth 2.0（@react-oauth/google）

---

## 1. フロントエンド ディレクトリ構成案

```plaintext
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── page.tsx（＝トップページ）
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signUp/
│   │   │   └── page.tsx
│   │   ├── quests/
│   │   │   └── page.tsx
│   │   ├── mypage/
│   │   │   └── page.tsx
│   │   └── admin/
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── quests/
│   │       │   └── page.tsx
│   │       ├── rewards/
│   │       │   └── page.tsx
│   │       ├── users/
│   │       │   └── page.tsx
│   │       └── roles/
│   │           └── page.tsx
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   ├── features/
│   ├── layouts/
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── utils/
│   ├── services/
│   │   ├── auth/
│   │   │   └── googleAuth.ts
│   ├── types/
│   └── store/
├── .env.local
├── next.config.js
└── tsconfig.json

---

## 2. コンポーネント設計方針（Atomic Design準拠）

本アプリケーションでは Atomic Design に基づき、次の3つのレイヤーを採用します（Template は採用しません）。

### レイヤー構成

| レイヤー     | 説明                                 | 例                               |
| ------------ | ------------------------------------ | -------------------------------- |
| **Atom**     | UIの最小単位。再利用性が高い。       | `Button`, `TextInput`, `Icon`    |
| **Molecule** | 複数のAtomを組み合わせた部品。       | `LoginForm`, `QuestCard`         |
| **Organism** | 機能としてまとまったコンポーネント。 | `Header`, `Sidebar`, `QuestList` |

---

## 3. 画面構成一覧

### 3.1 一般ユーザー用画面
- ログイン画面
- ホーム画面
- クエスト一覧画面
- マイページ
- 過去のクエスト一覧画面
- ポイント交換所画面（将来的に実装予定）

### 3.2 管理者用画面
- ダッシュボード
- クエスト管理画面
- 報酬管理画面
- ユーザー管理画面
- ロール・権限管理画面

---

## 4. コンポーネント構成

本セクションでは、Atomic Design に基づくコンポーネント構成の具体例を画面ごとに示します。

### 一般ユーザー向け画面：クエスト一覧画面
app/quest/page.tsx
 └─ <QuestList /> (organism)
     └─ <QuestCard /> (molecule)
         ├─ <Title /> (atom)
         ├─ <Description /> (atom)
         ├─ <TagList /> (molecule)
         │   └─ <Tag /> (atom)
         └─ <ActionButton /> (atom)

### 一般ユーザー向け画面：マイページ
app/mypage/page.tsx
 └─ <UserProfile /> (organism)
     ├─ <Avatar /> (atom)
     ├─ <UserInfo /> (molecule)
     │   ├─ <UserName /> (atom)
     │   └─ <UserPoints /> (atom)
     └─ <QuestHistory /> (organism)
         └─ <QuestCard /> (molecule)

### 管理者画面：ユーザー管理画面
app/admin/users/page.tsx
 └─ <UserTable /> (organism)
     └─ <UserRow /> (molecule)
         ├─ <UserName /> (atom)
         ├─ <Email /> (atom)
         └─ <RoleBadge /> (atom)

### 管理者画面：クエスト管理画面
app/admin/quests/page.tsx
 └─ <AdminQuestList /> (organism)
     └─ <AdminQuestCard /> (molecule)
         ├─ <QuestTitle /> (atom)
         ├─ <RewardPoints /> (atom)
         └─ <EditButton /> (atom)

### 共通レイアウト構成
src/components/layouts/MainLayout.tsx
 ├─ <Header /> (organism)
 ├─ <Sidebar /> (organism)
 └─ <Footer /> (organism)

---
