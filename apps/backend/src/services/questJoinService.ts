import { prisma } from "../config/db";
import { logger } from "../config/logger";

/**
 * クエスト参加登録を行う。
 * 同時参加を考慮し、対象クエストをロックしたうえで重複参加と定員超過を検証する。
 * @param userId - 参加するユーザー ID
 * @param questId - 参加対象のクエスト ID
 * @returns 登録結果。失敗時は理由コードを返す
 */
export const addUserToQuest = async (userId: number, questId: number) => {
  try {
    // トランザクション開始
    await prisma.$transaction(async (tx) => {
      // ① クエスト行をロック
      const quest = await tx.$queryRaw<
        { id: number; maxParticipants: number | null }[]
      >`SELECT id, max_participants as maxParticipants FROM quests WHERE id = ${questId} FOR UPDATE`;

      if (quest.length === 0) {
        throw new Error("Quest not found");
      }

      const maxParticipants = quest[0].maxParticipants;

      // ② 重複参加チェック（ユニーク制約でも防げるが明示的にチェック）
      const existing = await tx.questParticipant.findUnique({
        where: { user_id_quest_id: { user_id: userId, quest_id: questId } },
      });
      if (existing) {
        throw new Error("Already joined");
      }

      // ③ 現在の参加人数を取得
      const count = await tx.questParticipant.count({
        where: { quest_id: questId },
      });

      if (maxParticipants !== null && count >= maxParticipants) {
        throw new Error("Quest is full");
      }

      // ④ 参加登録
      await tx.questParticipant.create({
        data: {
          user_id: userId,
          quest_id: questId,
        },
      });
    });

    // 正常終了
    return { success: true };
  } catch (err: unknown) {
    // エラーハンドリング（呼び出し側で理由別に処理できるようにする）
    if (err instanceof Error) {
      if (err.message === "Already joined") {
        return { success: false, reason: "duplicate" };
      }
      if (err.message === "Quest is full") {
        return { success: false, reason: "full" };
      }
      if (err.message === "Quest not found") {
        return { success: false, reason: "not_found" };
      }
    }

    logger.error({ err, userId, questId }, "クエスト参加エラー");
    return { success: false, reason: "error" };
  }
};
