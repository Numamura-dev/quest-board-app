import type { Request, Response } from "express";
import { ROLES } from "../constants/roles";
import {
	CreateUserBodySchema,
	UserListQuerySchema,
	UserIdParamSchema,
} from "../schemas/api";
import {
	createUserService,
	deleteUserService,
	findUserByNameOrEmailService,
	getAllUsersService,
	getUserByFirebaseUidService,
} from "../services/userService";
import { conflict, forbidden, notFound, unauthorized } from "../utils/appError";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../utils/validate";

/**
 * クエリ有無に応じてユーザー検索または管理者向け一覧取得を行う。
 */
export const getUsers = asyncHandler(
	async (req: Request, res: Response) => {
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

		const firebaseUser = req.user;
		if (!firebaseUser) {
			throw unauthorized();
		}

		const currentUser = await getUserByFirebaseUidService(firebaseUser.uid);
		if (!currentUser || currentUser.role !== ROLES.ADMIN) {
			throw forbidden("Forbidden: admin access required");
		}

		const users = await getAllUsersService();
		res.json(users);
	},
);

/**
 * 認証済み Firebase ユーザーをアプリケーションユーザーとして登録する。
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
	const firebaseUser = req.user;
	if (!firebaseUser) {
		throw unauthorized();
	}

	const { body } = validateRequest(req, { body: CreateUserBodySchema });
	const { name, role = ROLES.USER } = body;

	const existingUser = await findUserByNameOrEmailService(
		name,
		firebaseUser.email || "",
	);
	if (existingUser) {
		throw conflict("User already exists");
	}

	const newUser = await createUserService({
		name,
		email: firebaseUser.email || "",
		role,
		firebaseUid: firebaseUser.uid,
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

/**
 * 認証済みユーザーのプロフィールを返す。
 */
export const getCurrentUser = asyncHandler(
	async (req: Request, res: Response) => {
		const firebaseUser = req.user;
		if (!firebaseUser) {
			throw unauthorized();
		}

		const user = await getUserByFirebaseUidService(firebaseUser.uid);
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

/**
 * ユーザーを関連データとあわせて削除する。
 */
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
