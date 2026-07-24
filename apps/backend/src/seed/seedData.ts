export const seedUsers = [
  { key: "taro", name: "佐藤太郎", email: "taro@example.com", role: "user" },
  { key: "hanako", name: "田中花子", email: "hanako@example.com", role: "user" },
  { key: "jiro", name: "鈴木次郎", email: "jiro@example.com", role: "user" },
  {
    key: "general",
    name: "一般ユーザー",
    email: "questboard+002@example.com",
    role: "user",
    firebase_uid: "Bw40kXMOiiRQ2gaSJTPYsv1Kkm63",
  },
  {
    key: "admin",
    name: "管理者",
    email: "questboard@example.com",
    role: "admin",
    firebase_uid: "CNDyBsuqPXVndMh6MFGs1ZdZC9t2",
  },
  {
    key: "admin1",
    name: "管理者1",
    email: "questboard+001@example.com",
    role: "admin",
    firebase_uid: "lMQnnhrAsWZhaGkjhcAVZRSmfgg2",
  },
] as const;

export const seedQuestDefinitions = [
  {
    key: "activeApi",
    title: "新しいAPI設計の勇者求む",
    description:
      "RESTful APIの設計・実装を通じて、システム設計スキルを向上させよう！",
    type: "development",
    status: "active",
    maxParticipants: 10,
    tags: ["API", "設計", "バックエンド"],
    start_date: new Date("2026-03-10T00:00:00Z"),
    end_date: new Date("2026-03-28T23:59:59Z"),
    reward: {
      incentive_amount: 50000,
      point_amount: 500,
      note: "API設計完了時のボーナス報酬",
    },
    participants: [{ userKey: "taro" }, { userKey: "general" }],
  },
  {
    key: "inProgressUi",
    title: "UI/UX改善の冒険者募集",
    description:
      "既存アプリのデザインを改善して、より直感的で使いやすいUIを目指そう。",
    type: "design",
    status: "in_progress",
    maxParticipants: 8,
    tags: ["UI", "フロントエンド", "改善"],
    start_date: new Date("2026-02-20T00:00:00Z"),
    end_date: new Date("2026-03-25T23:59:59Z"),
    reward: {
      incentive_amount: 30000,
      point_amount: 300,
      note: "UI改善に貢献したメンバーへの報酬",
    },
    participants: [{ userKey: "general" }, { userKey: "jiro" }],
  },
  {
    key: "planningActive",
    title: "新規ビジネス企画の仲間を探しています",
    description: "新しいサービスのアイデアを出し合い、事業企画を形にしよう！",
    type: "planning",
    status: "active",
    maxParticipants: 20,
    tags: ["企画", "事業開発", "ブレスト"],
    start_date: new Date("2026-03-18T00:00:00Z"),
    end_date: new Date("2026-04-15T23:59:59Z"),
    reward: {
      incentive_amount: 80000,
      point_amount: 800,
      note: "採用された企画に対する報酬",
    },
    participants: [{ userKey: "admin" }],
  },
  {
    key: "maintenanceActive",
    title: "既存システムのバグ修正チャレンジ",
    description:
      "報告されている不具合を修正し、システムの安定性を向上させよう！",
    type: "maintenance",
    status: "active",
    maxParticipants: 15,
    tags: ["バグ修正", "改善", "バックエンド", "フロントエンド"],
    start_date: new Date("2026-03-12T00:00:00Z"),
    end_date: new Date("2026-03-30T23:59:59Z"),
    reward: {
      incentive_amount: 20000,
      point_amount: 200,
      note: "修正件数に応じてボーナスあり",
    },
    participants: [{ userKey: "admin1" }],
  },
  {
    key: "pendingQuest",
    title: "アクセシビリティ監査クエスト",
    description: "公開前の画面を監査して改善提案をまとめる承認待ちクエストです。",
    type: "review",
    status: "pending",
    maxParticipants: 5,
    tags: ["アクセシビリティ", "監査", "レビュー"],
    start_date: new Date("2026-03-20T00:00:00Z"),
    end_date: new Date("2026-04-05T23:59:59Z"),
    reward: {
      incentive_amount: 18000,
      point_amount: 180,
      note: "監査レポート提出で付与",
    },
    participants: [],
  },
  {
    key: "draftQuest",
    title: "オンボーディング記事整備タスク",
    description: "新規参加者向けの導線をまとめる下書き状態のクエストです。",
    type: "documentation",
    status: "draft",
    maxParticipants: 4,
    tags: ["ドキュメント", "オンボーディング"],
    start_date: new Date("2026-03-22T00:00:00Z"),
    end_date: new Date("2026-04-08T23:59:59Z"),
    reward: {
      incentive_amount: 12000,
      point_amount: 120,
      note: "公開後にレビュー通過で付与",
    },
    participants: [],
  },
  {
    key: "inactiveQuest",
    title: "停止中のインフラ棚卸しクエスト",
    description: "再開待ちのため停止中になっている棚卸しタスクです。",
    type: "operations",
    status: "inactive",
    maxParticipants: 6,
    tags: ["インフラ", "棚卸し", "運用"],
    start_date: new Date("2026-01-15T00:00:00Z"),
    end_date: new Date("2026-03-31T23:59:59Z"),
    reward: {
      incentive_amount: 25000,
      point_amount: 250,
      note: "再開後の初回完了で付与",
    },
    participants: [],
  },
  {
    key: "deletedQuest",
    title: "復元確認用の旧キャンペーンクエスト",
    description: "管理画面の復元操作を確認するための論理削除済みクエストです。",
    type: "campaign",
    status: "active",
    maxParticipants: 3,
    tags: ["復元", "管理画面"],
    start_date: new Date("2026-02-01T00:00:00Z"),
    end_date: new Date("2026-02-20T23:59:59Z"),
    deleted_at: new Date("2026-02-21T00:00:00Z"),
    reward: {
      incentive_amount: 10000,
      point_amount: 100,
      note: "復元確認用のダミー報酬",
    },
    participants: [],
  },
  {
    key: "completedReact",
    title: "React開発スキル向上チャレンジ",
    description:
      "Reactを使用したモダンなWebアプリ開発に挑戦。TypeScriptやHooksを学びます。",
    type: "development",
    status: "completed",
    maxParticipants: 12,
    tags: ["React", "TypeScript", "フロントエンド", "学習"],
    start_date: new Date("2025-11-01T00:00:00Z"),
    end_date: new Date("2025-12-31T23:59:59Z"),
    reward: {
      incentive_amount: 50000,
      point_amount: 500,
      note: "React開発完了時の報酬",
    },
    participants: [
      {
        userKey: "taro",
        completed_at: new Date("2025-12-15T10:00:00Z"),
        cleared_at: new Date("2025-12-15T10:00:00Z"),
        feedback_submitted: true,
      },
      {
        userKey: "general",
        completed_at: new Date("2025-12-20T14:30:00Z"),
        cleared_at: new Date("2025-12-20T14:30:00Z"),
        feedback_submitted: true,
      },
      {
        userKey: "admin",
        completed_at: new Date("2025-12-25T09:15:00Z"),
        cleared_at: new Date("2025-12-25T09:15:00Z"),
        feedback_submitted: false,
      },
    ],
  },
  {
    key: "completedDb",
    title: "データベース設計の基礎を学ぶ",
    description:
      "MySQLを使ったデータベース設計とクエリ最適化について学習します。",
    type: "learning",
    status: "completed",
    maxParticipants: 8,
    tags: ["MySQL", "データベース", "設計", "SQL"],
    start_date: new Date("2025-09-01T00:00:00Z"),
    end_date: new Date("2025-10-31T23:59:59Z"),
    reward: {
      incentive_amount: 30000,
      point_amount: 300,
      note: "データベース設計完了時の報酬",
    },
    participants: [
      {
        userKey: "admin1",
        completed_at: new Date("2025-10-20T16:45:00Z"),
        cleared_at: new Date("2025-10-20T16:45:00Z"),
        feedback_submitted: false,
      },
      {
        userKey: "taro",
        completed_at: new Date("2025-10-25T11:20:00Z"),
        cleared_at: new Date("2025-10-25T11:20:00Z"),
        feedback_submitted: false,
      },
    ],
  },
  {
    key: "completedWorkflow",
    title: "チーム開発ワークフロー習得",
    description:
      "Git、GitHub、CI/CDパイプラインを使ったチーム開発のワークフローを習得します。",
    type: "development",
    status: "completed",
    maxParticipants: 10,
    tags: ["Git", "GitHub", "CI/CD", "チーム開発"],
    start_date: new Date("2025-07-01T00:00:00Z"),
    end_date: new Date("2025-08-31T23:59:59Z"),
    reward: {
      incentive_amount: 40000,
      point_amount: 400,
      note: "チーム開発ワークフロー習得完了時の報酬",
    },
    participants: [
      {
        userKey: "general",
        completed_at: new Date("2025-08-15T13:30:00Z"),
        cleared_at: new Date("2025-08-15T13:30:00Z"),
        feedback_submitted: false,
      },
      {
        userKey: "jiro",
        completed_at: new Date("2025-08-20T15:45:00Z"),
        cleared_at: new Date("2025-08-20T15:45:00Z"),
        feedback_submitted: false,
      },
      {
        userKey: "admin",
        completed_at: new Date("2025-08-25T10:15:00Z"),
        cleared_at: new Date("2025-08-25T10:15:00Z"),
        feedback_submitted: false,
      },
    ],
  },
] as const;

