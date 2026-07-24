import { expect, test } from "@playwright/test";

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001";
const API_BASE = `${BASE_URL}/api`;

type ReviewRecord = {
	id: number;
	reviewer_id: number;
	quest_id?: number;
	questId?: number;
};

test.describe.configure({ mode: "serial" });

test.describe("レビューAPI E2Eテスト", () => {
	let questId: number;
	let userId: number;
	let reviewId: number;

	test.beforeAll(async ({ request }) => {
		// 実際に存在するクエストとユーザーを取得
		const questsResponse = await request.get(`${API_BASE}/quests`);
		const quests = await questsResponse.json();
		if (!Array.isArray(quests) || quests.length === 0) {
			throw new Error(
				"テスト用のクエストが見つかりません。seedデータを実行してください。",
			);
		}
		questId = quests[0].id;

		const usersResponse = await request.get(`${API_BASE}/users`);
		const users = await usersResponse.json();
		if (!Array.isArray(users) || users.length === 0) {
			throw new Error(
				"テスト用のユーザーが見つかりません。seedデータを実行してください。",
			);
		}
		userId = users[0].id;

		// 念のため古いレビューを削除（存在してもエラーにしない）
		// まず既存のレビューを確認して削除
		try {
			const checkResponse = await request.get(
				`${API_BASE}/users/${userId}/reviews?questId=${questId}`,
			);
			if (checkResponse.ok()) {
				const checkBody = await checkResponse.json();
				if (checkBody.exists) {
					// 既存のレビューIDを取得するためにレビュー一覧を取得
					const reviewsResponse = await request.get(
						`${API_BASE}/quests/${questId}/reviews`,
					);
					if (reviewsResponse.ok()) {
						const reviews = (await reviewsResponse.json()) as ReviewRecord[];
						const existingReview = reviews.find(
							(r) =>
								r.reviewer_id === userId &&
								(r.quest_id === questId || r.questId === questId),
						);
						if (existingReview) {
							await request.delete(`${API_BASE}/reviews/${existingReview.id}`);
						}
					}
				}
			}
		} catch (error) {
			// エラーは無視
		}
	});

	// レビュー作成
	test("POST /quests/:questId/reviews — 新規レビュー作成できる", async ({
		request,
	}) => {
		const response = await request.post(
			`${API_BASE}/quests/${questId}/reviews`,
			{
				data: {
					reviewer_id: userId,
					rating: 4,
					comment: "とても良いクエストでした！",
				},
			},
		);

		if (response.status() !== 201) {
			const errorBody = await response.json();
			console.error("エラーレスポンス:", JSON.stringify(errorBody, null, 2));
			console.error("questId:", questId, "userId:", userId);
		}

		expect(response.status()).toBe(201);

		const body = await response.json();
		expect(body).toHaveProperty("id");
		// questIdはquest_idまたはquestIdのどちらかで返される可能性がある
		expect(body.quest_id || body.questId).toBe(questId);
		expect(body.reviewer_id).toBe(userId);

		reviewId = body.id;
	});

	// 重複投稿制限
	test("POST /quests/:questId/reviews — 同一ユーザーは重複投稿できない", async ({
		request,
	}) => {
		const response = await request.post(
			`${API_BASE}/quests/${questId}/reviews`,
			{
				data: {
					reviewer_id: userId,
					rating: 5,
					comment: "再投稿テスト",
				},
			},
		);

		expect(response.status()).toBe(400);
		const body = await response.json();
		expect(body.message).toContain("既にレビューを投稿済み");
	});

	// レビュー一覧取得
	test("GET /quests/:questId/reviews — クエストのレビュー一覧を取得できる", async ({
		request,
	}) => {
		const response = await request.get(`${API_BASE}/quests/${questId}/reviews`);
		expect(response.status()).toBe(200);

		const reviews = (await response.json()) as ReviewRecord[];
		expect(Array.isArray(reviews)).toBe(true);
		// reviewIdが設定されている場合のみチェック
		if (reviewId) {
			expect(reviews.some((r) => r.id === reviewId)).toBe(true);
		}
	});

	// レビュー更新
	test("PUT /reviews/:reviewId — レビューを更新できる", async ({ request }) => {
		const response = await request.put(`${API_BASE}/reviews/${reviewId}`, {
			data: {
				rating: 3,
				comment: "やや難しかったが楽しい！",
			},
		});

		expect(response.status()).toBe(200);
		const updated = await response.json();
		// ratingはDecimal型なので、数値として比較
		expect(Number(updated.rating)).toBe(3);
		expect(updated.comment).toContain("楽しい");
	});

	// 投稿済み確認
	test("GET /users/:userId/reviews?questId=:questId — 投稿済みか確認できる", async ({
		request,
	}) => {
		const response = await request.get(
			`${API_BASE}/users/${userId}/reviews?questId=${questId}`,
		);
		expect(response.status()).toBe(200);

		const body = await response.json();
		expect(body.exists).toBe(true);
	});

	// レビュー削除
	test("DELETE /reviews/:reviewId — レビューを削除できる", async ({
		request,
	}) => {
		const response = await request.delete(`${API_BASE}/reviews/${reviewId}`);
		expect(response.status()).toBe(204);
	});

	// 削除後確認
	test("GET /users/:userId/reviews?questId=:questId — 削除後はfalseになる", async ({
		request,
	}) => {
		const response = await request.get(
			`${API_BASE}/users/${userId}/reviews?questId=${questId}`,
		);
		expect(response.status()).toBe(200);

		const body = await response.json();
		expect(body.exists).toBe(false);
	});
});
