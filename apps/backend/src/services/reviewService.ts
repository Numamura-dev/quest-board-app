import { logger } from "../config/logger";
import {
	type CreateReviewData,
	ReviewDataAccessor,
	type UpdateReviewData,
} from "../dataAccessor/dbAccessor";

const reviewDataAccessor = new ReviewDataAccessor();

/**
 * クエストに紐づくレビュー一覧を取得する。
 * @param questId - 対象クエストの ID
 * @returns レビュー一覧
 */
export const getReviewsByQuestIdService = async (questId: number) => {
	const reviews = await reviewDataAccessor.findByQuestId(questId);
	return reviews;
};

/**
 * レビュー ID から 1 件取得する。
 * @param reviewId - 対象レビューの ID
 * @returns レビュー情報。見つからない場合は `null`
 */
export const getReviewByIdService = async (reviewId: number) => {
	const review = await reviewDataAccessor.findById(reviewId);
	return review;
};

/**
 * レビューを新規作成する。
 * @param data - 作成するレビュー情報
 * @returns 作成後のレビュー情報
 */
export const createReviewService = async (data: CreateReviewData) => {
	try {
		// 既存のレビューをチェック（1アカウント1投稿の制限）
		const existingReview = await reviewDataAccessor.findByUserAndQuest(
			data.reviewer_id,
			data.questId,
		);

		if (existingReview) {
			throw new Error("このクエストには既にレビューを投稿済みです。");
		}

		const review = await reviewDataAccessor.create(data);
		return review;
	} catch (error) {
		logger.error({ err: error, reviewData: data }, "レビュー作成エラー");
		throw error;
	}
};

/**
 * 既存レビューを更新する。
 * @param reviewId - 更新対象のレビュー ID
 * @param data - 更新内容
 * @returns 更新後のレビュー情報
 */
export const updateReviewService = async (
	reviewId: number,
	data: UpdateReviewData,
) => {
	const review = await reviewDataAccessor.update(reviewId, data);
	return review;
};

/**
 * レビューを削除する。
 * @param reviewId - 削除対象のレビュー ID
 * @returns 削除完了後の Promise
 */
export const deleteReviewService = async (reviewId: number) => {
	await reviewDataAccessor.delete(reviewId);
};

/**
 * ユーザーが対象クエストへレビュー済みかを判定する。
 * @param userId - 判定対象のユーザー ID
 * @param questId - 判定対象のクエスト ID
 * @returns 投稿済みなら `true`
 */
export const checkUserReviewExistsService = async (
	userId: number,
	questId: number,
) => {
	try {
		const review = await reviewDataAccessor.findByUserAndQuest(userId, questId);
		return !!review;
	} catch (error) {
		logger.error({ err: error, userId, questId }, "レビュー存在チェックエラー");
		throw error;
	}
};
