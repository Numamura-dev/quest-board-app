import { type Review, User } from "@prisma/client";
import { prisma } from "../../config/db";

/**
 * ReviewWithRelations - レビューとその関連データを統合した拡張インターフェース
 */
export interface ReviewWithRelations extends Review {
	// レビュアー情報
	reviewer: {
		id: number;
		name: string;
	};
}

/**
 * レビュー作成用のデータインターフェース
 */
export interface CreateReviewData {
	questId: number;
	reviewer_id: number;
	rating: number;
	comment?: string;
}

/**
 * レビュー更新用のデータインターフェース
 */
export interface UpdateReviewData {
	rating: number;
	comment?: string;
}

/**
 * レビューテーブルと関連ユーザー情報へのアクセスを提供する。
 */
export class ReviewDataAccessor {
	/**
	 * レビューIDで1件取得
	 *
	 * @param reviewId - 取得するレビューのID
	 * @returns レビュー情報。存在しない場合はnull
	 */
	async findById(reviewId: number): Promise<Review | null> {
		return await prisma.review.findUnique({
			where: {
				id: reviewId,
			},
		});
	}

	/**
	 * クエストIDでレビュー一覧取得
	 *
	 * @param questId - クエストのID
	 * @returns レビュアー情報を含むレビュー一覧（作成日順で降順）
	 */
	async findByQuestId(questId: number): Promise<ReviewWithRelations[]> {
		const reviews = await prisma.review.findMany({
			where: {
				quest_id: questId,
			},
			include: {
				reviewer: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: {
				created_at: "desc",
			},
		});

		return reviews as ReviewWithRelations[];
	}

	/**
	 * レビュー作成
	 *
	 * @param data - 作成するレビューのデータ
	 * @returns 作成されたレビュー情報（レビュアー情報含む）
	 */
	async create(data: CreateReviewData): Promise<ReviewWithRelations> {
		const review = await prisma.review.create({
			data: {
				reviewer_id: data.reviewer_id,
				quest_id: data.questId,
				rating: data.rating,
				comment: data.comment,
			},
			include: {
				reviewer: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return review as ReviewWithRelations;
	}

	/**
	 * レビュー更新
	 *
	 * @param reviewId - 更新するレビューのID
	 * @param data - 更新データ
	 * @returns 更新後のレビュー情報（レビュアー情報含む）
	 */
	async update(
		reviewId: number,
		data: UpdateReviewData,
	): Promise<ReviewWithRelations> {
		const review = await prisma.review.update({
			where: {
				id: reviewId,
			},
			data: {
				rating: data.rating,
				comment: data.comment,
			},
			include: {
				reviewer: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return review as ReviewWithRelations;
	}

	/**
	 * レビュー削除
	 *
	 * @param reviewId - 削除するレビューのID
	 * @returns 削除されたレビュー情報
	 */
	async delete(reviewId: number): Promise<Review> {
		return await prisma.review.delete({
			where: {
				id: reviewId,
			},
		});
	}

	/**
	 * ユーザーが特定のクエストにレビュー投稿済みかチェック
	 *
	 * @param userId - ユーザーのID
	 * @param questId - クエストのID
	 * @returns レビューが存在する場合はレビュー情報、存在しない場合はnull
	 */
	async findByUserAndQuest(
		userId: number,
		questId: number,
	): Promise<Review | null> {
		return await prisma.review.findFirst({
			where: {
				reviewer_id: userId,
				quest_id: questId,
			},
		});
	}
}
