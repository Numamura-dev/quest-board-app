import { UserDataAccessor } from "../dataAccessor/dbAccessor/User";
import { logger } from "../config/logger";
import { conflict } from "../utils/appError";

const userDataAccessor = new UserDataAccessor();

export const findUserByNameOrEmailService = async (
	name: string,
	email: string,
) => {
	try {
		const user = await userDataAccessor.findByNameOrEmail(name, email);
		return user;
	} catch (error) {
		logger.error({ err: error, name, email }, "ユーザー検索エラー");
		throw error;
	}
};

export const getUserIdByNameOrEmailService = async (
	name: string,
	email: string,
): Promise<number | null> => {
	const user = await findUserByNameOrEmailService(name, email);
	return user ? user.id : null;
};

export const getUserByGoogleSubService = async (googleSub: string) => {
	try {
		const user = await userDataAccessor.findByGoogleSub(googleSub);
		return user;
	} catch (error) {
		logger.error({ err: error, googleSub }, "Google Sub でユーザー取得エラー");
		throw error;
	}
};

/**
 * google_sub で検索し、見つからなければ email で既存ユーザーを検索して紐付ける。
 * Firebase から移行した既存ユーザーが Google ログイン時に unique 制約で弾かれないための処理。
 */
export const linkGoogleSubToExistingUserService = async (
	googleSub: string,
	email: string,
) => {
	try {
		const byGoogleSub = await userDataAccessor.findByGoogleSub(googleSub);
		if (byGoogleSub) return byGoogleSub;

		const byEmail = await userDataAccessor.findByEmail(email);
		if (byEmail) {
			if (byEmail.google_sub !== null) {
				throw conflict(
					"This email is already linked to a different Google account",
				);
			}
			return await userDataAccessor.update(byEmail.id, {
				google_sub: googleSub,
			});
		}

		return null;
	} catch (error) {
		logger.error({ err: error, googleSub, email }, "Google Sub 紐付けエラー");
		throw error;
	}
};

export const createUserService = async (userData: {
	name: string;
	email: string;
	role: string;
	googleSub: string;
}) => {
	try {
		const user = await userDataAccessor.create({
			name: userData.name,
			email: userData.email,
			role: userData.role,
			google_sub: userData.googleSub,
		});
		return user;
	} catch (error) {
		logger.error({ err: error, userData }, "ユーザー作成エラー");
		throw error;
	}
};

export const getAllUsersService = async () => {
	try {
		const users = await userDataAccessor.getAllForAdmin();
		return users;
	} catch (error) {
		logger.error({ err: error }, "全ユーザー取得エラー");
		throw error;
	}
};

export const deleteUserService = async (id: number) => {
	try {
		const user = await userDataAccessor.findById(id);

		if (!user) {
			throw new Error("User not found");
		}

		const relatedData = await userDataAccessor.findRelatedData(id);
		if (Object.values(relatedData).some((count) => count > 0)) {
			await userDataAccessor.deleteRelatedData(id);
		}

		const deletedUser = await userDataAccessor.delete(id);
		return deletedUser;
	} catch (error) {
		logger.error({ err: error, userId: id }, "ユーザー削除エラー");
		throw error;
	}
};
