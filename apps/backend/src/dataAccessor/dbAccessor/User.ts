import { prisma } from "../../config/db";
import { User } from "@prisma/client";

/**
 * ユーザー作成用のデータインターフェース
 */
export interface CreateUserData {
  name: string;
  email: string;
  role: string;
  firebase_uid: string;
}

/**
 * ユーザー更新用のデータインターフェース
 */
export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  firebase_uid?: string;
}

/**
 * ユーザーテーブルと関連データへのアクセスを提供する。
 */
export class UserDataAccessor {
  /**
   * ユーザー ID から 1 件取得する。
   * @param id - 対象ユーザー ID
   * @returns ユーザー情報。見つからない場合は `null`
   */
  async findById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * メールアドレスでユーザーを取得する。
   * @param email - 検索対象のメールアドレス
   * @returns ユーザー情報。見つからない場合は `null`
   */
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * 名前でユーザーを取得する。
   * @param name - 検索対象の名前
   * @returns ユーザー情報。見つからない場合は `null`
   */
  async findByName(name: string): Promise<User | null> {
    return await prisma.user.findFirst({
      where: { name },
    });
  }

  /**
   * 名前またはメールアドレスでユーザーを取得する。
   * @param name - 検索対象の名前
   * @param email - 検索対象のメールアドレス
   * @returns ユーザー情報。見つからない場合は `null`
   */
  async findByNameOrEmail(name: string, email: string): Promise<User | null> {
    return await prisma.user.findFirst({
      where: {
        OR: [{ name }, { email }],
      },
    });
  }

  /**
   * ユーザーを新規作成する。
   * @param data - 作成するユーザー情報
   * @returns 作成後のユーザー情報
   */
  async create(data: CreateUserData): Promise<User> {
    return await prisma.user.create({
      data,
    });
  }

  /**
   * 既存ユーザーを更新する。
   * @param id - 更新対象のユーザー ID
   * @param data - 更新内容
   * @returns 更新後のユーザー情報
   */
  async update(id: number, data: UpdateUserData): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Firebase UID からユーザーを取得する。
   * @param firebaseUid - Firebase Authentication の UID
   * @returns ユーザー情報。見つからない場合は `null`
   */
  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { firebase_uid: firebaseUid } as any,
    });
  }

  /**
   * 管理画面向けのユーザー一覧を取得する。
   * @returns 管理画面用に絞り込んだユーザー一覧
   */
  async getAllForAdmin() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  /**
   * ユーザーを削除する。
   * @param id - 削除対象のユーザー ID
   * @returns 削除後のユーザー情報
   */
  async delete(id: number): Promise<User> {
    return await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Firebase UID からユーザーを削除する。
   * @param firebaseUid - 対象 Firebase UID
   * @returns 削除後のユーザー情報
   */
  async deleteByFirebaseUid(firebaseUid: string): Promise<User> {
    return await prisma.user.delete({
      where: { firebase_uid: firebaseUid } as any,
    });
  }

  /**
   * ユーザーに紐づく関連データ件数を集計する。
   * @param userId - 対象ユーザー ID
   * @returns 関連テーブルごとの件数
   */
  async findRelatedData(userId: number) {
    const [
      clearSubmissions,
      entries,
      feedbacks,
      incentivePayments,
      notifications,
      offers,
      pointTransactions,
      questParticipants,
      reviews,
    ] = await Promise.all([
      prisma.clearSubmission.count({ where: { user_id: userId } }),
      prisma.entry.count({ where: { user_id: userId } }),
      prisma.feedback.count({ where: { user_id: userId } }),
      prisma.incentivePayment.count({ where: { user_id: userId } }),
      prisma.notification.count({ where: { user_id: userId } }),
      prisma.offer.count({ where: { user_id: userId } }),
      prisma.pointTransaction.count({ where: { user_id: userId } }),
      prisma.questParticipant.count({ where: { user_id: userId } }),
      prisma.review.count({ where: { reviewer_id: userId } }),
    ]);

    return {
      clearSubmissions,
      entries,
      feedbacks,
      incentivePayments,
      notifications,
      offers,
      pointTransactions,
      questParticipants,
      reviews,
    };
  }

  /**
   * ユーザーに紐づく関連データを外部キー制約順に削除する。
   * @param userId - 対象ユーザー ID
   * @returns 削除完了後の Promise
   */
  async deleteRelatedData(userId: number) {
    // 外部キー制約の順序で削除（子テーブルから親テーブルへ）
    await prisma.clearSubmission.deleteMany({ where: { user_id: userId } });
    await prisma.entry.deleteMany({ where: { user_id: userId } });
    await prisma.feedback.deleteMany({ where: { user_id: userId } });
    await prisma.incentivePayment.deleteMany({ where: { user_id: userId } });
    await prisma.notification.deleteMany({ where: { user_id: userId } });
    await prisma.offer.deleteMany({ where: { user_id: userId } });
    await prisma.pointTransaction.deleteMany({ where: { user_id: userId } });
    await prisma.questParticipant.deleteMany({ where: { user_id: userId } });
    await prisma.review.deleteMany({ where: { reviewer_id: userId } });
  }
}
