import fs from "node:fs";
import path from "node:path";
import { type Page, expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

const BASE_URL = process.env.FRONTEND_BASE_URL ?? "http://localhost:3000";
const SCREENSHOT_DIR = path.resolve(__dirname, "../../docs/public/manual");
const MANUAL_PREFIX = "操作マニュアル撮影";

const USER_EMAIL = "manager@test.com";
const USER_PASSWORD = "password123";
const ADMIN_EMAIL = "master@test.com";
const ADMIN_PASSWORD = "password123";

dotenv.config({ path: path.resolve(__dirname, "../../backend/.env.local") });

const prisma = new PrismaClient();

type ManualFixture = {
	userId: number;
	adminId: number;
	activeQuestId: number;
	completedQuestId: number;
	pendingQuestId: number;
	activeQuestTitle: string;
	completedQuestTitle: string;
	pendingQuestTitle: string;
};

type FirebaseLoginResult = {
	localId: string;
	idToken: string;
};

test.describe.configure({ mode: "serial" });

async function login(page: Page, email: string, password: string) {
	await page.goto(`${BASE_URL}/login`);
	await page.getByPlaceholder("メールアドレス").fill(email);
	await page.getByPlaceholder("パスワード").fill(password);

	const dialogPromise = page.waitForEvent("dialog", { timeout: 15_000 });
	await page.getByRole("button", { name: "ログイン" }).click();
	const dialog = await dialogPromise;
	expect(dialog.message()).toContain("ログイン成功");
	await dialog.accept();

	await page.waitForURL(`${BASE_URL}/`, { timeout: 10_000 });
	await page.waitForLoadState("networkidle");
}

async function logout(page: Page) {
	await page.context().clearCookies();
	await page.goto(`${BASE_URL}/`);
	await page.evaluate(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
}

function readFrontendEnv() {
	const envPath = path.resolve(__dirname, "../../frontend/.env.local");
	const envText = fs.readFileSync(envPath, "utf8");
	return Object.fromEntries(
		envText.split(/\r?\n/).flatMap((line) => {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
				return [];
			}

			const separatorIndex = trimmed.indexOf("=");
			const key = trimmed.slice(0, separatorIndex);
			const value = trimmed.slice(separatorIndex + 1).replace(/^"|"$/g, "");
			return [[key, value]];
		}),
	);
}

async function getFirebaseLogin(
	email: string,
	password: string,
): Promise<FirebaseLoginResult> {
	const frontendEnv = readFrontendEnv();
	const apiKey = frontendEnv.NEXT_PUBLIC_FIREBASE_API_KEY;
	if (!apiKey || apiKey === "your-api-key") {
		throw new Error(
			"NEXT_PUBLIC_FIREBASE_API_KEY が未設定です。apps/frontend/.env.local を確認してください。",
		);
	}

	const response = await fetch(
		`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email, password, returnSecureToken: true }),
		},
	);
	const body = await response.json();

	if (!response.ok) {
		throw new Error(
			`Firebase テストユーザーでログインできません: ${email} (${body.error?.message ?? response.status})`,
		);
	}

	return {
		localId: body.localId,
		idToken: body.idToken,
	};
}

async function capture(page: Page, fileName: string) {
	await page.waitForLoadState("networkidle");
	await page.screenshot({
		path: path.join(SCREENSHOT_DIR, fileName),
		fullPage: true,
	});
}

async function cleanupManualData() {
	const manualQuests = await prisma.quest.findMany({
		where: { title: { startsWith: MANUAL_PREFIX } },
		select: { id: true, rewards_id: true },
	});
	const questIds = manualQuests.map((quest) => quest.id);
	const rewardIds = manualQuests
		.map((quest) => quest.rewards_id)
		.filter((id): id is number => id !== null);

	if (questIds.length > 0) {
		await prisma.review.deleteMany({ where: { quest_id: { in: questIds } } });
		await prisma.questParticipant.deleteMany({
			where: { quest_id: { in: questIds } },
		});
		await prisma.notification.deleteMany({
			where: { message: { contains: MANUAL_PREFIX } },
		});
		await prisma.quest.deleteMany({ where: { id: { in: questIds } } });
	}

	if (rewardIds.length > 0) {
		await prisma.reward.deleteMany({ where: { id: { in: rewardIds } } });
	}
}

async function createQuest(data: {
	title: string;
	description: string;
	type: string;
	status: string;
	tags: string[];
	startDate: Date;
	endDate: Date;
	incentiveAmount: number;
	pointAmount: number;
}) {
	const reward = await prisma.reward.create({
		data: {
			incentive_amount: data.incentiveAmount,
			point_amount: data.pointAmount,
			note: `${MANUAL_PREFIX} 用報酬`,
		},
	});

	return prisma.quest.create({
		data: {
			title: data.title,
			description: data.description,
			type: data.type,
			status: data.status,
			maxParticipants: 8,
			tags: data.tags,
			start_date: data.startDate,
			end_date: data.endDate,
			rewards_id: reward.id,
		},
	});
}

async function setupManualFixtures(): Promise<ManualFixture> {
	await cleanupManualData();

	const [userLogin, adminLogin] = await Promise.all([
		getFirebaseLogin(USER_EMAIL, USER_PASSWORD),
		getFirebaseLogin(ADMIN_EMAIL, ADMIN_PASSWORD),
	]);

	const user = await prisma.user.upsert({
		where: { email: USER_EMAIL },
		create: {
			name: "マニュアル一般ユーザー",
			email: USER_EMAIL,
			role: "user",
			firebase_uid: userLogin.localId,
		},
		update: {
			role: "user",
			firebase_uid: userLogin.localId,
		},
	});
	const admin = await prisma.user.upsert({
		where: { email: ADMIN_EMAIL },
		create: {
			name: "マニュアル管理者",
			email: ADMIN_EMAIL,
			role: "admin",
			firebase_uid: adminLogin.localId,
		},
		update: {
			role: "admin",
			firebase_uid: adminLogin.localId,
		},
	});

	const baseDate = new Date("2026-07-24T00:00:00Z");
	const activeQuestTitle = `${MANUAL_PREFIX}: React UI 改善`;
	const completedQuestTitle = `${MANUAL_PREFIX}: API 設計レビュー完了`;
	const pendingQuestTitle = `${MANUAL_PREFIX}: 承認待ちデータ分析`;

	const activeQuest = await createQuest({
		title: activeQuestTitle,
		description:
			"クエスト一覧、検索、参加ダイアログの操作を撮影するためのクエストです。",
		type: "development",
		status: "active",
		tags: ["React", "UI", "manual"],
		startDate: baseDate,
		endDate: new Date("2026-08-07T23:59:59Z"),
		incentiveAmount: 30000,
		pointAmount: 300,
	});

	const completedQuest = await createQuest({
		title: completedQuestTitle,
		description:
			"レビュー一覧とレビュー投稿導線を撮影するための完了済みクエストです。",
		type: "design",
		status: "completed",
		tags: ["API", "review", "manual"],
		startDate: new Date("2026-06-01T00:00:00Z"),
		endDate: new Date("2026-06-30T23:59:59Z"),
		incentiveAmount: 50000,
		pointAmount: 500,
	});

	const pendingQuest = await createQuest({
		title: pendingQuestTitle,
		description: "管理者の承認待ち一覧を撮影するためのクエストです。",
		type: "analysis",
		status: "pending",
		tags: ["admin", "manual"],
		startDate: new Date("2026-07-20T00:00:00Z"),
		endDate: new Date("2026-08-20T23:59:59Z"),
		incentiveAmount: 45000,
		pointAmount: 450,
	});

	await prisma.questParticipant.createMany({
		data: [
			{
				user_id: user.id,
				quest_id: completedQuest.id,
				completed_at: new Date(),
			},
			{ user_id: user.id, quest_id: activeQuest.id },
		],
		skipDuplicates: true,
	});

	await prisma.review.create({
		data: {
			reviewer_id: admin.id,
			quest_id: completedQuest.id,
			rating: 4,
			comment: "要件整理から実装レビューまで進めやすいクエストでした。",
		},
	});

	await prisma.notification.create({
		data: {
			user_id: user.id,
			message: `${MANUAL_PREFIX}: 新しいオファー通知があります。`,
			is_read: false,
		},
	});

	return {
		userId: user.id,
		adminId: admin.id,
		activeQuestId: activeQuest.id,
		completedQuestId: completedQuest.id,
		pendingQuestId: pendingQuest.id,
		activeQuestTitle,
		completedQuestTitle,
		pendingQuestTitle,
	};
}

test.describe("画面操作マニュアル用スクリーンショット", () => {
	let fixture: ManualFixture;

	test.beforeAll(async () => {
		fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
		fixture = await setupManualFixtures();
	});

	test.afterAll(async () => {
		await cleanupManualData();
		await prisma.$disconnect();
	});

	test("実装済み画面を撮影する", async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 1000 });

		await logout(page);
		await page.goto(`${BASE_URL}/`);
		await expect(
			page.getByRole("heading", { name: "ようこそ クエスト掲示板 へ" }),
		).toBeVisible();
		await capture(page, "home-logged-out.png");

		await page.goto(`${BASE_URL}/login`);
		await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
		await capture(page, "login.png");

		await page.goto(`${BASE_URL}/signUp`);
		await expect(page.getByRole("heading", { name: "新規登録" })).toBeVisible();
		await capture(page, "signup.png");

		await login(page, USER_EMAIL, USER_PASSWORD);
		await page.goto(`${BASE_URL}/quests`, { waitUntil: "networkidle" });
		await expect(page.getByText(fixture.activeQuestTitle)).toBeVisible({
			timeout: 15_000,
		});
		await capture(page, "quests-list.png");

		await page.getByPlaceholder("タイトル・本文・タグで検索").fill("React UI");
		await page.locator("select").first().selectOption("active");
		await expect(page.getByText(fixture.activeQuestTitle)).toBeVisible();
		await capture(page, "quests-filtered.png");

		await page
			.locator("div")
			.filter({ hasText: fixture.activeQuestTitle })
			.getByRole("button", { name: "クエストに参加する" })
			.first()
			.click();
		await expect(page.getByRole("button", { name: "参加する" })).toBeVisible();
		await capture(page, "quest-join-dialog.png");
		await page.getByRole("button", { name: "キャンセル" }).click();

		await page.goto(`${BASE_URL}/quests/${fixture.completedQuestId}`, {
			waitUntil: "networkidle",
		});
		await expect(
			page.getByRole("heading", { name: fixture.completedQuestTitle }),
		).toBeVisible({ timeout: 15_000 });
		await expect(page.getByRole("heading", { name: "レビュー" })).toBeVisible();
		await capture(page, "quest-detail-review.png");

		await page.goto(`${BASE_URL}/mypage`, { waitUntil: "networkidle" });
		await expect(
			page.getByRole("heading", { name: "クエスト履歴" }),
		).toBeVisible({ timeout: 15_000 });
		await capture(page, "mypage.png");

		await logout(page);
		await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
		await page.goto(`${BASE_URL}/admin/dashboard`, {
			waitUntil: "networkidle",
		});
		await expect(
			page.getByRole("button", { name: "ダッシュボード" }),
		).toBeVisible({ timeout: 15_000 });
		await capture(page, "admin-dashboard.png");

		await page.getByRole("button", { name: "クエスト管理" }).click();
		await expect(
			page.getByRole("heading", { name: "クエスト管理" }),
		).toBeVisible();
		await page.getByPlaceholder("クエストを検索...").fill(MANUAL_PREFIX);
		await expect(page.getByText(fixture.pendingQuestTitle)).toBeVisible();
		await capture(page, "admin-quests.png");

		await page.getByRole("button", { name: "ユーザー管理" }).click();
		await expect(
			page.getByRole("heading", { name: "ユーザー管理" }),
		).toBeVisible();
		await expect(page.getByTestId(`user-card-${fixture.userId}`)).toBeVisible();
		await capture(page, "admin-users.png");
	});
});