export const seedReviewDefinitions = [
  {
    reviewerKey: "taro",
    questKey: "completedReact",
    rating: 5,
    comment: "ReactとTypeScriptの理解が深まりました！とても勉強になりました。",
    created_at: new Date("2025-12-16T10:30:00Z"),
  },
  {
    reviewerKey: "general",
    questKey: "completedReact",
    rating: 4,
    comment: "Hooksの使い方がよく分かりました。実践的な内容で良かったです。",
    created_at: new Date("2025-12-21T15:45:00Z"),
  },
  {
    reviewerKey: "admin",
    questKey: "completedReact",
    rating: 5,
    comment: "モダンなReact開発の流れを学べて大変有意義でした。",
    created_at: new Date("2025-12-26T09:20:00Z"),
  },
  {
    reviewerKey: "admin1",
    questKey: "completedDb",
    rating: 4,
    comment: "MySQLの設計パターンが理解できました。実務で活かせそうです。",
    created_at: new Date("2025-10-21T17:00:00Z"),
  },
  {
    reviewerKey: "taro",
    questKey: "completedDb",
    rating: 5,
    comment: "クエリ最適化の手法が学べて、パフォーマンス改善に役立ちました。",
    created_at: new Date("2025-10-26T12:15:00Z"),
  },
  {
    reviewerKey: "general",
    questKey: "completedWorkflow",
    rating: 5,
    comment: "Gitのブランチ戦略やCI/CDの設定方法が詳しく学べました。",
    created_at: new Date("2025-08-16T14:00:00Z"),
  },
  {
    reviewerKey: "jiro",
    questKey: "completedWorkflow",
    rating: 4,
    comment: "チーム開発のベストプラクティスが理解できました。",
    created_at: new Date("2025-08-21T16:30:00Z"),
  },
  {
    reviewerKey: "admin",
    questKey: "completedWorkflow",
    rating: 5,
    comment: "GitHub Actionsを使った自動化の仕組みが勉強になりました。",
    created_at: new Date("2025-08-26T11:45:00Z"),
  },
] as const;

