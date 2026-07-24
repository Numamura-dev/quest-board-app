import { UserDataAccessor } from "../dataAccessor/dbAccessor/User";
import { VALID_ROLES } from "../constants/roles";
import { logger } from "../config/logger";

const userDataAccessor = new UserDataAccessor();

/**
 * 管理画面向けのユーザー一覧を取得する。
 * @returns 管理者向けユーザー一覧
 */
export const getAllUsersForAdminService = async () => {
  return await userDataAccessor.getAllForAdmin();
};

/**
 * ユーザーのロールを更新する。
 * @param userId - 更新対象のユーザー ID
 * @param newRole - 更新後のロール
 * @returns 更新後のユーザー情報
 */
export const updateUserRoleService = async (
  userId: number,
  newRole: string
) => {
  try {
    // 有効なロールかチェック
    if (!VALID_ROLES.includes(newRole as (typeof VALID_ROLES)[number])) {
      throw new Error("Invalid role. Must be 'admin' or 'user'");
    }

    // ユーザーが存在するかチェック
    const existingUser = await userDataAccessor.findById(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // ロールを更新
    const updatedUser = await userDataAccessor.update(userId, {
      role: newRole,
    });
    return updatedUser;
  } catch (error) {
    logger.error({ err: error, userId, newRole }, "ユーザーロール更新エラー");
    throw error;
  }
};
