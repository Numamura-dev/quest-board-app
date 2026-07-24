import type { NextFunction, Request, Response } from "express";
import { ROLES } from "../../constants/roles";
import {
	createReview,
	deleteReview,
	updateReview,
} from "../../controllers/reviewController";
import {
	createReviewService,
	deleteReviewService,
	getReviewByIdService,
	updateReviewService,
} from "../../services/reviewService";
import { getUserByFirebaseUidService } from "../../services/userService";
import { AppError } from "../../utils/appError";
import { validateRequest } from "../../utils/validate";

jest.mock("../../utils/validate", () => ({
	validateRequest: jest.fn(),
}));

jest.mock("../../services/reviewService", () => ({
	createReviewService: jest.fn(),
	updateReviewService: jest.fn(),
	deleteReviewService: jest.fn(),
	getReviewByIdService: jest.fn(),
}));

jest.mock("../../services/userService", () => ({
	getUserByFirebaseUidService: jest.fn(),
}));

const mockValidateRequest = validateRequest as jest.MockedFunction<
	typeof validateRequest
>;
const mockCreateReviewService = createReviewService as jest.MockedFunction<
	typeof createReviewService
>;
const mockUpdateReviewService = updateReviewService as jest.MockedFunction<
	typeof updateReviewService
>;
const mockDeleteReviewService = deleteReviewService as jest.MockedFunction<
	typeof deleteReviewService
>;
const mockGetReviewByIdService = getReviewByIdService as jest.MockedFunction<
	typeof getReviewByIdService
>;
const mockGetUserByFirebaseUidService =
	getUserByFirebaseUidService as jest.MockedFunction<
		typeof getUserByFirebaseUidService
	>;

const createResponse = () =>
	({
		status: jest.fn().mockReturnThis(),
		json: jest.fn(),
		send: jest.fn(),
	}) as unknown as Response;

const waitForAsyncHandler = () =>
	new Promise<void>((resolve) => {
		setImmediate(() => resolve());
	});

describe("reviewController", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("createReview は body の reviewer_id を無視し、認証ユーザーの ID で作成する", async () => {
		mockValidateRequest.mockReturnValue({
			params: { questId: 1 },
			body: { reviewer_id: 999, rating: 5, comment: "test" },
			query: {},
		} as never);
		mockGetUserByFirebaseUidService.mockResolvedValueOnce({
			id: 10,
			role: ROLES.USER,
		} as never);
		mockCreateReviewService.mockResolvedValueOnce({ id: 1 } as never);

		const req = { user: { uid: "firebase-uid-10" } } as Request;
		const res = createResponse();
		const next = jest.fn();

		createReview(req, res, next as unknown as NextFunction);
		await waitForAsyncHandler();

		expect(mockCreateReviewService).toHaveBeenCalledWith({
			questId: 1,
			reviewer_id: 10,
			rating: 5,
			comment: "test",
		});
		expect(res.status).toHaveBeenCalledWith(201);
		expect(next).not.toHaveBeenCalled();
	});

	it("updateReview はレビュー所有者以外の更新を 403 で拒否する", async () => {
		mockValidateRequest.mockReturnValue({
			params: { reviewId: 1 },
			body: { rating: 3, comment: "updated" },
			query: {},
		} as never);
		mockGetUserByFirebaseUidService.mockResolvedValueOnce({
			id: 2,
			role: ROLES.USER,
		} as never);
		mockGetReviewByIdService.mockResolvedValueOnce({
			id: 1,
			reviewer_id: 3,
		} as never);

		const req = { user: { uid: "firebase-uid-2" } } as Request;
		const res = createResponse();
		const next = jest.fn();

		updateReview(req, res, next as unknown as NextFunction);
		await waitForAsyncHandler();

		expect(mockUpdateReviewService).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalled();
		const error = next.mock.calls[0][0] as AppError;
		expect(error).toBeInstanceOf(AppError);
		expect(error.statusCode).toBe(403);
		expect(error.code).toBe("FORBIDDEN");
	});

	it("deleteReview は admin なら他人のレビューも削除できる", async () => {
		mockValidateRequest.mockReturnValue({
			params: { reviewId: 5 },
			body: {},
			query: {},
		} as never);
		mockGetUserByFirebaseUidService.mockResolvedValueOnce({
			id: 8,
			role: ROLES.ADMIN,
		} as never);
		mockGetReviewByIdService.mockResolvedValueOnce({
			id: 5,
			reviewer_id: 99,
		} as never);
		mockDeleteReviewService.mockResolvedValueOnce(undefined as never);

		const req = { user: { uid: "firebase-uid-8" } } as Request;
		const res = createResponse();
		const next = jest.fn();

		deleteReview(req, res, next as unknown as NextFunction);
		await waitForAsyncHandler();

		expect(mockDeleteReviewService).toHaveBeenCalledWith(5);
		expect(res.status).toHaveBeenCalledWith(204);
		expect(res.send).toHaveBeenCalled();
		expect(next).not.toHaveBeenCalled();
	});
});
