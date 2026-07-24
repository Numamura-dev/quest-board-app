export const mockUser = {
	name: "田中太郎",
	avatar: "👤",
	points: 1250,
};

export const mockQuestData = {
	participating: [
		{
			id: 1,
			title: "TypeScript修行の旅",
			reward: 300,
			deadline: "2025-06-30",
			progress: 75,
			difficulty: "初級" as const,
			category: "学習",
		},
	],
	completed: [
		{
			id: 2,
			title: "セキュリティの守護者",
			reward: 600,
			difficulty: "中級" as const,
			category: "学習",
			completedDate: "2025-05-31",
		},
	],
	applied: [
		{
			id: 3,
			title: "パフォーマンス最適化の聖戦",
			reward: 800,
			difficulty: "上級" as const,
			category: "チャレンジ",
			appliedDate: "2025-06-21",
		},
	],
};

export const mockNotifications = [
	{
		id: 1,
		message: "クエスト「TypeScript修行の旅」の進捗が更新されました",
		type: "info" as const,
		timestamp: "2025-06-25T10:30:00Z",
	},
	{
		id: 2,
		message:
			"クエスト「セキュリティの守護者」を完了しました！報酬600ポイントを獲得しました",
		type: "reward" as const,
		timestamp: "2025-05-31T18:00:00Z",
	},
	{
		id: 3,
		message: "新しいクエスト「パフォーマンス最適化の聖戦」に応募しました",
		type: "success" as const,
		timestamp: "2025-06-21T13:00:00Z",
	},
];
