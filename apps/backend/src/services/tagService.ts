import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { logger } from "../config/logger";

/**
 * アクティブなクエスト（論理削除されていない）から全タグを集約して返す
 *
 * タグはクエストの JSON カラムに格納されているため、
 * 全件取得後にアプリケーション層で集約する。
 *
 * @returns 重複を除いたタグ一覧（アルファベット/五十音順）
 */
export async function getActiveTagsService(): Promise<string[]> {
  const quests = await prisma.quest.findMany({
    where: {
      deleted_at: null,
    },
    select: {
      tags: true,
    },
  });

  const tagSet = new Set<string>();

  for (const quest of quests) {
    if (Array.isArray(quest.tags)) {
      for (const tag of quest.tags) {
        if (typeof tag === "string" && tag.trim()) {
          tagSet.add(tag.trim());
        }
      }
    }
  }

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, "ja"));
}

/**
 * 未使用タグの検出: 削除済みクエストにのみ存在し、
 * アクティブクエストに存在しないタグを返す
 *
 * @returns 未使用タグ一覧
 */
export async function getUnusedTagsService(): Promise<string[]> {
  const [activeQuests, allQuests] = await Promise.all([
    prisma.quest.findMany({
      where: { deleted_at: null },
      select: { tags: true },
    }),
    prisma.quest.findMany({
      select: { tags: true },
    }),
  ]);

  const activeTags = new Set<string>();
  for (const quest of activeQuests) {
    if (Array.isArray(quest.tags)) {
      for (const tag of quest.tags) {
        if (typeof tag === "string" && tag.trim()) {
          activeTags.add(tag.trim());
        }
      }
    }
  }

  const allTags = new Set<string>();
  for (const quest of allQuests) {
    if (Array.isArray(quest.tags)) {
      for (const tag of quest.tags) {
        if (typeof tag === "string" && tag.trim()) {
          allTags.add(tag.trim());
        }
      }
    }
  }

  const unusedTags = Array.from(allTags)
    .filter((tag) => !activeTags.has(tag))
    .sort((a, b) => a.localeCompare(b, "ja"));

  return unusedTags;
}

/**
 * 未使用タグの定期クリーンアップジョブ
 *
 * 削除済みクエストからのみ参照されているタグを、
 * 対象クエストの tags フィールドから除去する。
 *
 * @returns クリーンアップされたクエスト数
 */
export async function cleanupUnusedTagsService(): Promise<{
  cleanedQuestCount: number;
  removedTags: string[];
}> {
  const unusedTags = await getUnusedTagsService();

  if (unusedTags.length === 0) {
    logger.info("未使用タグは存在しません。クリーンアップをスキップします。");
    return { cleanedQuestCount: 0, removedTags: [] };
  }

  logger.info({ unusedTags }, `未使用タグを検出: ${unusedTags.length} 件`);

  // 削除済みクエストから未使用タグを除去
  const deletedQuestsWithTags = await prisma.quest.findMany({
    where: {
      deleted_at: { not: null },
      NOT: [{ tags: { equals: Prisma.DbNull } }],
    },
    select: { id: true, tags: true },
  });

  let cleanedQuestCount = 0;

  for (const quest of deletedQuestsWithTags) {
    if (!Array.isArray(quest.tags)) continue;

    const filteredTags = quest.tags.filter(
      (tag): tag is string =>
        typeof tag === "string" && !unusedTags.includes(tag.trim())
    );

    if (filteredTags.length !== quest.tags.length) {
      await prisma.quest.update({
        where: { id: quest.id },
        data: { tags: filteredTags },
      });
      cleanedQuestCount++;
    }
  }

  logger.info(
    { cleanedQuestCount, removedTags: unusedTags },
    `タグクリーンアップ完了: ${cleanedQuestCount} 件のクエストを更新`
  );

  return { cleanedQuestCount, removedTags: unusedTags };
}
