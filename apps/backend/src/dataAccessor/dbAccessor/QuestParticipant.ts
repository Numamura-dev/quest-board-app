import { prisma } from "../../config/db";
import { QuestParticipant } from "@prisma/client";

/**
 * クエスト参加者作成用のデータインターフェース
 */
export interface CreateQuestParticipantData {
  quest_id: number;
  user_id: number;
  joined_at?: Date;
  cleared_at?: Date | null;
}

/**
 * クエスト参加者テーブルへのアクセスを提供する。
 */
export class QuestParticipantDataAccessor {
  /**
   * クエスト ID に紐づく参加者一覧を取得する。
   * @param questId - 対象クエスト ID
   * @returns 参加者一覧
   */
  async findByQuestId(questId: number): Promise<QuestParticipant[]> {
    return await prisma.questParticipant.findMany({
      where: { quest_id: questId },
      include: {
        user: true,
      },
    });
  }

  /**
   * ユーザーが参加しているクエスト一覧を取得する。
   * @param userId - 対象ユーザー ID
   * @returns 参加クエスト一覧
   */
  async findByUserId(userId: number): Promise<QuestParticipant[]> {
    return await prisma.questParticipant.findMany({
      where: { user_id: userId },
      include: {
        quest: true,
      },
    });
  }

  /**
   * 参加者レコードを新規作成する。
   * @param data - 作成する参加情報
   * @returns 作成後の参加情報
   */
  async create(data: CreateQuestParticipantData): Promise<QuestParticipant> {
    return await prisma.questParticipant.create({
      data,
    });
  }

  /**
   * 参加者レコードを削除する。
   * @param id - 削除対象の参加者 ID
   * @returns 削除後の参加者情報
   */
  async delete(id: number): Promise<QuestParticipant> {
    return await prisma.questParticipant.delete({
      where: { id },
    });
  }

  /**
   * 特定ユーザーが対象クエストへ参加済みかを取得する。
   * @param questId - 対象クエスト ID
   * @param userId - 対象ユーザー ID
   * @returns 一致した参加情報。見つからない場合は `null`
   */
  async findByQuestAndUser(
    questId: number,
    userId: number
  ): Promise<QuestParticipant | null> {
    return await prisma.questParticipant.findFirst({
      where: {
        quest_id: questId,
        user_id: userId,
      },
    });
  }
}
