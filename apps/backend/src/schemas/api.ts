import {
	QUEST_STATUS_VALUES,
	QUEST_TYPE_VALUES,
	type QuestStatusValue,
	type QuestTypeValue,
} from "@quest-board/types";
import { VALID_ROLES } from "../constants/roles";
import { z } from "../openapi/zod";

const dateStringSchema = z
	.string()
	.trim()
	.refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date");

const numericIdSchema = z.coerce.number().int().positive();

export const ErrorDetailSchema = z
	.object({
		field: z.string().optional(),
		message: z.string(),
	})
	.openapi("ErrorDetail");

export const ErrorResponseSchema = z
	.object({
		success: z.literal(false),
		error: z.string(),
		code: z.string(),
		details: z.array(ErrorDetailSchema).optional(),
	})
	.openapi("ErrorResponse");

export const UserSummarySchema = z
	.object({
		id: z.number().int().positive(),
		name: z.string(),
		email: z.string().email().optional(),
	})
	.openapi("UserSummary");

export const UserWithRoleSchema = UserSummarySchema.extend({
	role: z.enum(VALID_ROLES),
}).openapi("UserWithRole");

export const FindUserBodySchema = z
	.object({
		name: z.string().trim().min(1).optional(),
		email: z.string().trim().email().optional(),
	})
	.refine((value) => Boolean(value.name || value.email), {
		message: "name or email is required",
		path: ["name"],
	})
	.openapi("FindUserBody");

export const CreateUserBodySchema = z
	.object({
		name: z.string().trim().min(1),
		role: z.enum(VALID_ROLES).optional(),
	})
	.openapi("CreateUserBody");

export const CreateUserResponseSchema = z
	.object({
		message: z.string(),
		user: UserWithRoleSchema,
	})
	.openapi("CreateUserResponse");

export const DeleteUserResponseSchema = z
	.object({
		message: z.string(),
		user: UserSummarySchema,
	})
	.openapi("DeleteUserResponse");

export const UserIdResponseSchema = z
	.object({
		userId: z.number().int().positive(),
	})
	.openapi("UserIdResponse");

export const UserIdParamSchema = z
	.object({
		id: numericIdSchema,
	})
	.openapi("UserIdParam");

export const QuestIdParamSchema = z
	.object({
		id: numericIdSchema,
	})
	.openapi("QuestIdParam");

export const QuestJoinParamSchema = z
	.object({
		questId: numericIdSchema,
	})
	.openapi("QuestJoinParam");

export const ReviewIdParamSchema = z
	.object({
		reviewId: numericIdSchema,
	})
	.openapi("ReviewIdParam");

export const ReviewCheckParamSchema = z
	.object({
		userId: numericIdSchema,
		questId: numericIdSchema,
	})
	.openapi("ReviewCheckParam");

export const AdminUserRoleParamSchema = z
	.object({
		userId: numericIdSchema,
	})
	.openapi("AdminUserRoleParam");

export const QuestListQuerySchema = z
	.object({
		keyword: z.string().trim().min(1).optional(),
		status: z
			.enum(QUEST_STATUS_VALUES as [QuestStatusValue, ...QuestStatusValue[]])
			.optional(),
	})
	.openapi("QuestListQuery");

export const QuestStatusBodySchema = z
	.object({
		status: z.enum(
			QUEST_STATUS_VALUES as [QuestStatusValue, ...QuestStatusValue[]],
		),
	})
	.openapi("QuestStatusBody");

export const QuestMutationBodySchema = z
	.object({
		title: z.string().trim().min(1),
		description: z.string().trim().min(1),
		type: z.enum(QUEST_TYPE_VALUES as [QuestTypeValue, ...QuestTypeValue[]]),
		status: z
			.enum(QUEST_STATUS_VALUES as [QuestStatusValue, ...QuestStatusValue[]])
			.optional(),
		maxParticipants: z.coerce.number().int().positive(),
		tags: z.array(z.string().trim().min(1)).default([]),
		start_date: dateStringSchema,
		end_date: dateStringSchema,
		incentive_amount: z.coerce.number().nonnegative().default(0),
		point_amount: z.coerce.number().nonnegative().default(0),
		note: z.string().default(""),
	})
	.openapi("QuestMutationBody");

export const QuestRewardSchema = z
	.object({
		incentive_amount: z.union([z.string(), z.number()]),
		point_amount: z.number(),
		note: z.string(),
	})
	.openapi("QuestReward");

export const QuestParticipantSchema = z
	.object({
		user: z.object({
			id: z.number().int().positive(),
			name: z.string(),
		}),
		joined_at: z.string(),
		completed_at: z.string().optional(),
	})
	.openapi("QuestParticipant");

export const QuestSchema = z
	.object({
		id: z.number().int().positive(),
		title: z.string(),
		description: z.string(),
		type: z.enum(QUEST_TYPE_VALUES as [QuestTypeValue, ...QuestTypeValue[]]),
		status: z.enum(
			QUEST_STATUS_VALUES as [QuestStatusValue, ...QuestStatusValue[]],
		),
		start_date: z.string(),
		end_date: z.string(),
		created_at: z.string(),
		updated_at: z.string(),
		deleted_at: z.string().nullable().optional(),
		rewards: QuestRewardSchema,
		quest_participants: z.array(QuestParticipantSchema),
		_count: z.object({
			quest_participants: z.number().int().nonnegative(),
		}),
		maxParticipants: z.number().int().positive(),
		tags: z.array(z.string()),
	})
	.openapi("Quest");

export const MessageResponseSchema = z
	.object({
		message: z.string(),
	})
	.openapi("MessageResponse");

export const QuestActionResponseSchema = z
	.object({
		message: z.string(),
		quest: QuestSchema,
	})
	.openapi("QuestActionResponse");

export const JoinQuestResponseSchema = z
	.object({
		success: z.literal(true),
		message: z.string(),
	})
	.openapi("JoinQuestResponse");

export const ReviewSchema = z
	.object({
		id: z.number().int().positive(),
		reviewer_id: z.number().int().positive().optional(),
		quest_id: z.number().int().positive().optional(),
		rating: z.number().int().min(1).max(5).optional(),
		comment: z.string().nullable().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
	})
	.passthrough()
	.openapi("Review");

export const ReviewCreateBodySchema = z
	.object({
		reviewer_id: z.coerce.number().int().positive(),
		rating: z.coerce.number().int().min(1).max(5),
		comment: z.string().optional(),
	})
	.openapi("ReviewCreateBody");

export const ReviewUpdateBodySchema = z
	.object({
		rating: z.coerce.number().int().min(1).max(5),
		comment: z.string().optional(),
	})
	.openapi("ReviewUpdateBody");

export const ExistsResponseSchema = z
	.object({
		exists: z.boolean(),
	})
	.openapi("ExistsResponse");

export const AdminRoleUpdateBodySchema = z
	.object({
		role: z.enum(VALID_ROLES),
	})
	.openapi("AdminRoleUpdateBody");
