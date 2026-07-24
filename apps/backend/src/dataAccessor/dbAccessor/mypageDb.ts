import { prisma } from "../../config/db";

/**
 * マイページ表示に必要なユーザー関連データを取得する。
 */
export class MypageDataAccessor {
  /**
   * 参加中のクエスト一覧を取得する。
   * @param userId - 対象ユーザー ID
   * @returns 参加中クエスト一覧
   */
  async fetchUserParticipatingQuests(userId: number) {
    return prisma.questParticipant.findMany({
      where: {
        user_id: userId,
        cleared_at: null,
      },
      include: { quest: true },
    });
  }

  /**
   * 達成済みクエスト一覧を取得する。
   * @param userId - 対象ユーザー ID
   * @returns 達成済みクエスト一覧
   */
  async fetchUserClearedQuests(userId: number) {
    return prisma.questParticipant.findMany({
      where: {
        user_id: userId,
        cleared_at: { not: null },
      },
      include: { quest: true },
    });
  }

  /**
   * 応募中クエスト一覧を取得する。
   * @param userId - 対象ユーザー ID
   * @returns 応募中クエスト一覧
   */
  async fetchUserAppliedQuests(userId: number) {
    return prisma.entry.findMany({
      where: {
        user_id: userId,
        status: "pending",
      },
      include: { quest: true },
    });
  }

  /**
   * ユーザー基本情報を取得する。
   * @param userId - 対象ユーザー ID
   * @returns ユーザー情報。見つからない場合は `null`
   */
  async fetchUserById(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * ユーザー通知一覧を新しい順で取得する。
   * @param userId - 対象ユーザー ID
   * @returns 通知一覧
   */
  async fetchUserNotifications(userId: number) {
    return prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
  }
}
