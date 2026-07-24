// e2e/tests/role-api.spec.ts
import { expect, request, test } from "@playwright/test";
import { testUsers } from "../fixtures/users";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001";

const getIdToken = async (page, email, password) => {
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

	const token = await page.evaluate(() => {
		return window.localStorage.getItem("authToken");
	});

	return token;
};

test.describe("API ロール制御", () => {
	// TODO: 一般ユーザーはユーザー一覧を取得できない処理を追加する
	// test("一般ユーザーはユーザー一覧を取得できない", async ({ page }) => {
	//   const token = await getIdToken(page, testUsers.user.email, testUsers.user.password);

	//   const api = await request.newContext({
	//     baseURL: "http://localhost:3001",
	//     extraHTTPHeaders: {
	//       Authorization: `Bearer ${token}`,
	//     },
	//   });

	//   const res = await api.get("/api/admin/users");

	//   expect(res.status()).toBe(403);
	// });

	test("マネージャーはユーザー一覧を取得できる", async ({ page }) => {
		const token = await getIdToken(
			page,
			testUsers.manager.email,
			testUsers.manager.password,
		);

		const api = await request.newContext({
			baseURL: API_BASE_URL,
			extraHTTPHeaders: {
				Authorization: `Bearer ${token}`,
			},
		});

		const res = await api.get("/api/admin/users");

		expect(res.status()).toBe(200);
	});
});
