import type { Request, Response } from "express";
import { ROLES } from "../constants/roles";
import { UserListQuerySchema, UserIdParamSchema } from "../schemas/api";
import {
	createUserService,
	deleteUserService,
	findUserByNameOrEmailService,
	getAllUsersService,
	getUserByGoogleSubService,
} from "../services/userService";
import { forbidden, notFound, unauthorized } from "../utils/appError";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../utils/validate";

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
	const { query } = validateRequest(req, { query: UserListQuerySchema });
	const { name, email } = query;

	if (name || email) {
		const user = await findUserByNameOrEmailService(name || "", email || "");
		if (!user) {
			res.json([]);
			return;
		}

		res.json([
			{
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		]);
		return;
	}

	const googleUser = req.user;
	if (!googleUser?.sub) {
		throw unauthorized();
	}

	const currentUser = await getUserByGoogleSubService(googleUser.sub);
	if (!currentUser || currentUser.role !== ROLES.ADMIN) {
		throw forbidden("Forbidden: admin access required");
	}

	const users = await getAllUsersService();
	res.json(users);
});

/**
 * Google 認証済みユーザーをアプリケーションユーザーとして upsert する。
 * 初回ログイン時はレコードを作成し、2回目以降は既存レコードを返す。
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
	const googleUser = req.user;
	if (!googleUser?.sub) {
		throw unauthorized();
	}

	const existingUser = await getUserByGoogleSubService(googleUser.sub);
	if (existingUser) {
		res.json({
			message: "User already exists",
			user: {
				id: existingUser.id,
				name: existingUser.name,
				email: existingUser.email,
				role: existingUser.role,
			},
		});
		return;
	}

	const newUser = await createUserService({
		name: googleUser.name || googleUser.email || "Unknown",
		email: googleUser.email || "",
		role: ROLES.USER,
		googleSub: googleUser.sub,
	});

	res.status(201).json({
		message: "User created successfully",
		user: {
			id: newUser.id,
			name: newUser.name,
			email: newUser.email,
			role: newUser.role,
		},
	});
});

export const getCurrentUser = asyncHandler(
	async (req: Request, res: Response) => {
		const googleUser = req.user;
		if (!googleUser?.sub) {
			throw unauthorized();
		}

		const user = await getUserByGoogleSubService(googleUser.sub);
		if (!user) {
			throw notFound("User not found");
		}

		res.json({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
		});
	},
);

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
	const { params } = validateRequest(req, { params: UserIdParamSchema });
	const { id } = params;

	try {
		const deletedUser = await deleteUserService(id);

		res.status(200).json({
			message: "User deleted successfully",
			user: {
				id: deletedUser.id,
				name: deletedUser.name,
				email: deletedUser.email,
			},
		});
	} catch (error) {
		if (error instanceof Error && error.message === "User not found") {
			throw notFound(error.message);
		}

		throw error;
	}
});
