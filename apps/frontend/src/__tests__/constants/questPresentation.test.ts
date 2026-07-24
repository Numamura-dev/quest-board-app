import {
	HIDDEN_QUEST_STATUSES,
	getQuestDifficultyBadgeClass,
	getQuestRibbonStatus,
	getQuestStatusBadgeClass,
	getQuestStatusLabel,
	getQuestTypeIconKind,
} from "@/constants/questPresentation";
import { QuestDifficulty, QuestStatus, QuestType } from "@quest-board/types";
import { describe, expect, it } from "vitest";

describe("questPresentation", () => {
	it("status の表示ラベルと色クラスを返す", () => {
		expect(getQuestStatusLabel(QuestStatus.Pending)).toBe("承認待ち");
		expect(getQuestStatusBadgeClass(QuestStatus.Pending)).toBe("bg-yellow-500");
	});

	it("未知の status はフォールバック値を返す", () => {
		expect(getQuestStatusLabel("unknown_status")).toBe("unknown_status");
		expect(getQuestStatusBadgeClass("unknown_status")).toBe("bg-gray-500");
	});

	it("difficulty から色クラスを返す", () => {
		expect(getQuestDifficultyBadgeClass(QuestDifficulty.Beginner)).toBe(
			"bg-green-500",
		);
		expect(getQuestDifficultyBadgeClass(undefined)).toBe("bg-gray-500");
	});

	it("type からアイコン種別を返す", () => {
		expect(getQuestTypeIconKind(QuestType.Development)).toBe("wrench");
		expect(getQuestTypeIconKind(QuestType.Learning)).toBe("book");
		expect(getQuestTypeIconKind(QuestType.Design)).toBe("sword");
	});

	it("status から ribbon 表示状態を返す", () => {
		expect(getQuestRibbonStatus(QuestStatus.Active)).toBe("participating");
		expect(getQuestRibbonStatus(QuestStatus.Completed)).toBe("completed");
		expect(getQuestRibbonStatus("pending")).toBe("applied");
	});

	it("一般ユーザーに非表示の status 一覧を持つ", () => {
		expect(HIDDEN_QUEST_STATUSES).toEqual([
			QuestStatus.Draft,
			QuestStatus.Pending,
			QuestStatus.Inactive,
		]);
	});
});
