// adminUserService.test.ts
import {
	getAllUsersForAdminService,
	updateUserRoleService,
} from "../../services/adminUserService";
import type { AppError } from "../../utils/appError";

// UserDataAccessor をモック化
jest.mock("@/dataAccessor/dbAccessor/User", () => {
	// require で遅延読み込み
	const { mockUserDataAccessor } = require("../mocks/UserDataAccessor.mock");
	return {
		UserDataAccessor: jest.fn().mockImplementation(() => mockUserDataAccessor),
	};
});

describe("getAllUsersForAdminService", () => {
	const {
		mockUserDataAccessor,
		mockAllUsersForAdmin,
	} = require("../mocks/UserDataAccessor.mock");

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("全ユーザーを取得できる", async () => {
		mockUserDataAccessor.getAllForAdmin.mockResolvedValue(mockAllUsersForAdmin);

		const users = await getAllUsersForAdminService();

		expect(mockUserDataAccessor.getAllForAdmin).toHaveBeenCalledTimes(1);
		expect(users).toEqual(mockAllUsersForAdmin);
	});

	it("エラーが発生した場合は例外を投げる", async () => {
		mockUserDataAccessor.getAllForAdmin.mockRejectedValue(
			new Error("DB Error"),
		);

		await expect(getAllUsersForAdminService()).rejects.toThrow("DB Error");
	});
});

describe("updateUserRoleService", () => {
	const { mockUserDataAccessor } = require("../mocks/UserDataAccessor.mock");

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("不正なロールは VALIDATION_ERROR を投げる", async () => {
		await expect(updateUserRoleService(1, "owner")).rejects.toMatchObject({
			name: "AppError",
			statusCode: 400,
			code: "VALIDATION_ERROR",
		} satisfies Partial<AppError>);
	});

	it("存在しないユーザーは NOT_FOUND を投げる", async () => {
		mockUserDataAccessor.findById.mockResolvedValueOnce(null);

		await expect(updateUserRoleService(999, "user")).rejects.toMatchObject({
			name: "AppError",
			statusCode: 404,
			code: "NOT_FOUND",
		} satisfies Partial<AppError>);
	});
});
