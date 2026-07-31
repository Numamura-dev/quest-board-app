import {
	findUserByNameOrEmailService,
	getUserIdByNameOrEmailService,
	getUserByGoogleSubService,
	createUserService,
	getAllUsersService,
	deleteUserService,
	linkGoogleSubToExistingUserService,
} from "../../services/userService";

jest.mock("../../dataAccessor/dbAccessor/User", () => {
	const { mockUserDataAccessor } = require("../mocks/UserDataAccessor.mock");
	return {
		UserDataAccessor: jest.fn().mockImplementation(() => mockUserDataAccessor),
	};
});

describe("userService", () => {
	const {
		mockUserDataAccessor,
		mockAdminUser1,
		mockAllUsersForAdmin,
		mockUserWithGoogleSub,
	} = require("../mocks/UserDataAccessor.mock");

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("findUserByNameOrEmailService", () => {
		it("ユーザーを取得できる", async () => {
			mockUserDataAccessor.findByNameOrEmail.mockResolvedValue(mockAdminUser1);
			const user = await findUserByNameOrEmailService(
				"Alice",
				"alice@example.com",
			);

			expect(mockUserDataAccessor.findByNameOrEmail).toHaveBeenCalledWith(
				"Alice",
				"alice@example.com",
			);
			expect(user).toEqual(mockAdminUser1);
		});

		it("エラー時に例外を投げる", async () => {
			mockUserDataAccessor.findByNameOrEmail.mockRejectedValue(
				new Error("DB Error"),
			);
			await expect(
				findUserByNameOrEmailService("Alice", "alice@example.com"),
			).rejects.toThrow("DB Error");
		});
	});

	describe("getUserIdByNameOrEmailService", () => {
		it("ユーザーIDを返す", async () => {
			mockUserDataAccessor.findByNameOrEmail.mockResolvedValue(mockAdminUser1);
			const id = await getUserIdByNameOrEmailService(
				"Alice",
				"alice@example.com",
			);

			expect(id).toBe(mockAdminUser1.id);
		});

		it("ユーザーが存在しない場合は null を返す", async () => {
			mockUserDataAccessor.findByNameOrEmail.mockResolvedValue(null);
			const id = await getUserIdByNameOrEmailService(
				"Unknown",
				"unknown@example.com",
			);

			expect(id).toBeNull();
		});
	});

	describe("getUserByGoogleSubService", () => {
		it("Google Sub でユーザーを取得できる", async () => {
			mockUserDataAccessor.findByGoogleSub.mockResolvedValue(mockAdminUser1);
			const user = await getUserByGoogleSubService("google-sub-1");

			expect(mockUserDataAccessor.findByGoogleSub).toHaveBeenCalledWith(
				"google-sub-1",
			);
			expect(user).toEqual(mockAdminUser1);
		});

		it("エラー時に例外を投げる", async () => {
			mockUserDataAccessor.findByGoogleSub.mockRejectedValue(
				new Error("Sub Error"),
			);
			await expect(getUserByGoogleSubService("google-sub-1")).rejects.toThrow(
				"Sub Error",
			);
		});
	});

	describe("createUserService", () => {
		const newUserData = {
			name: "Charlie",
			email: "charlie@example.com",
			role: "user",
			googleSub: "google-sub-3",
		};

		it("ユーザーを作成できる", async () => {
			mockUserDataAccessor.create.mockResolvedValue(mockUserWithGoogleSub);
			const user = await createUserService(newUserData);

			expect(mockUserDataAccessor.create).toHaveBeenCalledWith({
				name: "Charlie",
				email: "charlie@example.com",
				role: "user",
				google_sub: "google-sub-3",
			});
			expect(user).toEqual(mockUserWithGoogleSub);
		});

		it("作成エラー時に例外を投げる", async () => {
			mockUserDataAccessor.create.mockRejectedValue(new Error("Create Error"));
			await expect(createUserService(newUserData)).rejects.toThrow(
				"Create Error",
			);
		});
	});

	describe("getAllUsersService", () => {
		it("全ユーザーを取得できる", async () => {
			mockUserDataAccessor.getAllForAdmin.mockResolvedValue(
				mockAllUsersForAdmin,
			);
			const users = await getAllUsersService();

			expect(mockUserDataAccessor.getAllForAdmin).toHaveBeenCalledTimes(1);
			expect(users).toEqual(mockAllUsersForAdmin);
		});

		it("エラー発生時に例外を投げる", async () => {
			mockUserDataAccessor.getAllForAdmin.mockRejectedValue(
				new Error("DB Error"),
			);
			await expect(getAllUsersService()).rejects.toThrow("DB Error");
		});
	});

	describe("linkGoogleSubToExistingUserService", () => {
		const newGoogleSub = "google-sub-new";
		const existingEmail = "alice@example.com";

		it("google_sub が一致するユーザーが存在する場合はそのまま返す", async () => {
			mockUserDataAccessor.findByGoogleSub.mockResolvedValue(mockAdminUser1);

			const result = await linkGoogleSubToExistingUserService(
				mockAdminUser1.google_sub ?? "",
				existingEmail,
			);

			expect(result).toEqual(mockAdminUser1);
			expect(mockUserDataAccessor.findByEmail).not.toHaveBeenCalled();
			expect(mockUserDataAccessor.update).not.toHaveBeenCalled();
		});

		it("google_sub 未設定の既存ユーザーに紐付けて更新する", async () => {
			const userWithoutGoogleSub = { ...mockAdminUser1, google_sub: null };
			const updatedUser = { ...userWithoutGoogleSub, google_sub: newGoogleSub };
			mockUserDataAccessor.findByGoogleSub.mockResolvedValue(null);
			mockUserDataAccessor.findByEmail.mockResolvedValue(userWithoutGoogleSub);
			mockUserDataAccessor.update.mockResolvedValue(updatedUser);

			const result = await linkGoogleSubToExistingUserService(
				newGoogleSub,
				existingEmail,
			);

			expect(mockUserDataAccessor.update).toHaveBeenCalledWith(
				userWithoutGoogleSub.id,
				{ google_sub: newGoogleSub },
			);
			expect(result).toEqual(updatedUser);
		});

		it("既に別の google_sub が設定されている場合は 409 CONFLICT を投げる", async () => {
			mockUserDataAccessor.findByGoogleSub.mockResolvedValue(null);
			mockUserDataAccessor.findByEmail.mockResolvedValue(mockAdminUser1);

			await expect(
				linkGoogleSubToExistingUserService(newGoogleSub, existingEmail),
			).rejects.toMatchObject({ statusCode: 409, code: "CONFLICT" });

			expect(mockUserDataAccessor.update).not.toHaveBeenCalled();
		});

		it("google_sub でも email でも見つからない場合は null を返す", async () => {
			mockUserDataAccessor.findByGoogleSub.mockResolvedValue(null);
			mockUserDataAccessor.findByEmail.mockResolvedValue(null);

			const result = await linkGoogleSubToExistingUserService(
				newGoogleSub,
				"unknown@example.com",
			);

			expect(result).toBeNull();
		});
	});

	describe("deleteUserService", () => {
		it("関連データとともにユーザーを削除できる", async () => {
			mockUserDataAccessor.findById.mockResolvedValue(mockUserWithGoogleSub);
			mockUserDataAccessor.findRelatedData.mockResolvedValue({ quests: 1 });
			mockUserDataAccessor.deleteRelatedData.mockResolvedValue(undefined);
			mockUserDataAccessor.delete.mockResolvedValue(mockUserWithGoogleSub);

			const result = await deleteUserService(mockUserWithGoogleSub.id);
			expect(result).toEqual(mockUserWithGoogleSub);
			expect(mockUserDataAccessor.deleteRelatedData).toHaveBeenCalled();
			expect(mockUserDataAccessor.delete).toHaveBeenCalledWith(
				mockUserWithGoogleSub.id,
			);
		});

		it("ユーザーが存在しない場合は例外を投げる", async () => {
			mockUserDataAccessor.findById.mockResolvedValue(null);
			await expect(deleteUserService(999)).rejects.toThrow("User not found");
		});

		it("関連データがない場合でも削除できる", async () => {
			mockUserDataAccessor.findById.mockResolvedValue(mockUserWithGoogleSub);
			mockUserDataAccessor.findRelatedData.mockResolvedValue({});
			mockUserDataAccessor.delete.mockResolvedValue(mockUserWithGoogleSub);

			const result = await deleteUserService(mockUserWithGoogleSub.id);
			expect(result).toEqual(mockUserWithGoogleSub);
		});
	});
});
