import {
	OpenAPIRegistry,
	OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import {
	AdminRoleUpdateBodySchema,
	AdminUserRoleParamSchema,
	CreateUserBodySchema,
	CreateUserResponseSchema,
	DeleteUserResponseSchema,
	ErrorResponseSchema,
	ExistsResponseSchema,
	FindUserBodySchema,
	JoinQuestResponseSchema,
	MessageResponseSchema,
	QuestActionResponseSchema,
	QuestIdParamSchema,
	QuestJoinParamSchema,
	QuestListQuerySchema,
	QuestMutationBodySchema,
	QuestSchema,
	QuestStatusBodySchema,
	ReviewCheckParamSchema,
	ReviewCreateBodySchema,
	ReviewIdParamSchema,
	ReviewSchema,
	ReviewUpdateBodySchema,
	UserIdParamSchema,
	UserIdResponseSchema,
	UserSummarySchema,
	UserWithRoleSchema,
} from "../schemas/api";
import { z } from "./zod";

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
});

const jsonContent = (schema: z.ZodTypeAny) => ({
	"application/json": {
		schema,
	},
});

registry.registerPath({
	method: "get",
	path: "/api/quests",
	summary: "クエスト一覧を取得する",
	request: {
		query: QuestListQuerySchema,
	},
	responses: {
		200: {
			description: "クエスト一覧",
			content: jsonContent(z.array(QuestSchema)),
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/quests/admin/all",
	summary: "削除済みを含むクエスト一覧を取得する",
	security: [{ bearerAuth: [] }],
	request: {
		query: QuestListQuerySchema,
	},
	responses: {
		200: {
			description: "クエスト一覧",
			content: jsonContent(z.array(QuestSchema)),
		},
		401: {
			description: "未認証",
			content: jsonContent(ErrorResponseSchema),
		},
		403: {
			description: "権限不足",
			content: jsonContent(ErrorResponseSchema),
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/quests/{id}",
	summary: "クエストを取得する",
	request: {
		params: QuestIdParamSchema,
	},
	responses: {
		200: {
			description: "クエスト詳細",
			content: jsonContent(QuestSchema),
		},
		404: {
			description: "未検出",
			content: jsonContent(ErrorResponseSchema),
		},
	},
});

registry.registerPath({
	method: "post",
	path: "/api/quests",
	summary: "クエストを作成する",
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: jsonContent(QuestMutationBodySchema),
		},
	},
	responses: {
		201: {
			description: "作成結果",
			content: jsonContent(QuestSchema),
		},
		400: {
			description: "バリデーションエラー",
			content: jsonContent(ErrorResponseSchema),
		},
	},
});

registry.registerPath({
	method: "put",
	path: "/api/quests/{id}",
	summary: "クエストを更新する",
	security: [{ bearerAuth: [] }],
	request: {
		params: QuestIdParamSchema,
		body: {
			content: jsonContent(QuestMutationBodySchema),
		},
	},
	responses: {
		200: {
			description: "更新結果",
			content: jsonContent(QuestSchema),
		},
		400: {
			description: "バリデーションエラー",
			content: jsonContent(ErrorResponseSchema),
		},
	},
});

registry.registerPath({
	method: "patch",
	path: "/api/quests/{id}/status",
	summary: "クエストのステータスを更新する",
	security: [{ bearerAuth: [] }],
	request: {
		params: QuestIdParamSchema,
		body: {
			content: jsonContent(QuestStatusBodySchema),
		},
	},
	responses: {
		200: {
			description: "更新結果",
			content: jsonContent(QuestSchema),
		},
		400: {
			description: "バリデーションエラー",
			content: jsonContent(ErrorResponseSchema),
		},
	},
});

for (const [path, summary] of [
	["/api/quests/{id}/submit", "クエストを承認待ちにする"],
	["/api/quests/{id}/restore", "削除済みクエストを復元する"],
	["/api/quests/{id}/reactivate", "停止中クエストを再公開する"],
] as const) {
	registry.registerPath({
		method: "patch",
		path,
		summary,
		security: [{ bearerAuth: [] }],
		request: {
			params: QuestIdParamSchema,
		},
		responses: {
			200: {
				description: "更新結果",
				content: jsonContent(QuestActionResponseSchema),
			},
			400: {
				description: "バリデーションエラー",
				content: jsonContent(ErrorResponseSchema),
			},
		},
	});
}

registry.registerPath({
	method: "delete",
	path: "/api/quests/{id}",
	summary: "クエストを論理削除する",
	security: [{ bearerAuth: [] }],
	request: {
		params: QuestIdParamSchema,
	},
	responses: {
		200: {
			description: "削除結果",
			content: jsonContent(MessageResponseSchema),
		},
	},
});

registry.registerPath({
	method: "post",
	path: "/api/quests/{questId}/join",
	summary: "クエストに参加する",
	security: [{ bearerAuth: [] }],
	request: {
		params: QuestJoinParamSchema,
	},
	responses: {
		200: {
			description: "参加結果",
			content: jsonContent(JoinQuestResponseSchema),
		},
		400: {
			description: "参加不可",
			content: jsonContent(ErrorResponseSchema),
		},
	},
});

registry.registerPath({
	method: "post",
	path: "/api/users/find",
	summary: "名前またはメールアドレスでユーザーを検索する",
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: jsonContent(FindUserBodySchema),
		},
	},
	responses: {
		200: {
			description: "ユーザー情報",
			content: jsonContent(UserSummarySchema),
		},
		404: {
			description: "未検出",
			content: jsonContent(ErrorResponseSchema),
		},
	},
});

