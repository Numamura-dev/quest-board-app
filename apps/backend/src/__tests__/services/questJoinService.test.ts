import {
	mockPrismaClient,
	mockQuestInfo,
	mockQuestParticipant,
	mockTransaction,
} from "../mocks/questJoinService.mock";

import { addUserToQuest } from "../../services/questJoinService";

describe("questJoinService", () => {
	beforeEach(() => {
		// 各テスト前にモックをリセット
		jest.clearAllMocks();

		// デフォルトのモック実装を再設定
		mockPrismaClient.$transaction.mockImplementation((callback) => {
			return callback(mockTransaction);
		});

		mockTransaction.$queryRaw.mockResolvedValue([mockQuestInfo]);
		mockTransaction.questParticipant.findUnique.mockResolvedValue(null);
		mockTransaction.questParticipant.count.mockResolvedValue(0);
		mockTransaction.questParticipant.create.mockResolvedValue(
			mockQuestParticipant,
		);
	});

	describe("addUserToQuest", () => {
		it("正常にクエストに参加できる", async () => {
			const userId = 1;
			const questId = 1;

			const result = await addUserToQuest(userId, questId);

			expect(mockPrismaClient.$transaction).toHaveBeenCalled();
			expect(mockTransaction.$queryRaw).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.stringContaining(
						"SELECT id, max_participants as maxParticipants FROM quests WHERE id =",
					),
					expect.stringContaining("FOR UPDATE"),
				]),
				questId,
			);
			expect(mockTransaction.questParticipant.findUnique).toHaveBeenCalledWith({
				where: { user_id_quest_id: { user_id: userId, quest_id: questId } },
			});
			expect(mockTransaction.questParticipant.count).toHaveBeenCalledWith({
				where: { quest_id: questId },
			});
			expect(mockTransaction.questParticipant.create).toHaveBeenCalledWith({
				data: {
					user_id: userId,
					quest_id: questId,
				},
			});

			expect(result).toEqual({ success: true });
		});

		it("クエストが存在しない場合、not_foundエラーを返す", async () => {
			mockTransaction.$queryRaw.mockResolvedValueOnce([]);

			const userId = 1;
			const questId = 999;

			const result = await addUserToQuest(userId, questId);

			expect(result).toEqual({ success: false, reason: "not_found" });
			expect(
				mockTransaction.questParticipant.findUnique,
			).not.toHaveBeenCalled();
			expect(mockTransaction.questParticipant.count).not.toHaveBeenCalled();
			expect(mockTransaction.questParticipant.create).not.toHaveBeenCalled();
		});

		it("既に参加済みの場合、duplicateエラーを返す", async () => {
			mockTransaction.questParticipant.findUnique.mockResolvedValueOnce(
				mockQuestParticipant,
			);

			const userId = 1;
			const questId = 1;

			const result = await addUserToQuest(userId, questId);

			expect(result).toEqual({ success: false, reason: "duplicate" });
			expect(mockTransaction.questParticipant.count).not.toHaveBeenCalled();
			expect(mockTransaction.questParticipant.create).not.toHaveBeenCalled();
		});

		it("クエストが満員の場合、fullエラーを返す", async () => {
			const questWithMaxParticipants = {
				...mockQuestInfo,
				maxParticipants: 3,
			};
			mockTransaction.$queryRaw.mockResolvedValueOnce([
				questWithMaxParticipants,
			]);
			mockTransaction.questParticipant.count.mockResolvedValueOnce(3);

			const userId = 1;
			const questId = 1;

			const result = await addUserToQuest(userId, questId);

			expect(result).toEqual({ success: false, reason: "full" });
			expect(mockTransaction.questParticipant.create).not.toHaveBeenCalled();
		});

		it("maxParticipantsがnullの場合、参加人数制限なしで参加できる", async () => {
			const questWithoutMaxParticipants = {
				...mockQuestInfo,
				maxParticipants: null,
			};
			mockTransaction.$queryRaw.mockResolvedValueOnce([
				questWithoutMaxParticipants,
			]);
			mockTransaction.questParticipant.count.mockResolvedValueOnce(10);

			const userId = 1;
			const questId = 1;

			const result = await addUserToQuest(userId, questId);

			expect(result).toEqual({ success: true });
			expect(mockTransaction.questParticipant.create).toHaveBeenCalledWith({
				data: {
					user_id: userId,
					quest_id: questId,
				},
			});
		});

		it("参加人数が上限未満の場合、参加できる", async () => {
			const questWithMaxParticipants = {
				...mockQuestInfo,
				maxParticipants: 5,
			};
			mockTransaction.$queryRaw.mockResolvedValueOnce([
				questWithMaxParticipants,
			]);
			mockTransaction.questParticipant.count.mockResolvedValueOnce(3);

			const userId = 1;
			const questId = 1;

			const result = await addUserToQuest(userId, questId);

			expect(result).toEqual({ success: true });
			expect(mockTransaction.questParticipant.create).toHaveBeenCalledWith({
				data: {
					user_id: userId,
					quest_id: questId,
				},
			});
		});

		it("参加人数が上限ちょうどの場合、参加できない", async () => {
			const questWithMaxParticipants = {
				...mockQuestInfo,
				maxParticipants: 5,
			};
			mockTransaction.$queryRaw.mockResolvedValueOnce([
				questWithMaxParticipants,
			]);
			mockTransaction.questParticipant.count.mockResolvedValueOnce(5);

			const userId = 1;
			const questId = 1;

			const result = await addUserToQuest(userId, questId);

			expect(result).toEqual({ success: false, reason: "full" });
			expect(mockTransaction.questParticipant.create).not.toHaveBeenCalled();
		});

		it("データベースエラーが発生した場合、errorエラーを返す", async () => {
			const error = new Error("Database connection failed");
			mockTransaction.$queryRaw.mockRejectedValueOnce(error);

			const userId = 1;
			const questId = 1;

			const result = await addUserToQuest(userId, questId);

			expect(result).toEqual({ success: false, reason: "error" });
		});

		it("未知のエラーが発生した場合、errorエラーを返す", async () => {
			const error = new Error("Unknown error");
			mockTransaction.questParticipant.create.mockRejectedValueOnce(error);

			const userId = 1;
			const questId = 1;

			const result = await addUserToQuest(userId, questId);

			expect(result).toEqual({ success: false, reason: "error" });
		});

		it("Error以外の例外が発生した場合、errorエラーを返す", async () => {
			const error = "String error";
			mockTransaction.$queryRaw.mockRejectedValueOnce(error);

			const userId = 1;
			const questId = 1;

			const result = await addUserToQuest(userId, questId);

			expect(result).toEqual({ success: false, reason: "error" });
		});
	});

	describe("トランザクション処理のテスト", () => {
		it("トランザクション内で全ての処理が順序通りに実行される", async () => {
			const userId = 1;
			const questId = 1;

			await addUserToQuest(userId, questId);

			// 実行順序を確認
			const calls = mockTransaction.$queryRaw.mock.calls;
			expect(calls[0][0][0]).toContain(
				"SELECT id, max_participants as maxParticipants FROM quests WHERE id =",
			);

			const findUniqueCalls =
				mockTransaction.questParticipant.findUnique.mock.calls;
			expect(findUniqueCalls[0][0]).toEqual({
				where: { user_id_quest_id: { user_id: userId, quest_id: questId } },
			});

			const countCalls = mockTransaction.questParticipant.count.mock.calls;
			expect(countCalls[0][0]).toEqual({
				where: { quest_id: questId },
			});

			const createCalls = mockTransaction.questParticipant.create.mock.calls;
			expect(createCalls[0][0]).toEqual({
				data: {
					user_id: userId,
					quest_id: questId,
				},
			});
		});

		it("トランザクション内でエラーが発生した場合、ロールバックされる", async () => {
			const error = new Error("Transaction failed");
			mockTransaction.questParticipant.create.mockRejectedValueOnce(error);

			const userId = 1;
			const questId = 1;

			const result = await addUserToQuest(userId, questId);

			expect(result).toEqual({ success: false, reason: "error" });
			// トランザクションが呼ばれていることを確認
			expect(mockPrismaClient.$transaction).toHaveBeenCalled();
		});
	});

	describe("エッジケースのテスト", () => {
		it("userIdが0の場合でも正常に処理される", async () => {
			const userId = 0;
			const questId = 1;

			const result = await addUserToQuest(userId, questId);

			expect(result).toEqual({ success: true });
			expect(mockTransaction.questParticipant.create).toHaveBeenCalledWith({
				data: {
					user_id: userId,
					quest_id: questId,
				},
			});
		});

		it("questIdが0の場合でも正常に処理される", async () => {
			const userId = 1;
			const questId = 0;

			const result = await addUserToQuest(userId, questId);

			expect(result).toEqual({ success: true });
			expect(mockTransaction.questParticipant.create).toHaveBeenCalledWith({
				data: {
					user_id: userId,
					quest_id: questId,
				},
			});
		});

		it("maxParticipantsが0の場合、参加できない", async () => {
			const questWithZeroMaxParticipants = {
				...mockQuestInfo,
				maxParticipants: 0,
			};
			mockTransaction.$queryRaw.mockResolvedValueOnce([
				questWithZeroMaxParticipants,
			]);
			mockTransaction.questParticipant.count.mockResolvedValueOnce(0);

			const userId = 1;
			const questId = 1;

			const result = await addUserToQuest(userId, questId);

			expect(result).toEqual({ success: false, reason: "full" });
			expect(mockTransaction.questParticipant.create).not.toHaveBeenCalled();
		});
	});
});
