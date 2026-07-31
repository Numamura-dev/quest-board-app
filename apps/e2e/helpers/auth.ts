import type { Page } from "@playwright/test";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001";
const TOKEN_KEY = "google_id_token";

/**
 * テスト用トークンをバックエンドから取得する。
 * NODE_ENV !== "production" 時のみ有効な /api/test/token エンドポイントを使用。
 */
export async function getTestToken(email: string): Promise<string> {
	const res = await fetch(`${API_BASE_URL}/api/test/token`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email }),
	});
	if (!res.ok) {
		throw new Error(
			`テストトークン取得失敗 (${res.status}): ${await res.text()}`,
		);
	}
	const { token } = (await res.json()) as { token: string };
	return token;
}

/**
 * 指定メールアドレスのユーザーとして E2E ログイン状態を設定する。
 * localStorage にトークンを書き込み、ページリロード後に認証済み状態になる。
 */
export async function loginAs(
	page: Page,
	email: string,
	baseUrl = "http://localhost:3000",
): Promise<string> {
	const token = await getTestToken(email);
	await page.goto(`${baseUrl}/`);
	await page.evaluate(
		([key, t]) => localStorage.setItem(key, t),
		[TOKEN_KEY, token],
	);
	return token;
}

/** localStorage のトークンを削除してログアウト状態にする。 */
export async function logout(page: Page): Promise<void> {
	await page.evaluate((key) => localStorage.removeItem(key), TOKEN_KEY);
	await page.context().clearCookies();
}
