import type { Request, Response } from "express";
import { ROLES } from "../constants/roles";
import {
	QuestJoinParamSchema,
	ReviewCreateBodySchema,
	ReviewExistsQuerySchema,
	ReviewIdParamSchema,
	ReviewUpdateBodySchema,
	UserReviewParamSchema,
} from "../schemas/api";
import {
	checkUserReviewExistsService,
	createReviewService,
	deleteReviewService,
	getReviewByIdService,
	getReviewsByQuestIdService,
	updateReviewService,
} from "../services/reviewService";
import { getUserByFirebaseUidService } from "../services/userService";
import {
	badRequest,
	forbidden,
	notFound,
	unauthorized,
} from "../utils/appError";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../utils/validate";

const resolveAuthenticatedUser = async (req: Request) => {
	const firebaseUid = req.user?.uid;
	if (!firebaseUid) {
		throw unauthorized();
	}

	const user = req.appUser ?? (await getUserByFirebaseUidService(firebaseUid));
	if (!user) {
		throw forbidden("Forbidden: user not found");
	}

	req.appUser = user;
	return user;
};

/**
 * クエストに紐づくレビュー一覧を返す。
 */
export const getReviewsByQuestId = asyncHandler(
	async (req: Request, res: Response) => {
		const { params } = validateRequest(req, { params: QuestJoinParamSchema });
		const { questId } = params;
		const reviews = await getReviewsByQuestIdService(questId);
		res.json(reviews);
	},
);

/**
 * クエストへのレビューを新規作成する。
 */
export const createReview = asyncHandler(
	async (req: Request, res: Response) => {
		const { params, body } = validateRequest(req, {
			params: QuestJoinParamSchema,
			body: ReviewCreateBodySchema,
		});
		const currentUser = await resolveAuthenticatedUser(req);
		const { questId } = params;
		const { rating, comment } = body;

		try {
			const review = await createReviewService({
				questId,
				reviewer_id: currentUser.id,
				rating,
				comment,
			});

			res.status(201).json(review);
		} catch (error) {
			if (
				error instanceof Error &&
				error.message.includes("既にレビューを投稿済み")
			) {
				throw badRequest(error.message);
			}

			throw error;
		}
	},
);

/**
 * 既存レビューを更新する。
 */
export const updateReview = asyncHandler(
	async (req: Request, res: Response) => {
		const { params, body } = validateRequest(req, {
			params: ReviewIdParamSchema,
			body: ReviewUpdateBodySchema,
		});
		const currentUser = await resolveAuthenticatedUser(req);
		const { reviewId } = params;
		const { rating, comment } = body;
		const existingReview = await getReviewByIdService(reviewId);
		if (!existingReview) {
			throw notFound("Review not found");
		}
		if (
			currentUser.role !== ROLES.ADMIN &&
			existingReview.reviewer_id !== currentUser.id
		) {
			throw forbidden("Forbidden: review owner required");
		}

		const review = await updateReviewService(reviewId, {
			rating,
			comment,
		});
		res.json(review);
	},
);

/**
 * レビューを削除する。
 */
export const deleteReview = asyncHandler(
	async (req: Request, res: Response) => {
		const { params } = validateRequest(req, { params: ReviewIdParamSchema });
		const currentUser = await resolveAuthenticatedUser(req);
		const { reviewId } = params;
		const existingReview = await getReviewByIdService(reviewId);
		if (!existingReview) {
			throw notFound("Review not found");
		}
		if (
			currentUser.role !== ROLES.ADMIN &&
			existingReview.reviewer_id !== currentUser.id
		) {
			throw forbidden("Forbidden: review owner required");
		}

		await deleteReviewService(reviewId);
		res.status(204).send();
	},
);

/**
 * 指定ユーザーが対象クエストにレビュー済みかを返す。
 */
export const checkUserReviewExists = asyncHandler(
	async (req: Request, res: Response) => {
		const { params, query } = validateRequest(req, {
			params: UserReviewParamSchema,
			query: ReviewExistsQuerySchema,
		});
		const { userId } = params;
		const { questId } = query;
		const exists = await checkUserReviewExistsService(userId, questId);

		res.json({ exists });
	},
);
