import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/httpClient", () => ({
  authenticatedHttpRequest: vi.fn(),
}));

vi.mock("@/services/quest", () => ({
  questService: {
    getAllQuests: vi.fn(),
  },
}));

import {
  categorizeQuestsByStatus,
  toDisplayNotification,
} from "@/hooks/useMyPageData";
import { QuestDifficulty, QuestStatus, QuestType, type Quest } from "@/types/quest";

const createQuest = (overrides: Partial<Quest>): Quest => ({
  id: 1,
  title: "quest",
  description: "desc",
  type: QuestType.Development,
  status: QuestStatus.Active,
  start_date: "2024-01-01T00:00:00Z",
  end_date: "2024-12-31T00:00:00Z",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  rewards: { incentive_amount: 1000, point_amount: 100, note: "" },
  quest_participants: [],
  _count: { quest_participants: 0 },
  maxParticipants: 5,
  tags: [],
  difficulty: QuestDifficulty.Beginner,
  ...overrides,
});

describe("useMyPageData helpers", () => {
  it("通知レスポンスを表示用の型へ変換する", () => {
    const result = toDisplayNotification({
      id: 10,
      message: "通知",
      isRead: false,
      createdAt: "2024-01-01T12:34:56Z",
    });

    expect(result.id).toBe(10);
    expect(result.message).toBe("通知");
    expect(result.type).toBe("info");
    expect(result.timestamp).toContain("2024");
  });

  it("クエストを status ごとに分類する", () => {
    const result = categorizeQuestsByStatus([
      createQuest({ id: 1, status: QuestStatus.Active }),
      createQuest({ id: 2, status: QuestStatus.InProgress }),
      createQuest({ id: 3, status: QuestStatus.Completed }),
      createQuest({ id: 4, status: QuestStatus.Pending }),
    ]);

    expect(result.participating.map((quest) => quest.id)).toEqual([1, 2]);
    expect(result.completed.map((quest) => quest.id)).toEqual([3]);
    expect(result.applied.map((quest) => quest.id)).toEqual([4]);
  });
});
