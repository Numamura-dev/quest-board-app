import type { Request, Response } from "express";
import { QuestJoinParamSchema } from "../schemas/api";
import { addUserToQuest } from "../services/questJoinService";
import { getUserByGoogleSubService } from "../services/userService";
import {
	badRequest,
	conflict,
	notFound,
	unauthorized,
} from "../utils/appError";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../utils/validate";

/**
 * 認証済みユーザーをクエスト参加者として登録する。
 */
export const joinQuest = asyncHandler(async (req: Request, res: Response) => {
	const googleSub = req.user?.sub;
	if (!googleSub) {
		throw unauthorized();
	}

	const user = await getUserByGoogleSubService(googleSub);
	if (!user) {
		throw notFound("User not found");
	}

	const { params } = validateRequest(req, { params: QuestJoinParamSchema });
	const { questId } = params;

	const result = await addUserToQuest(user.id, questId);
	if (!result || !result.success) {
		if (result?.reason === "duplicate") {
			throw conflict("既に参加しています");
		}
		if (result?.reason === "full") {
			throw conflict("参加人数が上限に達しています");
		}
		if (result?.reason === "not_found") {
			throw notFound("クエストが見つかりません");
		}

		throw badRequest("参加に失敗しました");
	}

	res.json({ success: true, message: "クエストに参加しました！" });
});
