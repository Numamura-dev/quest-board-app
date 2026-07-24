import { expect, test } from "@playwright/test";
import { testUsers } from "../fixtures/users";

const login = async (page, email, password) => {
	// alertダイアログを待機
	const dialogPromise = page.waitForEvent("dialog");

	await page.goto("/login");

	// placeholderでinputを特定（name属性がないため）
	await page.getByPlaceholder("メールアドレス").fill(email);
	await page.getByPlaceholder("パスワード").fill(password);

	// ログインボタンをクリック（type="submit"ではなくonClickハンドラー）
	await page.getByRole("button", { name: "ログイン" }).click();

	// ダイアログを待機して閉じる
	const dialog = await dialogPromise;
	await dialog.accept();

	// ログイン成功後は"/"に遷移することを確認
	await page.waitForURL("/", { timeout: 10000 });
};

test.describe("ロール制御（画面アクセス）", () => {
	test("一般ユーザーは管理画面にアクセスできない", async ({ page }) => {
		await login(page, testUsers.user.email, testUsers.user.password);

		await page.goto("/admin/dashboard");

		// ページが読み込まれるまで待機
		await page.waitForLoadState("networkidle");

		// 一般ユーザーは404ページにリダイレクトされるか、エラーメッセージが表示される
		// または、APIリクエストが失敗してエラーメッセージが表示される
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

		// 404、アクセス権限エラー、またはAPIエラーが表示されることを確認
		expect(is404 || hasAccessDenied || hasError).toBeTruthy();
	});

	test("マネージャーは管理画面にアクセスできる", async ({ page }) => {
		await login(page, testUsers.manager.email, testUsers.manager.password);

		await page.goto("/admin/dashboard");

		// ダッシュボードページにアクセスできることを確認
		await expect(page).toHaveURL("/admin/dashboard");

		// ページが読み込まれるまで待機
		await page.waitForLoadState("networkidle");

		// 「ユーザー管理」タブが表示されることを確認
		await expect(
			page.getByRole("button", { name: "ユーザー管理" }),
		).toBeVisible();

		// 「ユーザー管理」タブをクリック
		await page.getByRole("button", { name: "ユーザー管理" }).click();

		// h2タグで「ユーザー管理」が表示されることを確認
		await expect(page.locator("h2")).toContainText("ユーザー管理");
	});

	test("URL直打ちで不正アクセスできない", async ({ page }) => {
		await login(page, testUsers.user.email, testUsers.user.password);

		await page.goto("/admin/dashboard");

		// ページが読み込まれるまで待機
		await page.waitForLoadState("networkidle");

		// 一般ユーザーは404ページにリダイレクトされるか、エラーメッセージが表示される
		// または、APIリクエストが失敗してエラーメッセージが表示される
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

		// 404、アクセス権限エラー、またはAPIエラーが表示されることを確認
		expect(is404 || hasAccessDenied || hasError).toBeTruthy();
	});
});
