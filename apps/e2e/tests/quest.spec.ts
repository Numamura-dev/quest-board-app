import { randomUUID } from "node:crypto";
import {
	type APIRequestContext,
	expect,
	request,
	test,
} from "@playwright/test";

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001";

type QuestPayload = {
	title: string;
	description: string;
	type: string;
	status?: string;
	maxParticipants: number;
	tags: string[];
	start_date: string;
	end_date: string;
	incentive_amount: number;
	point_amount: number;
	note: string;
};

type QuestListItem = {
	id: number;
	title: string;
	status: string;
	deleted_at?: string | null;
};

test.describe.configure({ mode: "serial" });

test.describe("Quest API E2E Test", () => {
	let apiContext: APIRequestContext;
	const createdQuestIds = new Set<number>();
	const deletedQuestIds = new Set<number>();

	const uniqueSuffix = randomUUID().slice(0, 8);
	let primaryQuestId: number | null = null;
	let softDeletedQuestId: number | null = null;

	const buildQuestPayload = (
		overrides: Partial<QuestPayload> = {},
	): QuestPayload => {
		const now = Date.now();
		const start = new Date(now + 24 * 60 * 60 * 1000);
		const end = new Date(now + 8 * 24 * 60 * 60 * 1000);
		return {
			title: `E2Eクエスト-${uniqueSuffix}`,
			description: "E2Eテストで生成したクエストです。",
			type: "development",
			status: "pending",
			maxParticipants: 5,
			tags: ["e2e", uniqueSuffix],
			start_date: start.toISOString(),
			end_date: end.toISOString(),
			incentive_amount: 5000,
			point_amount: 150,
			note: "自動テスト用",
			...overrides,
		};
	};

	const createQuest = async (overrides?: Partial<QuestPayload>) => {
		const payload = buildQuestPayload(overrides);
		const response = await apiContext.post("/api/quests", {
			data: payload,
		});
		expect(response.ok(), "Quest creation should succeed").toBeTruthy();
		const body = await response.json();
		createdQuestIds.add(body.id);
		return { body, payload };
	};

	const deleteQuestIfNeeded = async (questId: number) => {
		if (deletedQuestIds.has(questId)) return;
		const response = await apiContext.delete(`/api/quests/${questId}`);
		if (response.ok()) {
			deletedQuestIds.add(questId);
		}
	};

	test.beforeAll(async ({ playwright }) => {
		apiContext = await request.newContext({
			baseURL: BASE_URL,
		});
	});

	test.afterAll(async () => {
		for (const questId of createdQuestIds) {
			await deleteQuestIfNeeded(questId);
		}
		await apiContext.dispose();
	});

	test("POST /api/quests で必須項目を含むクエストを作成できる", async () => {
		const { body, payload } = await createQuest();
		primaryQuestId = body.id;

		expect(body.title).toBe(payload.title);
		expect(body.status).toBe(payload.status);
		expect(body.maxParticipants).toBe(payload.maxParticipants);
		expect(Array.isArray(body.tags)).toBeTruthy();
	});

	test("POST /api/quests は必須項目欠落時に 400 を返す", async () => {
		const response = await apiContext.post("/api/quests", {
			data: {
				description: "タイトルなし",
			},
		});
		expect(response.status()).toBe(400);
		const body = await response.json();
		expect(body.message).toContain("required");
	});

	test("GET /api/quests は keyword と status パラメータで絞り込みできる", async () => {
		expect(primaryQuestId).not.toBeNull();
		const { payload } = await createQuest({
			title: `E2Eフィルタ-${uniqueSuffix}`,
			status: "pending",
		});

		const response = await apiContext.get(
			`/api/quests?keyword=${encodeURIComponent("フィルタ")}&status=pending`,
		);
		expect(response.ok()).toBeTruthy();

		const quests = (await response.json()) as QuestListItem[];
		const match = quests.find((quest) => quest.title === payload.title);
		expect(match).toBeTruthy();
		expect(match.status).toBe("pending");
	});

	test("PUT /api/quests/:id で詳細情報を更新できる", async () => {
		expect(primaryQuestId).not.toBeNull();
		const updatedPayload = buildQuestPayload({
			title: `E2E更新-${uniqueSuffix}`,
			description: "更新済み説明",
			status: "active",
			note: "更新後ノート",
		});

		const response = await apiContext.put(`/api/quests/${primaryQuestId}`, {
			data: updatedPayload,
		});
		expect(response.ok()).toBeTruthy();

		const detailResponse = await apiContext.get(
			`/api/quests/${primaryQuestId}`,
		);
		expect(detailResponse.ok()).toBeTruthy();
		const quest = await detailResponse.json();
		expect(quest.title).toBe(updatedPayload.title);
		expect(quest.description).toBe(updatedPayload.description);
		expect(quest.status).toBe("active");
	});

	test("PATCH /api/quests/:id/status で公開/非公開を切り替えできる", async () => {
		expect(primaryQuestId).not.toBeNull();

		const deactivate = await apiContext.patch(
			`/api/quests/${primaryQuestId}/status`,
			{
				data: { status: "inactive" },
			},
		);
		expect(deactivate.ok()).toBeTruthy();
		const inactiveQuest = await deactivate.json();
		expect(inactiveQuest.status).toBe("inactive");

		const reactivate = await apiContext.patch(
			`/api/quests/${primaryQuestId}/status`,
			{
				data: { status: "active" },
			},
		);
		expect(reactivate.ok()).toBeTruthy();
		const activeQuest = await reactivate.json();
		expect(activeQuest.status).toBe("active");
	});

	test("POST /api/quests/:id/submissions で下書きクエストを承認待ちにできる", async () => {
		const { body } = await createQuest({
			title: `E2E承認-${uniqueSuffix}`,
			status: "draft",
		});

		const response = await apiContext.post(
			`/api/quests/${body.id}/submissions`,
		);
		expect(response.ok()).toBeTruthy();
		const result = await response.json();
		expect(result.quest.status).toBe("pending");
	});

	test("DELETE /api/quests/:id でクエストを論理削除し一覧から除外できる", async () => {
		const { body } = await createQuest({
			title: `E2E削除-${uniqueSuffix}`,
			status: "active",
		});
		softDeletedQuestId = body.id;

		const deleteResponse = await apiContext.delete(
			`/api/quests/${softDeletedQuestId}`,
		);
		expect(deleteResponse.ok()).toBeTruthy();
		deletedQuestIds.add(softDeletedQuestId);

		const listResponse = await apiContext.get("/api/quests");
		expect(listResponse.ok()).toBeTruthy();
		const quests = (await listResponse.json()) as QuestListItem[];
		const match = quests.find((quest) => quest.id === softDeletedQuestId);
		expect(match).toBeUndefined();

		const adminResponse = await apiContext.get(
			"/api/quests?includeDeleted=true",
		);
		expect(adminResponse.ok()).toBeTruthy();
		const adminQuests = (await adminResponse.json()) as QuestListItem[];
		const deletedQuest = adminQuests.find(
			(quest) => quest.id === softDeletedQuestId,
		);
		expect(deletedQuest).toBeTruthy();
		expect(deletedQuest.deleted_at).toBeTruthy();
	});

	test("POST /api/quests/:id/restorations で論理削除したクエストを復元できる", async () => {
		if (!softDeletedQuestId) {
			test.skip(true, "復元対象のクエストがありません");
		}
		const response = await apiContext.post(
			`/api/quests/${softDeletedQuestId}/restorations`,
		);
		expect(response.ok()).toBeTruthy();
		const result = await response.json();
		expect(result.quest.deleted_at).toBeNull();

		const listResponse = await apiContext.get("/api/quests");
		const quests = (await listResponse.json()) as QuestListItem[];
		const restoredQuest = quests.find(
			(quest) => quest.id === softDeletedQuestId,
		);
		expect(restoredQuest).toBeTruthy();
		if (softDeletedQuestId) {
			deletedQuestIds.delete(softDeletedQuestId);
		}
	});
});
