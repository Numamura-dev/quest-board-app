import type { NextFunction, Request, Response } from "express";
import { joinQuest } from "../../controllers/questJoinController";
import { addUserToQuest } from "../../services/questJoinService";
import { getUserByGoogleSubService } from "../../services/userService";
import type { AppError } from "../../utils/appError";
import { validateRequest } from "../../utils/validate";

jest.mock("../../utils/validate", () => ({
	validateRequest: jest.fn(),
}));

jest.mock("../../services/questJoinService", () => ({
	addUserToQuest: jest.fn(),
}));

jest.mock("../../services/userService", () => ({
	getUserByGoogleSubService: jest.fn(),
}));

const mockValidateRequest = validateRequest as jest.MockedFunction<
	typeof validateRequest
>;
const mockAddUserToQuest = addUserToQuest as jest.MockedFunction<
	typeof addUserToQuest
>;
const mockGetUserByGoogleSubService =
	getUserByGoogleSubService as jest.MockedFunction<
		typeof getUserByGoogleSubService
	>;

const createResponse = () =>
	({
		json: jest.fn(),
	}) as unknown as Response;

const waitForAsyncHandler = () =>
	new Promise<void>((resolve) => {
		setImmediate(() => resolve());
	});

describe("questJoinController", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockValidateRequest.mockReturnValue({
			params: { questId: 1 },
			body: {},
			query: {},
		} as never);
		mockGetUserByGoogleSubService.mockResolvedValue({
			id: 10,
		} as never);
	});

	it.each([
		["duplicate", 409, "CONFLICT"],
		["full", 409, "CONFLICT"],
		["not_found", 404, "NOT_FOUND"],
		["error", 400, "VALIDATION_ERROR"],
	])(
		"参加失敗 reason %s を標準 AppError に変換する",
		async (reason, statusCode, code) => {
			mockAddUserToQuest.mockResolvedValueOnce({
				success: false,
				reason,
			} as never);

			const req = { user: { sub: "google-sub-10" } } as unknown as Request;
			const res = createResponse();
			const next = jest.fn();

			joinQuest(req, res, next as unknown as NextFunction);
			await waitForAsyncHandler();

			expect(next).toHaveBeenCalled();
			expect(next.mock.calls[0][0]).toMatchObject({
				name: "AppError",
				statusCode,
				code,
			} satisfies Partial<AppError>);
		},
	);
});
