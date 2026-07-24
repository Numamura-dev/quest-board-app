import type { User } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import admin from "../config/firebase"; // 初期化済みの Firebase Admin SDK を利用
import { logger } from "../config/logger";
import { ROLES } from "../constants/roles";
import { getUserByFirebaseUidService } from "../services/userService";
import { AppError, forbidden, unauthorized } from "../utils/appError";

// Express リクエスト用の型拡張（userを付与するため）
declare global {
	namespace Express {
		interface Request {
			user?: admin.auth.DecodedIdToken;
			appUser?: User;
		}
	}
}

/**
 * Bearer トークンを検証し、Firebase のデコード済みユーザー情報を `req.user` に格納する。
 */
export const authMiddleware = async (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith("Bearer ")) {
		return next(unauthorized("Unauthorized: Bearer token missing"));
	}

	const idToken = authHeader.split("Bearer ")[1];

	try {
		const decodedToken = await admin.auth().verifyIdToken(idToken);
		req.user = decodedToken;
		next();
	} catch (error) {
		logger.warn({ err: error }, "Firebase トークンの検証に失敗しました");
		return next(unauthorized("Unauthorized: Invalid token"));
	}
};

/**
 * Bearer トークンがある場合のみ検証し、未指定時は匿名のまま通過する。
 */
export const optionalAuthMiddleware = async (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		next();
		return;
	}

	if (!authHeader.startsWith("Bearer ")) {
		return next(unauthorized("Unauthorized: Invalid authorization header"));
	}

	const idToken = authHeader.split("Bearer ")[1];

	try {
		const decodedToken = await admin.auth().verifyIdToken(idToken);
		req.user = decodedToken;
		next();
	} catch (error) {
		logger.warn({ err: error }, "Firebase トークンの任意検証に失敗しました");
		return next(unauthorized("Unauthorized: Invalid token"));
	}
};

/**
 * 認証済みユーザーが管理者ロールを持つことを検証する。
 */
export const requireAdmin = async (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	const firebaseUid = req.user?.uid;

	if (!firebaseUid) {
		return next(unauthorized());
	}

	try {
		const appUser =
			req.appUser ?? (await getUserByFirebaseUidService(firebaseUid));

		if (!appUser) {
			return next(forbidden("Forbidden: user not found"));
		}

		if (appUser.role !== ROLES.ADMIN) {
			return next(forbidden("Forbidden: admin access required"));
		}

		req.appUser = appUser;
		next();
		return;
	} catch (error) {
		logger.error({ err: error }, "管理者権限の検証に失敗しました");
		return next(
			error instanceof AppError
				? error
				: new AppError(
						"Failed to authorize admin user",
						500,
						"ADMIN_AUTHORIZATION_FAILED",
					),
		);
	}
};
