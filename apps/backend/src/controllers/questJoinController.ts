import type { Request, Response } from "express";
import { QuestJoinParamSchema } from "../schemas/api";
import { addUserToQuest } from "../services/questJoinService";
import { getUserByFirebaseUidService } from "../services/userService";
import { badRequest, notFound, unauthorized } from "../utils/appError";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../utils/validate";

export const joinQuest = asyncHandler(async (req: Request, res: Response) => {
	const firebaseUid = req.user?.uid;
	if (!firebaseUid) {
		throw unauthorized();
	}

	const user = await getUserByFirebaseUidService(firebaseUid);
	if (!user) {
		throw notFound("User not found");
	}

	const { params } = validateRequest(req, { params: QuestJoinParamSchema });
	const { questId } = params;

	const result = await addUserToQuest(user.id, questId);
	if (!result || !result.success) {
		const errorMessage =
			result?.reason === "duplicate"
				? "既に参加しています"
				: result?.reason === "full"
					? "参加人数が上限に達しています"
					: result?.reason === "not_found"
						? "クエストが見つかりません"
						: "参加に失敗しました";

		throw badRequest(errorMessage);
	}

	res.json({ success: true, message: "クエストに参加しました！" });
});
