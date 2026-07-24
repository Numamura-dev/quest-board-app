import { MypageDataAccessor } from "../dataAccessor/dbAccessor";

/**
 * マイページ表示用にユーザー関連データを整形するサービス。
 */
export class MypageService {
  constructor(private readonly mypageDataAccessor = new MypageDataAccessor()) {}

  /**
   * マイページの参加中・達成済み・応募済みクエストを取得する。
   * @param userId - 対象ユーザー ID
   * @returns マイページ表示用に整形したクエスト一覧
   */
  async getUserEntries(userId: number) {
    const participating =
      await this.mypageDataAccessor.fetchUserParticipatingQuests(userId);
    const cleared = await this.mypageDataAccessor.fetchUserClearedQuests(userId);
    const applied = await this.mypageDataAccessor.fetchUserAppliedQuests(userId);

    return {
      participating: participating.map((p) => ({
        id: p.quest.id,
        title: p.quest.title,
        status: "participating",
        joinedAt: p.joined_at,
      })),
      completed: cleared.map((c) => ({
        id: c.quest.id,
        title: c.quest.title,
        status: "cleared",
        clearedAt: c.cleared_at,
      })),
      applied: applied.map((a) => ({
        id: a.quest.id,
        title: a.quest.title,
        status: "applied",
        appliedAt: a.applied_at,
      })),
    };
  }

  /**
   * マイページ表示用のユーザープロフィールを取得する。
   * @param userId - 対象ユーザー ID
   * @returns プロフィール情報。見つからない場合は `null`
   */
  async getUserProfile(userId: number) {
    const user = await this.mypageDataAccessor.fetchUserById(userId);
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * マイページに表示する通知一覧を取得する。
   * @param userId - 対象ユーザー ID
   * @returns 表示用に整形した通知一覧
   */
  async getUserNotifications(userId: number) {
    const notifications =
      await this.mypageDataAccessor.fetchUserNotifications(userId);

    return notifications.map((notification) => ({
      id: notification.id,
      message: notification.message,
      isRead: notification.is_read,
      createdAt: notification.created_at,
    }));
  }
}

/**
 * マイページ機能で共有するサービスインスタンス。
 */
export const mypageService = new MypageService();
