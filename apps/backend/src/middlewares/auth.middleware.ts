import crypto from "node:crypto";
import type { User } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import type { TokenPayload } from "google-auth-library";
import { oauth2Client } from "../config/auth";
import { logger } from "../config/logger";
import { ROLES } from "../constants/roles";
import { getUserByGoogleSubService } from "../services/userService";
import { AppError, forbidden, unauthorized } from "../utils/appError";

declare global {
	namespace Express {
		interface Request {
			user?: TokenPayload;
			appUser?: User;
		}
	}
}

// 非本番環境でのみ有効なテスト用トークン検証（E2E テスト専用）
function verifyTestToken(idToken: string): TokenPayload | null {
	if (process.env.NODE_ENV === "production") return null;
	try {
		const parts = idToken.split(".");
		if (parts.length !== 3) return null;
		const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
		if (header.alg !== "HMAC-TEST") return null;
		const secret =
			process.env.TEST_TOKEN_SECRET ?? "dev-only-secret-do-not-use-in-prod";
		const expected = crypto
			.createHmac("sha256", secret)
			.update(`${parts[0]}.${parts[1]}`)
			.digest("base64");
		if (expected !== parts[2]) return null;
		return JSON.parse(
			Buffer.from(parts[1], "base64").toString(),
		) as TokenPayload;
	} catch {
		return null;
	}
}

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

	const testPayload = verifyTestToken(idToken);
	if (testPayload) {
		req.user = testPayload;
		return next();
	}

	try {
		const ticket = await oauth2Client.verifyIdToken({
			idToken,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();
		if (!payload) {
			return next(unauthorized("Unauthorized: Invalid token"));
		}
		req.user = payload;
		next();
	} catch (error) {
		logger.warn({ err: error }, "Google トークンの検証に失敗しました");
		return next(unauthorized("Unauthorized: Invalid token"));
	}
};

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

	const testPayload = verifyTestToken(idToken);
	if (testPayload) {
		req.user = testPayload;
		return next();
	}

	try {
		const ticket = await oauth2Client.verifyIdToken({
			idToken,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();
		if (!payload) {
			return next(unauthorized("Unauthorized: Invalid token"));
		}
		req.user = payload;
		next();
	} catch (error) {
		logger.warn({ err: error }, "Google トークンの任意検証に失敗しました");
		return next(unauthorized("Unauthorized: Invalid token"));
	}
};

export const requireAdmin = async (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	const googleSub = req.user?.sub;

	if (!googleSub) {
		return next(unauthorized());
	}

	try {
		const appUser = req.appUser ?? (await getUserByGoogleSubService(googleSub));

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
