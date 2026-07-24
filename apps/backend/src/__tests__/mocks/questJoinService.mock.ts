import type { QuestParticipant } from "@prisma/client";

// モックデータ
export const mockQuestParticipant: QuestParticipant = {
	id: 1,
	user_id: 1,
	quest_id: 1,
	joined_at: new Date("2024-01-01"),
	completed_at: null,
	cleared_at: null,
	feedback_submitted: false,
	created_at: new Date("2024-01-01"),
	updated_at: new Date("2024-01-01"),
} as QuestParticipant;

// クエスト情報のモックデータ
export const mockQuestInfo = {
	id: 1,
	maxParticipants: 5,
};

// Prismaクライアントのモック実装
export const mockPrismaClient = {
	$transaction: jest.fn(),
	$queryRaw: jest.fn(),
	questParticipant: {
		findUnique: jest.fn(),
		count: jest.fn(),
		create: jest.fn(),
	},
};

// トランザクション内の関数のモック
export const mockTransaction = {
	$queryRaw: jest.fn(),
	questParticipant: {
		findUnique: jest.fn(),
		count: jest.fn(),
		create: jest.fn(),
	},
};

// デフォルトのモック実装を設定
mockPrismaClient.$transaction.mockImplementation((callback) => {
	return callback(mockTransaction);
});

mockTransaction.$queryRaw.mockResolvedValue([mockQuestInfo]);
mockTransaction.questParticipant.findUnique.mockResolvedValue(null);
mockTransaction.questParticipant.count.mockResolvedValue(0);
mockTransaction.questParticipant.create.mockResolvedValue(mockQuestParticipant);

// Prismaクライアントをモック化
jest.mock("../../config/db", () => ({
	__esModule: true,
	prisma: mockPrismaClient,
}));
