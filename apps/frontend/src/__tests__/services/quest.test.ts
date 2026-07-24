import { describe, it, expect, vi, beforeEach } from "vitest";
import { questService } from "@/services/quest";
import { QuestStatus, QuestType } from "@/types/quest";
import type { Quest } from "@/types/quest";

// httpClient をモック化
vi.mock("@/services/httpClient", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
	authenticatedApiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

import { apiClient, authenticatedApiClient } from "@/services/httpClient";

const mockQuest: Quest = {
	id: 1,
	title: "テストクエスト",
	description: "テスト説明",
	type: QuestType.Development,
	status: QuestStatus.Active,
	start_date: "2024-01-01T00:00:00Z",
	end_date: "2024-12-31T00:00:00Z",
	created_at: "2024-01-01T00:00:00Z",
	updated_at: "2024-01-01T00:00:00Z",
	rewards: { incentive_amount: 10000, point_amount: 100, note: "" },
	quest_participants: [],
	_count: { quest_participants: 0 },
	maxParticipants: 5,
	tags: ["TypeScript"],
};

describe("questService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getQuestById", () => {
		it("指定 ID のクエストを取得する", async () => {
			vi.mocked(apiClient.get).mockResolvedValueOnce(mockQuest);

			const result = await questService.getQuestById("1");

			expect(apiClient.get).toHaveBeenCalledWith("/quests/1");
			expect(result).toEqual(mockQuest);
		});
	});

	describe("getAllQuests", () => {
		it("全クエストを取得する", async () => {
			vi.mocked(apiClient.get).mockResolvedValueOnce([mockQuest]);

			const result = await questService.getAllQuests();

			expect(apiClient.get).toHaveBeenCalledWith("/quests", undefined);
			expect(result).toEqual([mockQuest]);
		});

		it("フィルタパラメータを渡して取得する", async () => {
			vi.mocked(apiClient.get).mockResolvedValueOnce([mockQuest]);

			await questService.getAllQuests({ status: "active", keyword: "test" });

			expect(apiClient.get).toHaveBeenCalledWith("/quests", {
				status: "active",
				keyword: "test",
			});
		});
	});

	describe("updateQuestStatus", () => {
		it("認証付きでステータスを更新する", async () => {
			const updated = { ...mockQuest, status: QuestStatus.Inactive };
			vi.mocked(authenticatedApiClient.patch).mockResolvedValueOnce(updated);

			const result = await questService.updateQuestStatus("1", "inactive");

			expect(authenticatedApiClient.patch).toHaveBeenCalledWith(
				"/quests/1/status",
				{ status: "inactive" },
			);
			expect(result).toEqual(updated);
		});
	});

	describe("deleteQuest", () => {
		it("認証付きでクエストを削除する", async () => {
			vi.mocked(authenticatedApiClient.delete).mockResolvedValueOnce({
				message: "deleted",
			});

			const result = await questService.deleteQuest("1");

			expect(authenticatedApiClient.delete).toHaveBeenCalledWith("/quests/1");
			expect(result).toEqual({ message: "deleted" });
		});
	});

	describe("getAllQuestsIncludingDeleted", () => {
		it("管理者用エンドポイントを認証付きで呼ぶ", async () => {
			vi.mocked(authenticatedApiClient.get).mockResolvedValueOnce([mockQuest]);

			await questService.getAllQuestsIncludingDeleted();

			expect(authenticatedApiClient.get).toHaveBeenCalledWith(
				"/quests",
				{ includeDeleted: true },
			);
		});
	});

	describe("reactivateQuest", () => {
		it("再公開エンドポイントを POST で呼ぶ", async () => {
			vi.mocked(authenticatedApiClient.post).mockResolvedValueOnce({
				message: "reactivated",
				quest: mockQuest,
			});

			const result = await questService.reactivateQuest("1");

			expect(authenticatedApiClient.post).toHaveBeenCalledWith(
				"/quests/1/activations",
				{},
			);
			expect(result).toEqual({
				message: "reactivated",
				quest: mockQuest,
			});
		});
	});
});
