import { describe, expect, it } from "vitest";
import { QuestDifficulty, QuestStatus, QuestType, type Quest } from "@quest-board/types";
import {
  filterQuests,
  getSuggestedQuests,
} from "@/components/organisms/questListFilters";

const createQuest = (overrides: Partial<Quest>): Quest => ({
  id: overrides.id ?? 1,
  title: overrides.title ?? "Quest Title",
  description: overrides.description ?? "Quest Description",
  type: overrides.type ?? QuestType.Development,
  status: overrides.status ?? QuestStatus.Active,
  start_date: overrides.start_date ?? "2026-03-10T00:00:00.000Z",
  end_date: overrides.end_date ?? "2026-03-20T00:00:00.000Z",
  created_at: overrides.created_at ?? "2026-03-01T00:00:00.000Z",
  updated_at: overrides.updated_at ?? "2026-03-01T00:00:00.000Z",
  deleted_at: overrides.deleted_at,
  rewards: overrides.rewards ?? {
    incentive_amount: 1000,
    point_amount: 10,
    note: "reward",
  },
  quest_participants: overrides.quest_participants ?? [],
  _count: overrides._count ?? { quest_participants: 0 },
  maxParticipants: overrides.maxParticipants ?? 5,
  tags: overrides.tags ?? [],
  difficulty: overrides.difficulty ?? QuestDifficulty.Beginner,
  icon: overrides.icon,
});

const hiddenStatuses = ["draft", "pending", "inactive"] as const;

describe("questListFilters", () => {
  it("selectedFilter と一致する一覧だけをサジェスト候補に含める", () => {
    const completedQuest = createQuest({
      id: 1,
      title: "React 完了クエスト",
      status: QuestStatus.Completed,
    });
    const activeQuest = createQuest({
      id: 2,
      title: "React 公開中クエスト",
      status: QuestStatus.Active,
    });

    const suggestions = getSuggestedQuests([completedQuest, activeQuest], {
      selectedFilter: "completed",
      normalizedSearchQuery: "react",
      startDateFilter: "",
      endDateFilter: "",
      hiddenStatuses,
    });

    expect(suggestions).toEqual([completedQuest]);
  });

  it("日付フィルタは ISO 文字列の先頭 10 文字で比較する", () => {
    const boundaryQuest = createQuest({
      id: 1,
      start_date: "2026-03-01T23:30:00.000Z",
    });
    const outOfRangeQuest = createQuest({
      id: 2,
      start_date: "2026-03-02T00:00:00.000Z",
    });

    const filtered = filterQuests([boundaryQuest, outOfRangeQuest], {
      selectedFilter: "all",
      normalizedSearchQuery: "",
      startDateFilter: "2026-03-01",
      endDateFilter: "2026-03-01",
      hiddenStatuses,
    });

    expect(filtered).toEqual([boundaryQuest]);
  });

  it("hidden status のクエストは検索候補にも一覧にも出さない", () => {
    const pendingQuest = createQuest({
      id: 1,
      title: "React 承認待ちクエスト",
      status: QuestStatus.Pending,
    });
    const activeQuest = createQuest({
      id: 2,
      title: "React 公開中クエスト",
      status: QuestStatus.Active,
    });

    const suggestions = getSuggestedQuests([pendingQuest, activeQuest], {
      selectedFilter: "all",
      normalizedSearchQuery: "react",
      startDateFilter: "",
      endDateFilter: "",
      hiddenStatuses,
    });

    expect(suggestions).toEqual([activeQuest]);
  });
});
