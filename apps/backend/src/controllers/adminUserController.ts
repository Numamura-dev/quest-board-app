import type { Request, Response } from "express";
import {
	AdminRoleUpdateBodySchema,
	AdminUserRoleParamSchema,
} from "../schemas/api";
import {
	getAllUsersForAdminService,
	updateUserRoleService,
} from "../services/adminUserService";
import { notFound } from "../utils/appError";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../utils/validate";

export const getAllUsersForAdmin = asyncHandler(
	async (_req: Request, res: Response) => {
		const users = await getAllUsersForAdminService();
		res.json(users);
	},
);

export const updateUserRole = asyncHandler(
	async (req: Request, res: Response) => {
		const { params, body } = validateRequest(req, {
			params: AdminUserRoleParamSchema,
			body: AdminRoleUpdateBodySchema,
		});
		const { userId } = params;
		const { role } = body;

		let updatedUser: Awaited<ReturnType<typeof updateUserRoleService>>;
		try {
			updatedUser = await updateUserRoleService(userId, role);
		} catch (error) {
			if (error instanceof Error && error.message === "User not found") {
				throw notFound(error.message);
			}

			throw error;
		}

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
