import { prisma } from "../src/config/db";

async function addInactiveQuests() {
	// 新しいユーザー情報を取得
	const userTaro = await prisma.user.findUnique({
		where: { email: "taro@example.com" },
	});
	const userHanako = await prisma.user.findUnique({
		where: { email: "hanako@example.com" },
	});
	const userJiro = await prisma.user.findUnique({
		where: { email: "jiro@example.com" },
	});
	const userGeneral = await prisma.user.findUnique({
		where: { email: "questboard+002@example.com" },
	});
	const userAdmin = await prisma.user.findUnique({
		where: { email: "questboard@example.com" },
	});
	const userAdmin1 = await prisma.user.findUnique({
		where: { email: "questboard+001@example.com" },
	});

	if (
		!userTaro ||
		!userHanako ||
		!userJiro ||
		!userGeneral ||
		!userAdmin ||
		!userAdmin1
	) {
		console.log(
			"必要なユーザーが見つかりません。まず基本のシードデータを実行してください。",
		);
		return;
	}

	// ---------------------
	// 停止中のクエスト作成
	// ---------------------

	// 停止中のクエスト1: セキュリティ監査
	const inactiveQuest1 = await prisma.quest.create({
		data: {
			title: "社内システムセキュリティ監査",
			description:
				"社内で使用しているシステムのセキュリティ脆弱性を調査し、改善提案を行うクエスト。セキュリティ専門知識が必要。",
			type: "security",
			status: "inactive",
			maxParticipants: 5,
			tags: ["セキュリティ", "監査", "脆弱性", "改善"],
			start_date: new Date("2025-01-15T00:00:00Z"),
			end_date: new Date("2025-02-15T23:59:59Z"),
			rewards: {
				create: {
					incentive_amount: 100000,
					point_amount: 1000,
					note: "セキュリティ監査完了時の高額報酬",
				},
			},
			quest_participants: {
				create: [
					{ user: { connect: { id: userTaro.id } } },
					{ user: { connect: { id: userAdmin.id } } },
				],
			},
		},
	});

	// 停止中のクエスト2: パフォーマンス最適化
	const inactiveQuest2 = await prisma.quest.create({
		data: {
			title: "Webアプリケーション性能最適化",
			description:
				"既存のWebアプリケーションのパフォーマンスを分析し、最適化を実施するクエスト。技術的な深い知識が必要。",
			type: "optimization",
			status: "inactive",
			maxParticipants: 6,
			tags: ["パフォーマンス", "最適化", "分析", "改善"],
			start_date: new Date("2025-02-01T00:00:00Z"),
			end_date: new Date("2025-03-01T23:59:59Z"),
			rewards: {
				create: {
					incentive_amount: 75000,
					point_amount: 750,
					note: "パフォーマンス改善に応じた報酬",
				},
			},
			quest_participants: {
				create: [{ user: { connect: { id: userGeneral.id } } }],
			},
		},
	});

	// 停止中のクエスト3: 新技術調査
	const inactiveQuest3 = await prisma.quest.create({
		data: {
			title: "新技術調査・導入検討",
			description:
				"最新の技術トレンドを調査し、自社プロダクトへの導入可能性を検討するクエスト。調査・分析スキルが重要。",
			type: "research",
			status: "inactive",
			maxParticipants: 8,
			tags: ["調査", "新技術", "導入検討", "分析"],
			start_date: new Date("2025-01-20T00:00:00Z"),
			end_date: new Date("2025-02-20T23:59:59Z"),
			rewards: {
				create: {
					incentive_amount: 60000,
					point_amount: 600,
					note: "調査レポート提出時の報酬",
				},
			},
			quest_participants: {
				create: [
					{ user: { connect: { id: userAdmin1.id } } },
					{ user: { connect: { id: userJiro.id } } },
				],
			},
		},
	});

	// 停止中のクエスト4: ドキュメント整備
	const inactiveQuest4 = await prisma.quest.create({
		data: {
			title: "開発ドキュメント整備プロジェクト",
			description:
				"既存の開発ドキュメントを整理・整備し、新しい開発者でも理解しやすい形に改善するクエスト。",
			type: "documentation",
			status: "inactive",
			maxParticipants: 4,
			tags: ["ドキュメント", "整備", "改善", "保守"],
			start_date: new Date("2025-01-10T00:00:00Z"),
			end_date: new Date("2025-02-10T23:59:59Z"),
			rewards: {
				create: {
					incentive_amount: 40000,
					point_amount: 400,
					note: "ドキュメント整備完了時の報酬",
				},
			},
			quest_participants: {
				create: [{ user: { connect: { id: userHanako.id } } }],
			},
		},
	});

	// 停止中のクエスト5: テスト自動化
	const inactiveQuest5 = await prisma.quest.create({
		data: {
			title: "テスト自動化環境構築",
			description:
				"手動テストを自動化し、CI/CDパイプラインに組み込むための環境を構築するクエスト。",
			type: "automation",
			status: "inactive",
			maxParticipants: 7,
			tags: ["テスト", "自動化", "CI/CD", "環境構築"],
			start_date: new Date("2025-01-25T00:00:00Z"),
			end_date: new Date("2025-02-25T23:59:59Z"),
			rewards: {
				create: {
					incentive_amount: 80000,
					point_amount: 800,
					note: "自動化環境構築完了時の報酬",
				},
			},
			quest_participants: {
				create: [
					{ user: { connect: { id: userTaro.id } } },
					{ user: { connect: { id: userGeneral.id } } },
				],
			},
		},
	});

	console.log("停止中のクエスト追加完了:", {
		inactiveQuest1: inactiveQuest1.title,
		inactiveQuest2: inactiveQuest2.title,
		inactiveQuest3: inactiveQuest3.title,
		inactiveQuest4: inactiveQuest4.title,
		inactiveQuest5: inactiveQuest5.title,
	});

	// 追加されたクエストの総数を確認
	const totalQuests = await prisma.quest.count();
	const inactiveQuests = await prisma.quest.count({
		where: { status: "inactive" },
	});

	console.log(
		`総クエスト数: ${totalQuests}, 停止中クエスト数: ${inactiveQuests}`,
	);
}

addInactiveQuests()
	.catch((e) => {
		console.error("停止中クエスト追加エラー:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
