import type {
	Quest,
	QuestParticipant,
	Entry,
	User,
	Notification,
} from "@prisma/client";

// モックデータ
export const mockUser: User = {
	id: 1,
	name: "テストユーザー",
	email: "test@example.com",
	role: "user",
	created_at: new Date("2024-01-01"),
	updated_at: new Date("2024-01-01"),
	google_sub: "google-sub-123",
} as User;

export const mockQuest: Quest = {
	id: 1,
	title: "テストクエスト",
	description: "テスト用のクエストです",
	type: "development",
	status: "active",
	maxParticipants: 5,
	tags: ["test", "development"],
	start_date: new Date("2024-01-01"),
	end_date: new Date("2024-01-31"),
	created_at: new Date("2024-01-01"),
	updated_at: new Date("2024-01-01"),
	rewards_id: 1,
} as Quest;

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

export const mockClearedQuestParticipant: QuestParticipant = {
	...mockQuestParticipant,
	id: 2,
	quest_id: 2,
	cleared_at: new Date("2024-01-15"),
} as QuestParticipant;

export const mockEntry: Entry = {
	id: 1,
	user_id: 1,
	quest_id: 3,
	reason: "参加したいです",
	status: "pending",
	applied_at: new Date("2024-01-01"),
	reply_comment: null,
	approved_at: null,
	rejected_at: null,
} as Entry;

export const mockNotification: Notification = {
	id: 1,
	user_id: 1,
	message: "新しいクエストが追加されました",
	is_read: false,
	created_at: new Date("2024-01-01"),
	read_at: null,
} as Notification;

// 参加中クエストのモックデータ（questを含む）
export const mockParticipatingQuests = [
	{
		...mockQuestParticipant,
		quest: mockQuest,
	},
];

// 達成済みクエストのモックデータ（questを含む）
export const mockClearedQuests = [
	{
		...mockClearedQuestParticipant,
		quest: {
			...mockQuest,
			id: 2,
			title: "達成済みクエスト",
		},
	},
];

// 応募中クエストのモックデータ（questを含む）
export const mockAppliedQuests = [
	{
		...mockEntry,
		quest: {
			...mockQuest,
			id: 3,
			title: "応募中クエスト",
		},
	},
];

// mypageDbのモック実装
export const mockMypageDb = {
	fetchUserParticipatingQuests: jest.fn(),
	fetchUserClearedQuests: jest.fn(),
	fetchUserAppliedQuests: jest.fn(),
	fetchUserById: jest.fn(),
	fetchUserNotifications: jest.fn(),
};

// モックのデフォルト実装を設定
mockMypageDb.fetchUserParticipatingQuests.mockResolvedValue(
	mockParticipatingQuests,
);
mockMypageDb.fetchUserClearedQuests.mockResolvedValue(mockClearedQuests);
mockMypageDb.fetchUserAppliedQuests.mockResolvedValue(mockAppliedQuests);
mockMypageDb.fetchUserById.mockResolvedValue(mockUser);
mockMypageDb.fetchUserNotifications.mockResolvedValue([mockNotification]);