export const seedEntryDefinitions = [
  {
    userKey: "general",
    questKey: "pendingQuest",
    reason: "監査チェックリストの作成経験を活かしたいです。",
    status: "pending",
    applied_at: new Date("2026-03-09T09:00:00Z"),
  },
  {
    userKey: "hanako",
    questKey: "planningActive",
    reason: "ユーザーインタビューの知見を企画に反映できます。",
    status: "pending",
    applied_at: new Date("2026-03-08T12:30:00Z"),
  },
] as const;

export const seedOfferDefinitions = [
  {
    userKey: "general",
    questKey: "maintenanceActive",
    reason: "過去の不具合調査実績があるため参加オファーを送信。",
    status: "pending",
    sent_at: new Date("2026-03-08T10:00:00Z"),
  },
  {
    userKey: "hanako",
    questKey: "activeApi",
    reason: "API 設計レビューを依頼したいです。",
    status: "accepted",
    sent_at: new Date("2026-03-05T11:00:00Z"),
    responded_at: new Date("2026-03-06T09:30:00Z"),
  },
] as const;

export const seedNotificationDefinitions = [
  {
    userKey: "general",
    message: "メンテナンス系クエストへのオファーが届きました。",
    is_read: false,
    created_at: new Date("2026-03-08T10:05:00Z"),
  },
  {
    userKey: "general",
    message: "アクセシビリティ監査クエストへの応募を受け付けました。",
    is_read: true,
    created_at: new Date("2026-03-09T09:05:00Z"),
    read_at: new Date("2026-03-09T09:10:00Z"),
  },
  {
    userKey: "general",
    message: "React開発スキル向上チャレンジの報酬ポイントを付与しました。",
    is_read: false,
    created_at: new Date("2025-12-20T18:00:00Z"),
  },
  {
    userKey: "admin",
    message: "承認待ちクエストが1件あります。",
    is_read: false,
    created_at: new Date("2026-03-09T08:30:00Z"),
  },
] as const;