registry.registerPath({
	method: "post",
	path: "/api/users/get-id",
	summary: "名前またはメールアドレスからユーザー ID を取得する",
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: jsonContent(FindUserBodySchema),
		},
	},
	responses: {
		200: {
			description: "ユーザー ID",
			content: jsonContent(UserIdResponseSchema),
		},
	},
});

registry.registerPath({
	method: "post",
	path: "/api/users/create",
	summary: "ログイン中ユーザーを作成する",
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: jsonContent(CreateUserBodySchema),
		},
	},
	responses: {
		201: {
			description: "作成結果",
			content: jsonContent(CreateUserResponseSchema),
		},
		409: {
			description: "競合",
			content: jsonContent(ErrorResponseSchema),
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/users/me",
	summary: "ログイン中ユーザーを取得する",
	security: [{ bearerAuth: [] }],
	responses: {
		200: {
			description: "ユーザー情報",
			content: jsonContent(UserWithRoleSchema),
		},
		404: {
			description: "未検出",
			content: jsonContent(ErrorResponseSchema),
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/users/all",
	summary: "全ユーザー一覧を取得する",
	security: [{ bearerAuth: [] }],
	responses: {
		200: {
			description: "ユーザー一覧",
			content: jsonContent(z.array(UserWithRoleSchema)),
		},
	},
});

registry.registerPath({
	method: "delete",
	path: "/api/users/{id}",
	summary: "ユーザーを削除する",
	security: [{ bearerAuth: [] }],
	request: {
		params: UserIdParamSchema,
	},
	responses: {
		200: {
			description: "削除結果",
			content: jsonContent(DeleteUserResponseSchema),
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/reviews/quest/{questId}",
	summary: "クエストのレビュー一覧を取得する",
	request: {
		params: QuestJoinParamSchema,
	},
	responses: {
		200: {
			description: "レビュー一覧",
			content: jsonContent(z.array(ReviewSchema)),
		},
	},
});

registry.registerPath({
	method: "post",
	path: "/api/reviews/quest/{questId}",
	summary: "クエストにレビューを投稿する",
	request: {
		params: QuestJoinParamSchema,
		body: {
			content: jsonContent(ReviewCreateBodySchema),
		},
	},
	responses: {
		201: {
			description: "作成結果",
			content: jsonContent(ReviewSchema),
		},
	},
});

registry.registerPath({
	method: "put",
	path: "/api/reviews/{reviewId}",
	summary: "レビューを更新する",
	request: {
		params: ReviewIdParamSchema,
		body: {
			content: jsonContent(ReviewUpdateBodySchema),
		},
	},
	responses: {
		200: {
			description: "更新結果",
			content: jsonContent(ReviewSchema),
		},
	},
});

registry.registerPath({
	method: "delete",
	path: "/api/reviews/{reviewId}",
	summary: "レビューを削除する",
	request: {
		params: ReviewIdParamSchema,
	},
	responses: {
		204: {
			description: "削除完了",
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/reviews/check/{userId}/{questId}",
	summary: "レビュー投稿済みか確認する",
	request: {
		params: ReviewCheckParamSchema,
	},
	responses: {
		200: {
			description: "確認結果",
			content: jsonContent(ExistsResponseSchema),
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/admin/users",
	summary: "管理者向けユーザー一覧を取得する",
	security: [{ bearerAuth: [] }],
	responses: {
		200: {
			description: "ユーザー一覧",
			content: jsonContent(z.array(UserWithRoleSchema)),
		},
	},
});

registry.registerPath({
	method: "put",
	path: "/api/admin/users/{userId}/role",
	summary: "ユーザーロールを更新する",
	security: [{ bearerAuth: [] }],
	request: {
		params: AdminUserRoleParamSchema,
		body: {
			content: jsonContent(AdminRoleUpdateBodySchema),
		},
	},
	responses: {
		200: {
			description: "更新結果",
			content: jsonContent(CreateUserResponseSchema),
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/openapi.json",
	summary: "OpenAPI 定義を取得する",
	responses: {
		200: {
			description: "OpenAPI JSON",
		},
	},
});

export const openApiDocument = new OpenApiGeneratorV3(
	registry.definitions,
).generateDocument({
	openapi: "3.0.0",
	info: {
		title: "Quest Board API",
		version: "1.0.0",
		description:
			"Express backend の request validation と同期する OpenAPI ドキュメントです。",
	},
	servers: [
		{
			url: "http://localhost:3001",
			description: "Local development",
		},
	],
});
