import { expect, test } from "@playwright/test";
import { testUsers } from "../fixtures/users";
import { loginAs } from "../helpers/auth";

test.describe("ロール制御（画面アクセス）", () => {
	test("一般ユーザーは管理画面にアクセスできない", async ({ page }) => {
		await loginAs(page, testUsers.user.email);
		await page.goto("/admin/dashboard");
		await page.waitForLoadState("networkidle");

		const bodyText = await page.locator("body").textContent();
		const url = page.url();
		const is404 =
			url.includes("404") ||
			bodyText?.includes("404") ||
			bodyText?.includes("This page could not be found");
		const hasAccessDenied = bodyText?.includes("アクセス権限がありません");
		const hasError =
			bodyText?.includes("データの取得に失敗しました") ||
			bodyText?.includes("エラー");

		expect(is404 || hasAccessDenied || hasError).toBeTruthy();
	});

	test("管理者は管理画面にアクセスできる", async ({ page }) => {
		await loginAs(page, testUsers.admin.email);
		await page.goto("/admin/dashboard");
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveURL("/admin/dashboard");
		await expect(
			page.getByRole("button", { name: "ユーザー管理" }),
		).toBeVisible();
	});

	test("URL 直打ちで一般ユーザーが管理画面に不正アクセスできない", async ({
		page,
	}) => {
		await loginAs(page, testUsers.user.email);
		await page.goto("/admin/dashboard");
		await page.waitForLoadState("networkidle");

		const bodyText = await page.locator("body").textContent();
		const url = page.url();
		const is404 =
			url.includes("404") ||
			bodyText?.includes("404") ||
			bodyText?.includes("This page could not be found");
		const hasAccessDenied = bodyText?.includes("アクセス権限がありません");
		const hasError =
			bodyText?.includes("データの取得に失敗しました") ||
			bodyText?.includes("エラー");

		expect(is404 || hasAccessDenied || hasError).toBeTruthy();
	});
});