export const seedClearSubmissionDefinitions = [
  {
    userKey: "general",
    questKey: "inProgressUi",
    submission_url: "https://example.com/submissions/ui-audit",
    status: "pending",
    submitted_at: new Date("2026-03-09T07:30:00Z"),
  },
  {
    userKey: "taro",
    questKey: "completedReact",
    submission_url: "https://example.com/submissions/react-finish",
    status: "approved",
    submitted_at: new Date("2025-12-14T21:00:00Z"),
    reviewed_at: new Date("2025-12-15T08:00:00Z"),
  },
] as const;

export const seedFeedbackDefinitions = [
  {
    userKey: "general",
    questKey: "completedReact",
    comment: "学習内容が整理されていて最後まで進めやすかったです。",
    created_at: new Date("2025-12-20T16:00:00Z"),
  },
  {
    userKey: "jiro",
    questKey: "inProgressUi",
    comment: "Figma と実装差分を一覧化すると進めやすいです。",
    created_at: new Date("2026-03-09T08:15:00Z"),
  },
] as const;

export const seedIncentivePaymentDefinitions = [
  {
    userKey: "general",
    questKey: "completedReact",
    incentive_amount: 50000,
    status: "paid",
    paid_at: new Date("2025-12-22T10:00:00Z"),
  },
  {
    userKey: "taro",
    questKey: "completedDb",
    incentive_amount: 30000,
    status: "scheduled",
  },
] as const;

export const seedPointTransactionDefinitions = [
  {
    userKey: "general",
    questKey: "completedReact",
    point_amount: 500,
    reason_type: "quest_clear",
    granted_at: new Date("2025-12-20T18:05:00Z"),
  },
  {
    userKey: "general",
    point_amount: 50,
    reason_type: "daily_login_bonus",
    granted_at: new Date("2026-03-09T00:00:00Z"),
  },
  {
    userKey: "admin",
    questKey: "completedWorkflow",
    point_amount: 400,
    reason_type: "quest_clear",
    granted_at: new Date("2025-08-25T18:30:00Z"),
  },
] as const;

export const seedExpectations = {
  generalUserEmail: "questboard+002@example.com",
  adminUserEmail: "questboard@example.com",
  generalUserMypage: {
    participatingQuestKeys: ["activeApi", "inProgressUi"],
    completedQuestKeys: ["completedReact", "completedWorkflow"],
    appliedQuestKeys: ["pendingQuest"],
    notificationCount: 3,
  },
  adminDashboardStatuses: [
    "active",
    "in_progress",
    "completed",
    "pending",
    "draft",
    "inactive",
  ] as const,
  deletedQuestKey: "deletedQuest",
} as const;
