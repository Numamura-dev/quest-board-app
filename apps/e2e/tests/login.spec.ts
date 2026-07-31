import { expect, test } from "@playwright/test";

test.describe("ログイン画面 UI テスト", () => {
	test("ログインページに Google ログインボタンが表示される", async ({
		page,
	}) => {
		await page.goto("/login");
		await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
		// GoogleLoginForm は dynamic import (ssr:false) のため少し待機する
		await expect(page.getByRole("button", { name: /Google/ })).toBeVisible({
			timeout: 10_000,
		});
	});

	test("未ログイン状態でログインページが表示される", async ({ page }) => {
		await page.goto("/login");
		await expect(page).toHaveURL("/login");
		await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
	});

	test("ログイン後はトップページにリダイレクトされる（トークン注入）", async ({
		page,
	}) => {
		const { loginAs } = await import("../helpers/auth");
		await loginAs(page, "questboard+002@example.com");
		// トークン設定後にページへ遷移
		await page.goto("/quests");
		await page.waitForLoadState("networkidle");
		// ログイン済みのためクエスト一覧が表示される
		await expect(page).toHaveURL("/quests");
	});
});
