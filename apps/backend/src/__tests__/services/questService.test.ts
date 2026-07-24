import {
  mockQuestDataAccessor,
  mockQuest,
  mockQuestWithRelations,
  mockQuestList,
} from "../mocks/QuestDataAccessor.mock";

// QuestDataAccessorをモック化
jest.mock("../../dataAccessor/dbAccessor", () => ({
  QuestDataAccessor: jest.fn().mockImplementation(() => mockQuestDataAccessor),
}));

import {
  getAllQuestsService,
  getAllQuestsIncludingDeletedService,
  getQuestByIdService,
  updateQuestStatusService,
  createQuestService,
  updateQuestService,
  deleteQuestService,
  restoreQuestService,
} from "../../services/questService";

describe("questService", () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });

  describe("getAllQuestsService", () => {
    it("パラメータなしで全クエストを取得できる", async () => {
      const result = await getAllQuestsService({});

      expect(mockQuestDataAccessor.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockQuestList);
    });

    it("キーワードでクエストを検索できる", async () => {
      const keyword = "テスト";
      const result = await getAllQuestsService({ keyword });

      expect(mockQuestDataAccessor.findAll).toHaveBeenCalledWith({ keyword });
      expect(result).toEqual(mockQuestList);
    });

    it("ステータスでクエストを絞り込める", async () => {
      const status = "active";
      const result = await getAllQuestsService({ status });

      expect(mockQuestDataAccessor.findAll).toHaveBeenCalledWith({ status });
      expect(result).toEqual(mockQuestList);
    });

    it("キーワードとステータスの両方で絞り込める", async () => {
      const keyword = "テスト";
      const status = "active";
      const result = await getAllQuestsService({ keyword, status });

      expect(mockQuestDataAccessor.findAll).toHaveBeenCalledWith({
        keyword,
        status,
      });
      expect(result).toEqual(mockQuestList);
    });

    it("participantUserId で参加者による絞り込みができる", async () => {
      const participantUserId = 42;
      const result = await getAllQuestsService({ participantUserId });

      expect(mockQuestDataAccessor.findAll).toHaveBeenCalledWith({
        participantUserId,
      });
      expect(result).toEqual(mockQuestList);
    });

    it("keyword, status, participantUserId の3条件で絞り込める", async () => {
      const keyword = "テスト";
      const status = "active";
      const participantUserId = 10;
      const result = await getAllQuestsService({ keyword, status, participantUserId });

      expect(mockQuestDataAccessor.findAll).toHaveBeenCalledWith({
        keyword,
        status,
        participantUserId,
      });
      expect(result).toEqual(mockQuestList);
    });
  });

  describe("getAllQuestsIncludingDeletedService", () => {
    it("削除済みも含めて全クエストを取得できる", async () => {
      const result = await getAllQuestsIncludingDeletedService({});

      expect(
        mockQuestDataAccessor.findAllIncludingDeleted
      ).toHaveBeenCalledWith({});
      expect(result).toEqual(mockQuestList);
    });

    it("キーワードで削除済みも含めてクエストを検索できる", async () => {
      const keyword = "テスト";
      const result = await getAllQuestsIncludingDeletedService({ keyword });

      expect(
        mockQuestDataAccessor.findAllIncludingDeleted
      ).toHaveBeenCalledWith({ keyword });
      expect(result).toEqual(mockQuestList);
    });

    it("ステータスで削除済みも含めてクエストを絞り込める", async () => {
      const status = "active";
      const result = await getAllQuestsIncludingDeletedService({ status });

      expect(
        mockQuestDataAccessor.findAllIncludingDeleted
      ).toHaveBeenCalledWith({ status });
      expect(result).toEqual(mockQuestList);
    });
  });

  describe("getQuestByIdService", () => {
    it("IDでクエストを取得できる", async () => {
      const id = 1;
      const result = await getQuestByIdService(id);

      expect(mockQuestDataAccessor.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockQuestWithRelations);
    });

    it("存在しないIDの場合はnullが返される", async () => {
      mockQuestDataAccessor.findById.mockResolvedValueOnce(null);
      const id = 999;
      const result = await getQuestByIdService(id);

      expect(mockQuestDataAccessor.findById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });

  describe("updateQuestStatusService", () => {
    it("クエストのステータスを更新できる", async () => {
      const id = 1;
      const status = "completed";
      const result = await updateQuestStatusService(id, status);

      expect(mockQuestDataAccessor.updateStatus).toHaveBeenCalledWith(
        id,
        status
      );
      expect(result).toEqual(mockQuestWithRelations);
    });
  });

  describe("createQuestService", () => {
    it("新しいクエストを作成できる", async () => {
      const questData = {
        title: "新しいクエスト",
        description: "新しいクエストの説明",
        type: "development",
        status: "active",
        maxParticipants: 3,
        tags: ["new", "test"],
        start_date: new Date("2024-02-01"),
        end_date: new Date("2024-02-28"),
        incentive_amount: 2000,
        point_amount: 200,
        note: "新しい報酬",
      };

      const result = await createQuestService(questData);

      expect(mockQuestDataAccessor.create).toHaveBeenCalledWith({
        title: questData.title,
        description: questData.description,
        type: questData.type,
        status: questData.status,
        maxParticipants: questData.maxParticipants,
        tags: questData.tags,
        start_date: questData.start_date,
        end_date: questData.end_date,
        rewards: {
          create: {
            incentive_amount: questData.incentive_amount,
            point_amount: questData.point_amount,
            note: questData.note,
          },
        },
      });
      expect(result).toEqual(mockQuest);
    });
  });

  describe("updateQuestService", () => {
    it("既存のクエストを更新できる", async () => {
      const id = 1;
      const questData = {
        title: "更新されたクエスト",
        description: "更新されたクエストの説明",
        type: "development",
        status: "active",
        maxParticipants: 5,
        tags: ["updated", "test"],
        start_date: new Date("2024-02-01"),
        end_date: new Date("2024-02-28"),
        incentive_amount: 3000,
        point_amount: 300,
        note: "更新された報酬",
      };

      const result = await updateQuestService(id, questData);

      expect(mockQuestDataAccessor.update).toHaveBeenCalledWith(id, {
        title: questData.title,
        description: questData.description,
        type: questData.type,
        status: questData.status,
        maxParticipants: questData.maxParticipants,
        tags: questData.tags,
        start_date: questData.start_date,
        end_date: questData.end_date,
        rewards: {
          update: {
            incentive_amount: questData.incentive_amount,
            point_amount: questData.point_amount,
            note: questData.note,
          },
        },
      });
      expect(result).toEqual(mockQuestWithRelations);
    });
  });

  describe("deleteQuestService", () => {
    it("クエストを論理削除できる", async () => {
      const id = 1;
      const result = await deleteQuestService(id);

      expect(mockQuestDataAccessor.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockQuest);
    });
  });

  describe("restoreQuestService", () => {
    it("削除されたクエストを復元できる", async () => {
      const id = 1;
      const result = await restoreQuestService(id);

      expect(mockQuestDataAccessor.restore).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockQuest);
    });
  });

  describe("エラーハンドリング", () => {
    it("getAllQuestsServiceでエラーが発生した場合、エラーが再スローされる", async () => {
      const error = new Error("データベースエラー");
      mockQuestDataAccessor.findAll.mockRejectedValueOnce(error);

      await expect(getAllQuestsService({})).rejects.toThrow(
        "データベースエラー"
      );
    });

    it("getQuestByIdServiceでエラーが発生した場合、エラーが再スローされる", async () => {
      const error = new Error("データベースエラー");
      mockQuestDataAccessor.findById.mockRejectedValueOnce(error);

      await expect(getQuestByIdService(1)).rejects.toThrow(
        "データベースエラー"
      );
    });

    it("createQuestServiceでエラーが発生した場合、エラーが再スローされる", async () => {
      const error = new Error("データベースエラー");
      mockQuestDataAccessor.create.mockRejectedValueOnce(error);

      const questData = {
        title: "テストクエスト",
        description: "テスト説明",
        type: "development",
        status: "active",
        maxParticipants: 3,
        tags: ["test"],
        start_date: new Date("2024-01-01"),
        end_date: new Date("2024-01-31"),
        incentive_amount: 1000,
        point_amount: 100,
        note: "テスト報酬",
      };

      await expect(createQuestService(questData)).rejects.toThrow(
        "データベースエラー"
      );
    });
  });
});
