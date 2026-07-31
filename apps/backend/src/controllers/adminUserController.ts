import type { Request, Response } from "express";
import {
	AdminRoleUpdateBodySchema,
	AdminUserRoleParamSchema,
} from "../schemas/api";
import {
	getAllUsersForAdminService,
	updateUserRoleService,
} from "../services/adminUserService";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../utils/validate";

/**
 * 管理画面向けユーザー一覧を返す。
 */
export const getAllUsersForAdmin = asyncHandler(
	async (_req: Request, res: Response) => {
		const users = await getAllUsersForAdminService();
		res.json(users);
	},
);

/**
 * 指定ユーザーのロールを更新する。
 */
export const updateUserRole = asyncHandler(
	async (req: Request, res: Response) => {
		const { params, body } = validateRequest(req, {
			params: AdminUserRoleParamSchema,
			body: AdminRoleUpdateBodySchema,
		});
		const { userId } = params;
		const { role } = body;

		const updatedUser = await updateUserRoleService(userId, role);

		res.json({
			message: "ユーザーのロールが正常に更新されました",
			user: {
				id: updatedUser.id,
				name: updatedUser.name,
				email: updatedUser.email,
				role: updatedUser.role,
			},
		});
	},
);
