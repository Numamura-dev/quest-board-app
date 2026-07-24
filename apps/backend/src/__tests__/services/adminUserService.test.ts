// adminUserService.test.ts
import { getAllUsersForAdminService } from "../../services/adminUserService";

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
