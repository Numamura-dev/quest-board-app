import type { Request, Response } from "express";
import { ROLES } from "../constants/roles";
import {
	QuestIdParamSchema,
	QuestListQuerySchema,
	QuestMutationBodySchema,
	QuestStatusBodySchema,
} from "../schemas/api";
import {
	createQuestService,
	deleteQuestService,
	getAllQuestsIncludingDeletedService,
	getAllQuestsService,
	getQuestByIdIncludingDeletedService,
	getQuestByIdService,
	restoreQuestService,
	updateQuestService,
	updateQuestStatusService,
} from "../services/questService";
import { getUserByFirebaseUidService } from "../services/userService";
import { badRequest, forbidden, unauthorized, notFound } from "../utils/appError";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../utils/validate";

/**
 * 公開クエスト一覧を返す。
 */
export const getAllQuests = asyncHandler(
	async (req: Request, res: Response) => {
		const { query } = validateRequest(req, { query: QuestListQuerySchema });
		const filters = {
			keyword: query.keyword,
			status: query.status,
		};

		if (query.includeDeleted) {
			if (!req.user?.uid) {
				throw unauthorized();
			}

			const user = await getUserByFirebaseUidService(req.user.uid);
			if (!user || user.role !== ROLES.ADMIN) {
				throw forbidden("Forbidden: admin access required");
			}

			const quests = await getAllQuestsIncludingDeletedService(filters);
			res.json(quests);
			return;
		}

		const quests = await getAllQuestsService(filters);
		res.json(quests);
	},
);

/**
 * クエストのステータスを更新する。
 */
export const updateQuestStatus = asyncHandler(
	async (req: Request, res: Response) => {
		const { params, body } = validateRequest(req, {
			params: QuestIdParamSchema,
			body: QuestStatusBodySchema,
		});
		const { id } = params;
		const { status } = body;

		const quest = await updateQuestStatusService(id, status);
		res.json(quest);
	},
);

/**
 * クエスト詳細を 1 件返す。
 */
export const getQuestById = asyncHandler(
	async (req: Request, res: Response) => {
		const { params } = validateRequest(req, { params: QuestIdParamSchema });
		const quest = await getQuestByIdService(params.id);
		if (!quest) {
			throw notFound("Quest not found");
		}

		res.json(quest);
	},
);

/**
 * クエストを新規作成する。
 * 一般ユーザーが status 未指定で作成した場合は pending に補正する。
 */
export const createQuest = asyncHandler(async (req: Request, res: Response) => {
	const { body } = validateRequest(req, { body: QuestMutationBodySchema });
	const {
		title,
		description,
		type,
		status,
		maxParticipants,
		tags = [],
		start_date,
		end_date,
		incentive_amount,
		point_amount,
		note,
	} = body;

	let finalStatus = status || "draft";

	if (req.user?.uid) {
		const user = await getUserByFirebaseUidService(req.user.uid);

		if (user) {
			// 一般ユーザー作成分は自動的に承認待ちへ寄せる。
			if (user.role === ROLES.USER && !status) {
				finalStatus = "pending";
			} else if (user.role === ROLES.ADMIN) {
				finalStatus = status || "draft";
			}
		}
	}

	const quest = await createQuestService({
		title,
		description,
		type,
		status: finalStatus,
		maxParticipants,
		tags,
		start_date: new Date(start_date),
		end_date: new Date(end_date),
		incentive_amount,
		point_amount,
		note,
	});

	res.status(201).json(quest);
});

/**
 * 既存クエストを更新する。
 */
export const updateQuest = asyncHandler(async (req: Request, res: Response) => {
	const { params, body } = validateRequest(req, {
		params: QuestIdParamSchema,
		body: QuestMutationBodySchema,
	});
	const { id } = params;
	const {
		title,
		description,
		type,
		status,
		maxParticipants,
		tags = [],
		start_date,
		end_date,
		incentive_amount,
		point_amount,
		note,
	} = body;

	try {
		const quest = await updateQuestService(id, {
			title,
			description,
			type,
			status: status || "draft",
			maxParticipants,
			tags,
			start_date: new Date(start_date),
			end_date: new Date(end_date),
			incentive_amount,
			point_amount,
			note,
		});

		res.json(quest);
	} catch (error) {
		if (error instanceof Error && error.message === "Quest not found") {
			throw notFound(error.message);
		}

		throw error;
	}
});

/**
 * クエストを論理削除する。
 */
export const deleteQuest = asyncHandler(async (req: Request, res: Response) => {
	const { params } = validateRequest(req, { params: QuestIdParamSchema });
	const { id } = params;

	try {
		await deleteQuestService(id);
		res
			.status(200)
			.json({ message: "Quest deleted successfully (soft delete)" });
	} catch (error) {
		if (error instanceof Error && error.message === "Quest not found") {
			throw notFound(error.message);
		}

		throw error;
	}
});

/**
 * 下書きまたは非公開クエストを承認待ちへ送る。
 */
export const submitQuestForApproval = asyncHandler(
	async (req: Request, res: Response) => {
		const { params } = validateRequest(req, { params: QuestIdParamSchema });
		const { id } = params;

		const quest = await getQuestByIdService(id);
		if (!quest) {
			throw notFound("Quest not found");
		}

		if (quest.status !== "draft" && quest.status !== "inactive") {
			throw badRequest(
				"Only draft or inactive quests can be submitted for approval",
			);
		}

		const updatedQuest = await updateQuestStatusService(id, "pending");
		res.json({
			message: "Quest submitted for approval successfully",
			quest: updatedQuest,
		});
	},
);

/**
 * 論理削除済みクエストを復元する。
 */
export const restoreQuest = asyncHandler(
	async (req: Request, res: Response) => {
		const { params } = validateRequest(req, { params: QuestIdParamSchema });
		const { id } = params;

		const quest = await getQuestByIdIncludingDeletedService(id);
		if (!quest) {
			throw notFound("Quest not found");
		}

		if (!quest.deleted_at) {
			throw badRequest("Only deleted quests can be restored");
		}

		const restoredQuest = await restoreQuestService(id);
		res.json({
			message: "Quest restored successfully",
			quest: restoredQuest,
		});
	},
);

/**
 * 非アクティブ化されたクエストを再度 active に戻す。
 */
export const reactivateQuest = asyncHandler(
	async (req: Request, res: Response) => {
		const { params } = validateRequest(req, { params: QuestIdParamSchema });
		const { id } = params;

		const quest = await getQuestByIdService(id);
		if (!quest) {
			throw notFound("Quest not found");
		}

		if (quest.status !== "inactive") {
			throw badRequest("Only inactive quests can be reactivated");
		}

		const reactivatedQuest = await updateQuestStatusService(id, "active");
		res.json({
			message: "Quest reactivated successfully",
			quest: reactivatedQuest,
		});
	},
);
