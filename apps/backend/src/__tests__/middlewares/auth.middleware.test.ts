import type { User } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ROLES } from "../../constants/roles";
import {
	authMiddleware,
	optionalAuthMiddleware,
	requireAdmin,
} from "../../middlewares/auth.middleware";
import { getUserByFirebaseUidService } from "../../services/userService";
import { AppError } from "../../utils/appError";

const mockVerifyIdToken = jest.fn();

jest.mock("../../config/firebase", () => ({
	__esModule: true,
	default: {
		auth: () => ({
			verifyIdToken: mockVerifyIdToken,
		}),
	},
}));

jest.mock("../../services/userService", () => ({
	getUserByFirebaseUidService: jest.fn(),
}));

const mockedGetUserByFirebaseUidService =
	getUserByFirebaseUidService as jest.MockedFunction<
		typeof getUserByFirebaseUidService
	>;

const createRequest = (authorization?: string) =>
	({
		headers: authorization ? { authorization } : {},
	}) as Request;

const getNextError = (next: jest.Mock): AppError =>
	next.mock.calls[0]?.[0] as AppError;

describe("auth.middleware", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("authMiddleware", () => {
		it("Bearer トークンがない場合は 401 を返す", async () => {
			const req = createRequest();
			const next = jest.fn() as NextFunction;

			await authMiddleware(req, {} as Response, next);

			const error = getNextError(next as unknown as jest.Mock);
			expect(error).toBeInstanceOf(AppError);
			expect(error.statusCode).toBe(401);
			expect(error.code).toBe("UNAUTHORIZED");
		});

		it("無効トークンの場合は 401 を返す", async () => {
			const req = createRequest("Bearer invalid-token");
			const next = jest.fn() as NextFunction;
			mockVerifyIdToken.mockRejectedValueOnce(new Error("invalid token"));

			await authMiddleware(req, {} as Response, next);

			const error = getNextError(next as unknown as jest.Mock);
			expect(error).toBeInstanceOf(AppError);
			expect(error.statusCode).toBe(401);
			expect(error.code).toBe("UNAUTHORIZED");
		});

		it("有効トークンの場合は req.user を設定して次へ進む", async () => {
			const req = createRequest("Bearer valid-token");
			const next = jest.fn() as NextFunction;
			const decodedToken = { uid: "firebase-uid-1" };
			mockVerifyIdToken.mockResolvedValueOnce(decodedToken);

			await authMiddleware(req, {} as Response, next);

			expect(req.user).toEqual(decodedToken);
			expect(next).toHaveBeenCalledWith();
		});
	});

	describe("optionalAuthMiddleware", () => {
		it("Authorization ヘッダーなしでは匿名のまま通過する", async () => {
			const req = createRequest();
			const next = jest.fn() as NextFunction;

			await optionalAuthMiddleware(req, {} as Response, next);

			expect(req.user).toBeUndefined();
			expect(next).toHaveBeenCalledWith();
		});

		it("無効トークンの場合は 401 を返す", async () => {
			const req = createRequest("Bearer invalid-token");
			const next = jest.fn() as NextFunction;
			mockVerifyIdToken.mockRejectedValueOnce(new Error("invalid token"));

			await optionalAuthMiddleware(req, {} as Response, next);

			const error = getNextError(next as unknown as jest.Mock);
			expect(error).toBeInstanceOf(AppError);
			expect(error.statusCode).toBe(401);
			expect(error.code).toBe("UNAUTHORIZED");
		});
	});

	describe("requireAdmin", () => {
		it("認証済みユーザー情報が無い場合は 401 を返す", async () => {
			const req = createRequest();
			const next = jest.fn() as NextFunction;

			await requireAdmin(req, {} as Response, next);

			const error = getNextError(next as unknown as jest.Mock);
			expect(error).toBeInstanceOf(AppError);
			expect(error.statusCode).toBe(401);
			expect(error.code).toBe("UNAUTHORIZED");
		});

		it("アプリユーザー未登録の場合は 403 を返す", async () => {
			const req = {
				...createRequest(),
				user: { uid: "missing-user" },
			} as Request;
			const next = jest.fn() as NextFunction;
			mockedGetUserByFirebaseUidService.mockResolvedValueOnce(null);

			await requireAdmin(req, {} as Response, next);

			const error = getNextError(next as unknown as jest.Mock);
			expect(error).toBeInstanceOf(AppError);
			expect(error.statusCode).toBe(403);
			expect(error.code).toBe("FORBIDDEN");
		});

		it("管理者ユーザーの場合は通過し req.appUser に格納される", async () => {
			const req = {
				...createRequest(),
				user: { uid: "admin-user" },
			} as Request;
			const next = jest.fn() as NextFunction;
			const adminUser = { id: 1, role: ROLES.ADMIN } as User;
			mockedGetUserByFirebaseUidService.mockResolvedValueOnce(adminUser);

			await requireAdmin(req, {} as Response, next);

			expect(req.appUser).toEqual(adminUser);
			expect(next).toHaveBeenCalledWith();
		});
	});
});
