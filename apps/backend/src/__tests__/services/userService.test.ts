import {
	createUserService,
	deleteUserService,
	findUserByNameOrEmailService,
	getAllUsersService,
	getUserByFirebaseUidService,
	getUserIdByNameOrEmailService,
} from "../../services/userService";

// UserDataAccessor をモック化
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
		mockUserWithFirebase,
	} = require("../mocks/UserDataAccessor.mock");

	beforeEach(() => {
		jest.clearAllMocks();
	});

	// ------------------------------
	// findUserByNameOrEmailService
	// ------------------------------
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

	// ------------------------------
	// getUserIdByNameOrEmailService
	// ------------------------------
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

	// ------------------------------
	// getUserByFirebaseUidService
	// ------------------------------
	describe("getUserByFirebaseUidService", () => {
		it("Firebase UID でユーザーを取得できる", async () => {
			mockUserDataAccessor.findByFirebaseUid.mockResolvedValue(mockAdminUser1);
			const user = await getUserByFirebaseUidService("firebase-uid-1");

			expect(mockUserDataAccessor.findByFirebaseUid).toHaveBeenCalledWith(
				"firebase-uid-1",
			);
			expect(user).toEqual(mockAdminUser1);
		});

		it("エラー時に例外を投げる", async () => {
			mockUserDataAccessor.findByFirebaseUid.mockRejectedValue(
				new Error("UID Error"),
			);
			await expect(
				getUserByFirebaseUidService("firebase-uid-1"),
			).rejects.toThrow("UID Error");
		});
	});

	// ------------------------------
	// createUserService
	// ------------------------------
	describe("createUserService", () => {
		const newUserData = {
			name: "Charlie",
			email: "charlie@example.com",
			role: "user",
			firebaseUid: "firebase-uid-3",
		};

		it("ユーザーを作成できる", async () => {
			mockUserDataAccessor.create.mockResolvedValue(mockUserWithFirebase);
			const user = await createUserService(newUserData);

			expect(mockUserDataAccessor.create).toHaveBeenCalledWith({
				name: "Charlie",
				email: "charlie@example.com",
				role: "user",
				firebase_uid: "firebase-uid-3",
			});
			expect(user).toEqual(mockUserWithFirebase);
		});

		it("作成エラー時に例外を投げる", async () => {
			mockUserDataAccessor.create.mockRejectedValue(new Error("Create Error"));
			await expect(createUserService(newUserData)).rejects.toThrow(
				"Create Error",
			);
		});
	});

	// ------------------------------
	// getAllUsersService
	// ------------------------------
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

	// ------------------------------
	// deleteUserService
	// ------------------------------
	describe("deleteUserService", () => {
		it("関連データとFirebaseを削除できる", async () => {
			mockUserDataAccessor.findById.mockResolvedValue(mockUserWithFirebase);
			mockUserDataAccessor.findRelatedData.mockResolvedValue({ quests: 1 });
			mockUserDataAccessor.deleteRelatedData.mockResolvedValue(undefined);
			mockUserDataAccessor.delete.mockResolvedValue(mockUserWithFirebase);

			jest.mock("firebase-admin", () => ({
				auth: () => ({
					deleteUser: jest.fn().mockResolvedValue(undefined),
				}),
			}));

			const result = await deleteUserService(mockUserWithFirebase.id);
			expect(result).toEqual(mockUserWithFirebase);
			expect(mockUserDataAccessor.deleteRelatedData).toHaveBeenCalled();
			expect(mockUserDataAccessor.delete).toHaveBeenCalledWith(
				mockUserWithFirebase.id,
			);
		});

		it("ユーザーが存在しない場合は例外を投げる", async () => {
			mockUserDataAccessor.findById.mockResolvedValue(null);
			await expect(deleteUserService(999)).rejects.toThrow("User not found");
		});

		it("Firebase削除失敗してもDB削除は続行される", async () => {
			mockUserDataAccessor.findById.mockResolvedValue(mockUserWithFirebase);
			mockUserDataAccessor.findRelatedData.mockResolvedValue({});
			mockUserDataAccessor.delete.mockResolvedValue(mockUserWithFirebase);

			jest.mock("firebase-admin", () => ({
				auth: () => ({
					deleteUser: jest.fn().mockRejectedValue(new Error("Firebase Error")),
				}),
			}));

			const result = await deleteUserService(mockUserWithFirebase.id);
			expect(result).toEqual(mockUserWithFirebase);
		});
	});
});
