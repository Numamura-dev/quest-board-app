import { randomUUID } from "node:crypto";
// @ts-nocheck
import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.FRONTEND_BASE_URL ?? "http://localhost:3000";

test.describe.configure({ mode: "serial" });

test.describe("Admin Dashboard UI E2E", () => {
	const prisma = new PrismaClient();
	const uniqueId = randomUUID();
	const cleanupIds = {
		userIds: [] as number[],
		questIds: [] as number[],
	};

	const fixtures = {
		userName: `dashboard-user-${uniqueId.slice(0, 8)}`,
		userEmail: `dashboard-user-${uniqueId}@example.com`,
		pendingQuestTitle: `ダッシュボードE2E承認待ち-${uniqueId.slice(0, 6)}`,
		completedQuestTitle: `ダッシュボードE2E完了-${uniqueId.slice(0, 6)}`,
		userId: 0,
	};

	test.beforeAll(async () => {
		const baseDates = {
			start: new Date(),
			end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		};

		const createdUser = await prisma.user.create({
			data: {
				name: fixtures.userName,
				email: fixtures.userEmail,
				role: "user",
			},
		});
		fixtures.userId = createdUser.id;
		cleanupIds.userIds.push(createdUser.id);

		const pendingQuest = await prisma.quest.create({
			data: {
				title: fixtures.pendingQuestTitle,
				description: "ダッシュボードE2Eテスト用の承認待ちクエストです。",
				type: "development",
				status: "pending",
				maxParticipants: 10,
				start_date: baseDates.start,
				end_date: baseDates.end,
				tags: ["dashboard", uniqueId],
			},
		});
		cleanupIds.questIds.push(pendingQuest.id);

		const completedQuest = await prisma.quest.create({
			data: {
				title: fixtures.completedQuestTitle,
				description: "ダッシュボードE2Eテスト用の完了クエストです。",
				type: "design",
				status: "completed",
				maxParticipants: 8,
				start_date: baseDates.start,
				end_date: baseDates.end,
				tags: ["dashboard", uniqueId, "completed"],
			},
		});
		cleanupIds.questIds.push(completedQuest.id);
	});

	test.afterAll(async () => {
		await prisma.quest.deleteMany({
			where: {
				id: { in: cleanupIds.questIds },
			},
		});

		await prisma.user.deleteMany({
			where: {
				id: { in: cleanupIds.userIds },
			},
		});

		await prisma.$disconnect();
	});

	test("ダッシュボードの主要タブとフィルタを操作できる", async ({ page }) => {
		await page.goto(`${BASE_URL}/admin/dashboard`);

		await expect(
			page.getByRole("button", { name: "ダッシュボード" }),
		).toBeVisible();

		await page.getByRole("button", { name: "クエスト管理" }).click();

		const questFilter = page.locator("select").last();
		await questFilter.selectOption("all");

		await expect(
			page.getByRole("heading", {
				name: fixtures.pendingQuestTitle,
				exact: true,
			}),
		).toBeVisible({ timeout: 15000 });
		await expect(
			page.getByRole("heading", {
				name: fixtures.completedQuestTitle,
				exact: true,
			}),
		).toBeVisible();

		await questFilter.selectOption("pending");
		await expect(
			page.getByRole("heading", {
				name: fixtures.pendingQuestTitle,
				exact: true,
			}),
		).toBeVisible();
		await expect(
			page.getByRole("heading", {
				name: fixtures.completedQuestTitle,
				exact: true,
			}),
		).toHaveCount(0);

		await questFilter.selectOption("completed");
		await expect(
			page.getByRole("heading", {
				name: fixtures.completedQuestTitle,
				exact: true,
			}),
		).toBeVisible();
		await expect(
			page.getByRole("heading", {
				name: fixtures.pendingQuestTitle,
				exact: true,
			}),
		).toHaveCount(0);

		await questFilter.selectOption("all");
		const searchBox = page.getByPlaceholder("クエストを検索...");
		await searchBox.fill(uniqueId.slice(0, 6));
		await expect(
			page.getByRole("heading", {
				name: fixtures.pendingQuestTitle,
				exact: true,
			}),
		).toBeVisible();
		await expect(
			page.getByRole("heading", {
				name: fixtures.completedQuestTitle,
				exact: true,
			}),
		).toBeVisible();

		await searchBox.fill("");

		await page.getByRole("button", { name: "ユーザー管理" }).click();

		const userCard = page.getByTestId(`user-card-${fixtures.userId}`);

		await expect(userCard).toBeVisible();

		await page
			.getByTestId(`user-role-select-${fixtures.userId}`)
			.selectOption("admin");
		await expect(
			page.getByText("ユーザーのロールをadminに変更しました", { exact: false }),
		).toBeVisible();
		await expect(userCard.locator("select")).toHaveValue("admin");
	});
});
