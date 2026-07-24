const mockPrisma = {
  quest: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock("../../config/db", () => ({
  prisma: mockPrisma,
}));

import {
  getActiveTagsService,
  getUnusedTagsService,
  cleanupUnusedTagsService,
} from "../../services/tagService";

describe("tagService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getActiveTagsService", () => {
    it("アクティブクエストのタグを重複なしで返す", async () => {
      mockPrisma.quest.findMany.mockResolvedValue([
        { tags: ["TypeScript", "React"] },
        { tags: ["TypeScript", "Node.js"] },
        { tags: ["React"] },
      ]);

      const result = await getActiveTagsService();

      expect(result).toEqual(["Node.js", "React", "TypeScript"]);
    });

    it("tags が null のクエストはスキップする", async () => {
      mockPrisma.quest.findMany.mockResolvedValue([
        { tags: null },
        { tags: ["Backend"] },
      ]);

      const result = await getActiveTagsService();

      expect(result).toEqual(["Backend"]);
    });

    it("クエストが0件のとき空配列を返す", async () => {
      mockPrisma.quest.findMany.mockResolvedValue([]);

      const result = await getActiveTagsService();

      expect(result).toEqual([]);
    });

    it("アクティブクエストのみ取得するクエリを発行する", async () => {
      mockPrisma.quest.findMany.mockResolvedValue([]);

      await getActiveTagsService();

      expect(mockPrisma.quest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deleted_at: null },
        })
      );
    });
  });

  describe("getUnusedTagsService", () => {
    it("アクティブクエストに存在しないタグを未使用として返す", async () => {
      mockPrisma.quest.findMany
        .mockResolvedValueOnce([
          // アクティブクエスト
          { tags: ["Active"] },
        ])
        .mockResolvedValueOnce([
          // 全クエスト
          { tags: ["Active"] },
          { tags: ["Unused"] },
        ]);

      const result = await getUnusedTagsService();

      expect(result).toEqual(["Unused"]);
    });

    it("全てのタグがアクティブな場合は空配列を返す", async () => {
      mockPrisma.quest.findMany
        .mockResolvedValueOnce([{ tags: ["tag1", "tag2"] }])
        .mockResolvedValueOnce([{ tags: ["tag1", "tag2"] }]);

      const result = await getUnusedTagsService();

      expect(result).toEqual([]);
    });
  });

  describe("cleanupUnusedTagsService", () => {
    it("未使用タグがない場合はクリーンアップをスキップする", async () => {
      // getUnusedTagsService のモック (内部で2回 findMany を呼ぶ)
      mockPrisma.quest.findMany
        .mockResolvedValueOnce([{ tags: ["active-tag"] }])
        .mockResolvedValueOnce([{ tags: ["active-tag"] }]);

      const result = await cleanupUnusedTagsService();

      expect(result).toEqual({ cleanedQuestCount: 0, removedTags: [] });
    });

    it("未使用タグを含む削除済みクエストを更新する", async () => {
      mockPrisma.quest.findMany
        .mockResolvedValueOnce([{ tags: ["active"] }]) // アクティブクエスト
        .mockResolvedValueOnce([{ tags: ["active", "unused"] }]) // 全クエスト
        .mockResolvedValueOnce([{ id: 99, tags: ["active", "unused"] }]); // 削除済みクエスト

      mockPrisma.quest.update.mockResolvedValue({ id: 99, tags: ["active"] });

      const result = await cleanupUnusedTagsService();

      expect(result.cleanedQuestCount).toBe(1);
      expect(result.removedTags).toContain("unused");
      expect(mockPrisma.quest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 99 },
          data: { tags: ["active"] },
        })
      );
    });
  });
});
