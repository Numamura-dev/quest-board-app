import {
	QUEST_STATUS_LABELS,
	QUEST_STATUS_VALUES,
	QuestDifficulty,
	QuestStatus,
	type QuestStatusValue,
	QuestType,
} from "@quest-board/types";

export const HIDDEN_QUEST_STATUSES: readonly QuestStatusValue[] = [
	QuestStatus.Draft,
	QuestStatus.Pending,
	QuestStatus.Inactive,
];

const QUEST_STATUS_BADGE_CLASSES: Record<QuestStatusValue, string> = {
	[QuestStatus.Pending]: "bg-yellow-500",
	[QuestStatus.Active]: "bg-blue-500",
	[QuestStatus.Completed]: "bg-green-500",
	[QuestStatus.Draft]: "bg-gray-500",
	[QuestStatus.InProgress]: "bg-purple-500",
	[QuestStatus.Inactive]: "bg-gray-400",
};

const QUEST_DIFFICULTY_BADGE_CLASSES: Record<QuestDifficulty, string> = {
	[QuestDifficulty.Beginner]: "bg-green-500",
	[QuestDifficulty.Intermediate]: "bg-yellow-500",
	[QuestDifficulty.Advanced]: "bg-red-500",
};

const questStatusSet = new Set<string>(QUEST_STATUS_VALUES);

const isQuestStatusValue = (value: string): value is QuestStatusValue => {
	return questStatusSet.has(value);
};

export const getQuestStatusLabel = (status: string): string => {
	if (!isQuestStatusValue(status)) {
		return status;
	}
	return QUEST_STATUS_LABELS[status];
};

export const getQuestStatusBadgeClass = (status: string): string => {
	if (!isQuestStatusValue(status)) {
		return "bg-gray-500";
	}
	return QUEST_STATUS_BADGE_CLASSES[status];
};

export const getQuestDifficultyBadgeClass = (
	difficulty?: QuestDifficulty,
): string => {
	if (!difficulty) {
		return "bg-gray-500";
	}
	return QUEST_DIFFICULTY_BADGE_CLASSES[difficulty] ?? "bg-gray-500";
};

type QuestTypeIconKind = "wrench" | "book" | "sword";

export const getQuestTypeIconKind = (type?: string): QuestTypeIconKind => {
	switch (type) {
		case QuestType.Development:
			return "wrench";
		case QuestType.Learning:
			return "book";
		case QuestType.Challenge:
		case QuestType.Planning:
		case QuestType.Maintenance:
		case QuestType.Design:
			return "sword";
		default:
			return "sword";
	}
};

export type QuestRibbonStatus = "participating" | "completed" | "applied";

export const getQuestRibbonStatus = (status?: string): QuestRibbonStatus => {
	if (status === QuestStatus.Active || status === QuestStatus.InProgress) {
		return "participating";
	}
	if (status === QuestStatus.Completed || status === "cleared") {
		return "completed";
	}
	return "applied";
};
