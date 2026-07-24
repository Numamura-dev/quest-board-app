import { Prisma, type Review } from "@prisma/client";
import {
	type CreateReviewData,
	ReviewDataAccessor,
	type ReviewWithRelations,
	type UpdateReviewData,
} from "../../dataAccessor/dbAccessor/Review";

// モックデータ
export const mockReview: Review = {
	id: 1,
	reviewer_id: 1,
	guest_id: null,
	rating: new Prisma.Decimal(4.5),
	comment: "とても良いクエストでした！",
	created_at: new Date("2024-01-01"),
	quest_id: 1,
} as Review;

export const mockReviewWithRelations: ReviewWithRelations = {
	...mockReview,
	reviewer: {
		id: 1,
		name: "テストユーザー",
	},
};

export const mockReviewList: ReviewWithRelations[] = [
	mockReviewWithRelations,
	{
		...mockReviewWithRelations,
		id: 2,
		reviewer_id: 2,
		rating: new Prisma.Decimal(3.0),
		comment: "普通のクエストでした",
		reviewer: {
			id: 2,
			name: "テストユーザー2",
		},
	},
];

export const mockCreateReviewData: CreateReviewData = {
	questId: 1,
	reviewer_id: 1,
	rating: 4.5,
	comment: "素晴らしいクエストでした！",
};

export const mockUpdateReviewData: UpdateReviewData = {
	rating: 5.0,
	comment: "最高のクエストでした！",
};

// ReviewDataAccessorのモック実装
export const mockReviewDataAccessor = {
	findByQuestId: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	findByUserAndQuest: jest.fn(),
};

// モックのデフォルト実装を設定
mockReviewDataAccessor.findByQuestId.mockResolvedValue(mockReviewList);
mockReviewDataAccessor.create.mockResolvedValue(mockReviewWithRelations);
mockReviewDataAccessor.update.mockResolvedValue(mockReviewWithRelations);
mockReviewDataAccessor.delete.mockResolvedValue(mockReview);
mockReviewDataAccessor.findByUserAndQuest.mockResolvedValue(null);
