export enum QuestStatus {
	Draft = "draft",
	Pending = "pending",
	Active = "active",
	InProgress = "in_progress",
	Inactive = "inactive",
	Completed = "completed",
}

export type QuestStatusValue = `${QuestStatus}`;

export const QUEST_STATUS_VALUES = Object.values(
	QuestStatus,
) as QuestStatusValue[];

export const QUEST_STATUS_LABELS: Record<QuestStatusValue, string> = {
	draft: "下書き",
	pending: "承認待ち",
	active: "公開中",
	in_progress: "進行中",
	inactive: "停止中",
	completed: "完了",
};

export enum QuestDifficulty {
	Beginner = "初級",
	Intermediate = "中級",
	Advanced = "上級",
}

export type QuestDifficultyValue = `${QuestDifficulty}`;

export const QUEST_DIFFICULTY_VALUES = Object.values(
	QuestDifficulty,
) as QuestDifficultyValue[];

export enum QuestType {
	Development = "development",
	Design = "design",
	Learning = "learning",
	Challenge = "challenge",
	Planning = "planning",
	Maintenance = "maintenance",
	Marketing = "marketing",
	Research = "research",
	Other = "other",
}

export type QuestTypeValue = `${QuestType}`;

export const QUEST_TYPE_VALUES = Object.values(QuestType) as QuestTypeValue[];

export const QUEST_TYPE_LABELS: Record<QuestTypeValue, string> = {
	development: "開発",
	design: "デザイン",
	learning: "学習",
	challenge: "チャレンジ",
	planning: "企画",
	maintenance: "保守",
	marketing: "マーケティング",
	research: "リサーチ",
	other: "その他",
};

export enum QuestIcon {
	Book = "Book",
	Sword = "Sword",
	Wrench = "Wrench",
}

export type UserRole = "user" | "admin";

export interface User {
	id: number;
	name: string;
	email?: string;
	role?: UserRole;
	firebase_uid?: string;
}

export interface QuestParticipant {
	user: Pick<User, "id" | "name">;
	joined_at: string;
	completed_at?: string;
}

export interface QuestReward {
	incentive_amount: string | number;
	point_amount: number;
	note: string;
}

export interface Quest {
	id: number;
	title: string;
	description: string;
	type: QuestType;
	status: QuestStatus;
	start_date: string;
	end_date: string;
	created_at: string;
	updated_at: string;
	deleted_at?: string | null;
	rewards: QuestReward;
	quest_participants: QuestParticipant[];
	_count: {
		quest_participants: number;
	};
	maxParticipants: number;
	tags: string[];
	difficulty?: QuestDifficulty;
	icon?: QuestIcon;
}

export interface Review {
	id: number;
	user: string;
	score: number;
	comment: string;
	date: string;
	reviewer_id?: number;
}

export interface NewReview {
	score: number;
	comment: string;
}
