import { Prisma } from "@prisma/client";
import {
	mockCreateReviewData,
	mockReview,
	mockReviewDataAccessor,
	mockReviewList,
	mockReviewWithRelations,
	mockUpdateReviewData,
} from "../mocks/ReviewDataAccessor.mock";

// ReviewDataAccessorをモック化
jest.mock("../../dataAccessor/dbAccessor", () => ({
	ReviewDataAccessor: jest
		.fn()
		.mockImplementation(() => mockReviewDataAccessor),
}));

import {
	checkUserReviewExistsService,
	createReviewService,
	deleteReviewService,
	getReviewsByQuestIdService,
	updateReviewService,
} from "../../services/reviewService";

describe("reviewService", () => {
	beforeEach(() => {
		// 各テスト前にモックをリセット
		jest.clearAllMocks();
	});

	describe("getReviewsByQuestIdService", () => {
		it("クエストIDでレビュー一覧を取得できる", async () => {
			const questId = 1;
			const result = await getReviewsByQuestIdService(questId);

			expect(mockReviewDataAccessor.findByQuestId).toHaveBeenCalledWith(
				questId,
			);
			expect(result).toEqual(mockReviewList);
		});

		it("レビューが存在しない場合、空の配列を返す", async () => {
			mockReviewDataAccessor.findByQuestId.mockResolvedValueOnce([]);

			const questId = 999;
			const result = await getReviewsByQuestIdService(questId);

			expect(mockReviewDataAccessor.findByQuestId).toHaveBeenCalledWith(
				questId,
			);
			expect(result).toEqual([]);
		});

		it("複数のレビューがある場合、全て返される", async () => {
			const multipleReviews = [
				mockReviewWithRelations,
				{
					...mockReviewWithRelations,
					id: 2,
					reviewer_id: 2,
					rating: new Prisma.Decimal(3.0),
					comment: "普通でした",
					reviewer: {
						id: 2,
						name: "ユーザー2",
					},
				},
				{
					...mockReviewWithRelations,
					id: 3,
					reviewer_id: 3,
					rating: new Prisma.Decimal(5.0),
					comment: "最高でした",
					reviewer: {
						id: 3,
						name: "ユーザー3",
					},
				},
			];

			mockReviewDataAccessor.findByQuestId.mockResolvedValueOnce(
				multipleReviews,
			);

			const questId = 1;
			const result = await getReviewsByQuestIdService(questId);

			expect(result).toHaveLength(3);
			expect(result[0].rating).toEqual(new Prisma.Decimal(4.5));
			expect(result[1].rating).toEqual(new Prisma.Decimal(3.0));
			expect(result[2].rating).toEqual(new Prisma.Decimal(5.0));
		});
	});

	describe("createReviewService", () => {
		it("新しいレビューを作成できる", async () => {
			const result = await createReviewService(mockCreateReviewData);

			expect(mockReviewDataAccessor.findByUserAndQuest).toHaveBeenCalledWith(
				mockCreateReviewData.reviewer_id,
				mockCreateReviewData.questId,
			);
			expect(mockReviewDataAccessor.create).toHaveBeenCalledWith(
				mockCreateReviewData,
			);
			expect(result).toEqual(mockReviewWithRelations);
		});

		it("既にレビューが存在する場合、エラーを投げる", async () => {
			mockReviewDataAccessor.findByUserAndQuest.mockResolvedValueOnce(
				mockReview,
			);

			await expect(createReviewService(mockCreateReviewData)).rejects.toThrow(
				"このクエストには既にレビューを投稿済みです。",
			);

			expect(mockReviewDataAccessor.findByUserAndQuest).toHaveBeenCalledWith(
				mockCreateReviewData.reviewer_id,
				mockCreateReviewData.questId,
			);
			expect(mockReviewDataAccessor.create).not.toHaveBeenCalled();
		});

		it("コメントなしのレビューを作成できる", async () => {
			const reviewDataWithoutComment = {
				...mockCreateReviewData,
				comment: undefined,
			};

			const result = await createReviewService(reviewDataWithoutComment);

			expect(mockReviewDataAccessor.create).toHaveBeenCalledWith(
				reviewDataWithoutComment,
			);
			expect(result).toEqual(mockReviewWithRelations);
		});

		it("データベースエラーが発生した場合、エラーが再スローされる", async () => {
			const error = new Error("データベースエラー");
			mockReviewDataAccessor.create.mockRejectedValueOnce(error);

			await expect(createReviewService(mockCreateReviewData)).rejects.toThrow(
				"データベースエラー",
			);
		});
	});

	describe("updateReviewService", () => {
		it("既存のレビューを更新できる", async () => {
			const reviewId = 1;
			const result = await updateReviewService(reviewId, mockUpdateReviewData);

			expect(mockReviewDataAccessor.update).toHaveBeenCalledWith(
				reviewId,
				mockUpdateReviewData,
			);
			expect(result).toEqual(mockReviewWithRelations);
		});

		it("コメントなしでレビューを更新できる", async () => {
			const reviewId = 1;
			const updateDataWithoutComment = {
				rating: 4.0,
				comment: undefined,
			};

			const result = await updateReviewService(
				reviewId,
				updateDataWithoutComment,
			);

			expect(mockReviewDataAccessor.update).toHaveBeenCalledWith(
				reviewId,
				updateDataWithoutComment,
			);
			expect(result).toEqual(mockReviewWithRelations);
		});

		it("存在しないレビューIDで更新しようとした場合、エラーが発生する", async () => {
			const error = new Error("レビューが見つかりません");
			mockReviewDataAccessor.update.mockRejectedValueOnce(error);

			const reviewId = 999;
			await expect(
				updateReviewService(reviewId, mockUpdateReviewData),
			).rejects.toThrow("レビューが見つかりません");
		});
	});

	describe("deleteReviewService", () => {
		it("レビューを削除できる", async () => {
			const reviewId = 1;
			await deleteReviewService(reviewId);

			expect(mockReviewDataAccessor.delete).toHaveBeenCalledWith(reviewId);
		});

		it("存在しないレビューIDで削除しようとした場合、エラーが発生する", async () => {
			const error = new Error("レビューが見つかりません");
			mockReviewDataAccessor.delete.mockRejectedValueOnce(error);

			const reviewId = 999;
			await expect(deleteReviewService(reviewId)).rejects.toThrow(
				"レビューが見つかりません",
			);
		});
	});

	describe("checkUserReviewExistsService", () => {
		it("ユーザーがレビューを投稿済みの場合、trueを返す", async () => {
			mockReviewDataAccessor.findByUserAndQuest.mockResolvedValueOnce(
				mockReview,
			);

			const userId = 1;
			const questId = 1;
			const result = await checkUserReviewExistsService(userId, questId);

			expect(mockReviewDataAccessor.findByUserAndQuest).toHaveBeenCalledWith(
				userId,
				questId,
			);
			expect(result).toBe(true);
		});

		it("ユーザーがレビューを投稿していない場合、falseを返す", async () => {
			mockReviewDataAccessor.findByUserAndQuest.mockResolvedValueOnce(null);

			const userId = 1;
			const questId = 1;
			const result = await checkUserReviewExistsService(userId, questId);

			expect(mockReviewDataAccessor.findByUserAndQuest).toHaveBeenCalledWith(
				userId,
				questId,
			);
			expect(result).toBe(false);
		});

		it("データベースエラーが発生した場合、エラーが再スローされる", async () => {
			const error = new Error("データベースエラー");
			mockReviewDataAccessor.findByUserAndQuest.mockRejectedValueOnce(error);

			const userId = 1;
			const questId = 1;

			await expect(
				checkUserReviewExistsService(userId, questId),
			).rejects.toThrow("データベースエラー");
		});
	});

	describe("エラーハンドリング", () => {
		it("getReviewsByQuestIdServiceでエラーが発生した場合、エラーが再スローされる", async () => {
			const error = new Error("データベースエラー");
			mockReviewDataAccessor.findByQuestId.mockRejectedValueOnce(error);

			await expect(getReviewsByQuestIdService(1)).rejects.toThrow(
				"データベースエラー",
			);
		});

		it("createReviewServiceでデータベースエラーが発生した場合、エラーが再スローされる", async () => {
			const error = new Error("データベースエラー");
			mockReviewDataAccessor.create.mockRejectedValueOnce(error);

			await expect(createReviewService(mockCreateReviewData)).rejects.toThrow(
				"データベースエラー",
			);
		});

		it("updateReviewServiceでエラーが発生した場合、エラーが再スローされる", async () => {
			const error = new Error("データベースエラー");
			mockReviewDataAccessor.update.mockRejectedValueOnce(error);

			await expect(
				updateReviewService(1, mockUpdateReviewData),
			).rejects.toThrow("データベースエラー");
		});

		it("deleteReviewServiceでエラーが発生した場合、エラーが再スローされる", async () => {
			const error = new Error("データベースエラー");
			mockReviewDataAccessor.delete.mockRejectedValueOnce(error);

			await expect(deleteReviewService(1)).rejects.toThrow(
				"データベースエラー",
			);
		});
	});

	describe("データ変換のテスト", () => {
		it("getReviewsByQuestIdServiceでレビューデータが正しく変換される", async () => {
			const customReview = {
				...mockReviewWithRelations,
				id: 10,
				rating: new Prisma.Decimal(2.5),
				comment: "カスタムレビュー",
				reviewer: {
					id: 10,
					name: "カスタムユーザー",
				},
			};

			mockReviewDataAccessor.findByQuestId.mockResolvedValueOnce([
				customReview,
			]);

			const result = await getReviewsByQuestIdService(1);

			expect(result[0]).toEqual({
				id: 10,
				reviewer_id: 1,
				guest_id: null,
				rating: new Prisma.Decimal(2.5),
				comment: "カスタムレビュー",
				created_at: new Date("2024-01-01"),
				quest_id: 1,
				reviewer: {
					id: 10,
					name: "カスタムユーザー",
				},
			});
		});

		it("createReviewServiceでレビュー作成データが正しく渡される", async () => {
			const customCreateData = {
				questId: 5,
				reviewer_id: 5,
				rating: 4.0,
				comment: "カスタムコメント",
			};

			const result = await createReviewService(customCreateData);

			expect(mockReviewDataAccessor.findByUserAndQuest).toHaveBeenCalledWith(
				5,
				5,
			);
			expect(mockReviewDataAccessor.create).toHaveBeenCalledWith(
				customCreateData,
			);
			expect(result).toEqual(mockReviewWithRelations);
		});

		it("updateReviewServiceでレビュー更新データが正しく渡される", async () => {
			const customUpdateData = {
				rating: 3.5,
				comment: "更新されたコメント",
			};

			const result = await updateReviewService(5, customUpdateData);

			expect(mockReviewDataAccessor.update).toHaveBeenCalledWith(
				5,
				customUpdateData,
			);
			expect(result).toEqual(mockReviewWithRelations);
		});
	});
});
