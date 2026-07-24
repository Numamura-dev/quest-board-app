import { prisma } from "../../config/db";
import { Reward } from "@prisma/client";

/**
 * 報酬作成用のデータインターフェース
 */
export interface CreateRewardData {
  quest_id: number;
  incentive_amount: number;
  point_amount: number;
  note: string;
}

/**
 * 報酬更新用のデータインターフェース
 */
export interface UpdateRewardData {
  quest_id?: number;
  incentive_amount?: number;
  point_amount?: number;
  note?: string;
}

/**
 * 報酬テーブルへのアクセスを提供する。
 */
export class RewardDataAccessor {
  /**
   * クエスト ID に紐づく報酬一覧を取得する。
   * @param questId - 対象クエスト ID
   * @returns 報酬一覧
   */
  async findByQuestId(questId: number): Promise<Reward[]> {
    return await prisma.reward.findMany({
      where: { quest_id: questId },
    });
  }

  /**
   * 報酬を新規作成する。
   * @param data - 作成する報酬情報
   * @returns 作成後の報酬情報
   */
  async create(data: CreateRewardData): Promise<Reward> {
    return await prisma.reward.create({
      data,
    });
  }

  /**
   * 既存報酬を更新する。
   * @param id - 更新対象の報酬 ID
   * @param data - 更新内容
   * @returns 更新後の報酬情報
   */
  async update(id: number, data: UpdateRewardData): Promise<Reward> {
    return await prisma.reward.update({
      where: { id },
      data,
    });
  }

  /**
   * 報酬を削除する。
   * @param id - 削除対象の報酬 ID
   * @returns 削除後の報酬情報
   */
  async delete(id: number): Promise<Reward> {
    return await prisma.reward.delete({
      where: { id },
    });
  }

  /**
   * 報酬 ID から 1 件取得する。
   * @param id - 対象報酬 ID
   * @returns 報酬情報。見つからない場合は `null`
   */
  async findById(id: number): Promise<Reward | null> {
    return await prisma.reward.findUnique({
      where: { id },
    });
  }
}
