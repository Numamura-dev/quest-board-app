import { Prisma, type Quest } from "@prisma/client";
import {
	CreateQuestData,
	QuestDataAccessor,
	type QuestWithRelations,
} from "../../dataAccessor/dbAccessor/Quest";

// モックデータ
export const mockQuest: Quest = {
	id: 1,
	title: "テストクエスト",
	description: "テスト用のクエストです",
	type: "development",
	status: "active",
	maxParticipants: 5,
	tags: ["test", "development"],
	start_date: new Date("2024-01-01"),
	end_date: new Date("2024-01-31"),
	created_at: new Date("2024-01-01"),
	updated_at: new Date("2024-01-01"),
	rewards_id: 1,
} as Quest;

export const mockQuestWithRelations: QuestWithRelations = {
	...mockQuest,
	deleted_at: null,
	rewards: {
		id: 1,
		quest_id: 1,
		incentive_amount: new Prisma.Decimal(1000),
		point_amount: 100,
		note: "テスト報酬",
		created_at: new Date("2024-01-01"),
		updated_at: new Date("2024-01-01"),
	},
	quest_participants: [],
	_count: {
		quest_participants: 0,
	},
} as QuestWithRelations;

export const mockQuestList: QuestWithRelations[] = [
	mockQuestWithRelations,
	{
		...mockQuestWithRelations,
		id: 2,
		title: "テストクエスト2",
		status: "completed",
	},
];

// QuestDataAccessorのモック実装
export const mockQuestDataAccessor = {
	findAll: jest.fn(),
	findAllIncludingDeleted: jest.fn(),
	findById: jest.fn(),
	updateStatus: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	restore: jest.fn(),
};

// モックのデフォルト実装を設定
mockQuestDataAccessor.findAll.mockResolvedValue(mockQuestList);
mockQuestDataAccessor.findAllIncludingDeleted.mockResolvedValue(mockQuestList);
mockQuestDataAccessor.findById.mockResolvedValue(mockQuestWithRelations);
mockQuestDataAccessor.updateStatus.mockResolvedValue(mockQuestWithRelations);
mockQuestDataAccessor.create.mockResolvedValue(mockQuest);
mockQuestDataAccessor.update.mockResolvedValue(mockQuestWithRelations);
mockQuestDataAccessor.delete.mockResolvedValue(mockQuest);
mockQuestDataAccessor.restore.mockResolvedValue(mockQuest);
