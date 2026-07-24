import {
	mockAppliedQuests,
	mockClearedQuests,
	mockMypageDb,
	mockNotification,
	mockParticipatingQuests,
	mockUser,
} from "../mocks/mypageDb.mock";

jest.mock("../../dataAccessor/dbAccessor", () => ({
	MypageDataAccessor: jest.fn(() => mockMypageDb),
}));

import { mypageService } from "../../services/mypageService";

describe("mypageService", () => {
	beforeEach(() => {
		// 各テスト前にモックをリセット
		jest.clearAllMocks();
	});

	describe("getUserEntries", () => {
		it("ユーザーの参加中・達成済み・応募中のクエストを取得できる", async () => {
			const userId = 1;
			const result = await mypageService.getUserEntries(userId);

			expect(mockMypageDb.fetchUserParticipatingQuests).toHaveBeenCalledWith(
				userId,
			);
			expect(mockMypageDb.fetchUserClearedQuests).toHaveBeenCalledWith(userId);
			expect(mockMypageDb.fetchUserAppliedQuests).toHaveBeenCalledWith(userId);

			expect(result).toEqual({
				participating: [
					{
						id: 1,
						title: "テストクエスト",
						status: "participating",
						joinedAt: new Date("2024-01-01"),
					},
				],
				completed: [
					{
						id: 2,
						title: "達成済みクエスト",
						status: "cleared",
						clearedAt: new Date("2024-01-15"),
					},
				],
				applied: [
					{
						id: 3,
						title: "応募中クエスト",
						status: "applied",
						appliedAt: new Date("2024-01-01"),
					},
				],
			});
		});

		it("参加中クエストが空の場合、空の配列を返す", async () => {
			mockMypageDb.fetchUserParticipatingQuests.mockResolvedValueOnce([]);
			mockMypageDb.fetchUserClearedQuests.mockResolvedValueOnce([]);
			mockMypageDb.fetchUserAppliedQuests.mockResolvedValueOnce([]);

			const userId = 1;
			const result = await mypageService.getUserEntries(userId);

			expect(result).toEqual({
				participating: [],
				completed: [],
				applied: [],
			});
		});

		it("複数の参加中クエストがある場合、全て返される", async () => {
			const multipleParticipatingQuests = [
				{
					...mockParticipatingQuests[0],
					id: 1,
					quest: {
						...mockParticipatingQuests[0].quest,
						id: 1,
						title: "クエスト1",
					},
				},
				{
					...mockParticipatingQuests[0],
					id: 2,
					quest: {
						...mockParticipatingQuests[0].quest,
						id: 2,
						title: "クエスト2",
					},
				},
			];

			mockMypageDb.fetchUserParticipatingQuests.mockResolvedValueOnce(
				multipleParticipatingQuests,
			);
			mockMypageDb.fetchUserClearedQuests.mockResolvedValueOnce([]);
			mockMypageDb.fetchUserAppliedQuests.mockResolvedValueOnce([]);

			const userId = 1;
			const result = await mypageService.getUserEntries(userId);

			expect(result.participating).toHaveLength(2);
			expect(result.participating[0].title).toBe("クエスト1");
			expect(result.participating[1].title).toBe("クエスト2");
		});
	});

	describe("getUserProfile", () => {
		it("ユーザー情報を取得できる", async () => {
			const userId = 1;
			const result = await mypageService.getUserProfile(userId);

			expect(mockMypageDb.fetchUserById).toHaveBeenCalledWith(userId);
			expect(result).toEqual({
				id: 1,
				name: "テストユーザー",
				email: "test@example.com",
				role: "user",
			});
		});

		it("ユーザーが存在しない場合、nullを返す", async () => {
			mockMypageDb.fetchUserById.mockResolvedValueOnce(null);

			const userId = 999;
			const result = await mypageService.getUserProfile(userId);

			expect(mockMypageDb.fetchUserById).toHaveBeenCalledWith(userId);
			expect(result).toBeNull();
		});

		it("管理者ユーザーの情報を取得できる", async () => {
			const adminUser = {
				...mockUser,
				role: "admin",
				name: "管理者ユーザー",
			};

			mockMypageDb.fetchUserById.mockResolvedValueOnce(adminUser);

			const userId = 1;
			const result = await mypageService.getUserProfile(userId);

			expect(result).toEqual({
				id: 1,
				name: "管理者ユーザー",
				email: "test@example.com",
				role: "admin",
			});
		});
	});

	describe("getUserNotifications", () => {
		it("ユーザーの通知一覧を取得できる", async () => {
			const userId = 1;
			const result = await mypageService.getUserNotifications(userId);

			expect(mockMypageDb.fetchUserNotifications).toHaveBeenCalledWith(userId);
			expect(result).toEqual([
				{
					id: 1,
					message: "新しいクエストが追加されました",
					isRead: false,
					createdAt: new Date("2024-01-01"),
				},
			]);
		});

		it("通知が空の場合、空の配列を返す", async () => {
			mockMypageDb.fetchUserNotifications.mockResolvedValueOnce([]);

			const userId = 1;
			const result = await mypageService.getUserNotifications(userId);

			expect(result).toEqual([]);
		});

		it("複数の通知がある場合、全て返される", async () => {
			const multipleNotifications = [
				mockNotification,
				{
					...mockNotification,
					id: 2,
					message: "クエストが完了しました",
					is_read: true,
					read_at: new Date("2024-01-02"),
				},
			];

			mockMypageDb.fetchUserNotifications.mockResolvedValueOnce(
				multipleNotifications,
			);

			const userId = 1;
			const result = await mypageService.getUserNotifications(userId);

			expect(result).toHaveLength(2);
			expect(result[0].isRead).toBe(false);
			expect(result[1].isRead).toBe(true);
		});

		it("既読・未読の通知が混在している場合、正しく変換される", async () => {
			const mixedNotifications = [
				{
					...mockNotification,
					id: 1,
					is_read: false,
					read_at: null,
				},
				{
					...mockNotification,
					id: 2,
					is_read: true,
					read_at: new Date("2024-01-02"),
				},
			];

			mockMypageDb.fetchUserNotifications.mockResolvedValueOnce(
				mixedNotifications,
			);

			const userId = 1;
			const result = await mypageService.getUserNotifications(userId);

			expect(result[0].isRead).toBe(false);
			expect(result[1].isRead).toBe(true);
		});
	});

	describe("エラーハンドリング", () => {
		it("getUserEntriesでエラーが発生した場合、エラーが再スローされる", async () => {
			const error = new Error("データベースエラー");
			mockMypageDb.fetchUserParticipatingQuests.mockRejectedValueOnce(error);

			await expect(mypageService.getUserEntries(1)).rejects.toThrow(
				"データベースエラー",
			);
		});

		it("getUserProfileでエラーが発生した場合、エラーが再スローされる", async () => {
			const error = new Error("データベースエラー");
			mockMypageDb.fetchUserById.mockRejectedValueOnce(error);

			await expect(mypageService.getUserProfile(1)).rejects.toThrow(
				"データベースエラー",
			);
		});

		it("getUserNotificationsでエラーが発生した場合、エラーが再スローされる", async () => {
			const error = new Error("データベースエラー");
			mockMypageDb.fetchUserNotifications.mockRejectedValueOnce(error);

			await expect(mypageService.getUserNotifications(1)).rejects.toThrow(
				"データベースエラー",
			);
		});
	});

	describe("データ変換のテスト", () => {
		it("getUserEntriesで参加中クエストのデータが正しく変換される", async () => {
			const customParticipatingQuest = {
				...mockParticipatingQuests[0],
				quest: {
					...mockParticipatingQuests[0].quest,
					id: 10,
					title: "カスタムクエスト",
				},
				joined_at: new Date("2024-02-01"),
			};

			mockMypageDb.fetchUserParticipatingQuests.mockResolvedValueOnce([
				customParticipatingQuest,
			]);
			mockMypageDb.fetchUserClearedQuests.mockResolvedValueOnce([]);
			mockMypageDb.fetchUserAppliedQuests.mockResolvedValueOnce([]);

			const result = await mypageService.getUserEntries(1);

			expect(result.participating[0]).toEqual({
				id: 10,
				title: "カスタムクエスト",
				status: "participating",
				joinedAt: new Date("2024-02-01"),
			});
		});

		it("getUserEntriesで達成済みクエストのデータが正しく変換される", async () => {
			const customClearedQuest = {
				...mockClearedQuests[0],
				quest: {
					...mockClearedQuests[0].quest,
					id: 20,
					title: "カスタム達成クエスト",
				},
				cleared_at: new Date("2024-02-15"),
			};

			mockMypageDb.fetchUserParticipatingQuests.mockResolvedValueOnce([]);
			mockMypageDb.fetchUserClearedQuests.mockResolvedValueOnce([
				customClearedQuest,
			]);
			mockMypageDb.fetchUserAppliedQuests.mockResolvedValueOnce([]);

			const result = await mypageService.getUserEntries(1);

			expect(result.completed[0]).toEqual({
				id: 20,
				title: "カスタム達成クエスト",
				status: "cleared",
				clearedAt: new Date("2024-02-15"),
			});
		});

		it("getUserEntriesで応募中クエストのデータが正しく変換される", async () => {
			const customAppliedQuest = {
				...mockAppliedQuests[0],
				quest: {
					...mockAppliedQuests[0].quest,
					id: 30,
					title: "カスタム応募クエスト",
				},
				applied_at: new Date("2024-02-01"),
			};

			mockMypageDb.fetchUserParticipatingQuests.mockResolvedValueOnce([]);
			mockMypageDb.fetchUserClearedQuests.mockResolvedValueOnce([]);
			mockMypageDb.fetchUserAppliedQuests.mockResolvedValueOnce([
				customAppliedQuest,
			]);

			const result = await mypageService.getUserEntries(1);

			expect(result.applied[0]).toEqual({
				id: 30,
				title: "カスタム応募クエスト",
				status: "applied",
				appliedAt: new Date("2024-02-01"),
			});
		});
	});
});
