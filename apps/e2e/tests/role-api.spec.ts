import { expect, request, test } from "@playwright/test";
import { testUsers } from "../fixtures/users";
import { getTestToken } from "../helpers/auth";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001";

test.describe("API ロール制御", () => {
	test("一般ユーザーは管理者 API にアクセスできない", async () => {
		const token = await getTestToken(testUsers.user.email);

		const api = await request.newContext({
			baseURL: API_BASE_URL,
			extraHTTPHeaders: { Authorization: `Bearer ${token}` },
		});

		const res = await api.get("/api/admin/users");
		expect(res.status()).toBe(403);
	});

	test("管理者はユーザー一覧を取得できる", async () => {
		const token = await getTestToken(testUsers.admin.email);

		const api = await request.newContext({
			baseURL: API_BASE_URL,
			extraHTTPHeaders: { Authorization: `Bearer ${token}` },
		});

		const res = await api.get("/api/admin/users");
		expect(res.status()).toBe(200);
	});
});
