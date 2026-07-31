import { ApiError } from "@/services/apiError";
import { authenticatedHttpRequest, httpRequest } from "@/services/httpClient";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetIdToken = vi.fn<() => string | null>();

vi.mock("@/services/auth/googleAuth", () => ({
	getIdToken: () => mockGetIdToken(),
}));

// config モック
vi.mock("@/constants/config", () => ({
	API_CONFIG: { BASE_URL: "http://localhost:3001/api" },
}));

describe("httpRequest", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("GET リクエストを正しく送信し JSON を返す", async () => {
		const mockData = [{ id: 1, title: "テストクエスト" }];
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(JSON.stringify(mockData), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		const result = await httpRequest({ path: "/quests" });

		expect(fetch).toHaveBeenCalledWith(
			"http://localhost:3001/api/quests",
			expect.objectContaining({ method: "GET" }),
		);
		expect(result).toEqual(mockData);
	});

	it("クエリパラメータが URL に付与される", async () => {
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(JSON.stringify([]), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		await httpRequest({
			path: "/quests",
			query: { status: "active", keyword: "test" },
		});

		expect(fetch).toHaveBeenCalledWith(
			"http://localhost:3001/api/quests?status=active&keyword=test",
			expect.anything(),
		);
	});

	it("undefined / null のクエリパラメータは除外される", async () => {
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(JSON.stringify([]), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		await httpRequest({
			path: "/quests",
			query: { status: "active", keyword: undefined },
		});

		const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
		expect(calledUrl).toBe("http://localhost:3001/api/quests?status=active");
	});

	it("POST リクエストで body が JSON 化されて送信される", async () => {
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(JSON.stringify({ id: 1 }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		await httpRequest({
			path: "/quests",
			method: "POST",
			body: { title: "新クエスト" },
		});

		expect(fetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ title: "新クエスト" }),
			}),
		);
	});

	it("HTTP エラー時に ApiError をスロー（旧 JSON レスポンス）", async () => {
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(JSON.stringify({ message: "Not Found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			}),
		);

		await expect(httpRequest({ path: "/quests/999" })).rejects.toMatchObject({
			name: "ApiError",
			code: "NOT_FOUND",
			status: 404,
			message: "Not Found",
		});
	});

	it("HTTP エラー時に ApiError をスロー（テキストレスポンス）", async () => {
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response("Internal Server Error", {
				status: 500,
				statusText: "Internal Server Error",
			}),
		);

		await expect(httpRequest({ path: "/quests" })).rejects.toMatchObject({
			name: "ApiError",
			code: "INTERNAL_SERVER_ERROR",
			status: 500,
			message: "Internal Server Error",
		});
	});

	it("標準エラーレスポンスを ApiError として保持する", async () => {
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					success: false,
					error: "Invalid title",
					code: "VALIDATION_ERROR",
					details: [{ field: "title", message: "タイトルは必須です" }],
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			),
		);

		await expect(httpRequest({ path: "/quests" })).rejects.toMatchObject({
			name: "ApiError",
			code: "VALIDATION_ERROR",
			status: 400,
			details: [{ field: "title", message: "タイトルは必須です" }],
		});
	});
});

describe("authenticatedHttpRequest", () => {
	beforeEach(() => {
		mockGetIdToken.mockReturnValue(null);
	});

	it("ID token がない場合に ApiError をスロー", async () => {
		await expect(authenticatedHttpRequest({ path: "/quests" })).rejects.toEqual(
			expect.any(ApiError),
		);
		await expect(
			authenticatedHttpRequest({ path: "/quests" }),
		).rejects.toMatchObject({
			code: "UNAUTHORIZED",
			status: 401,
		});
	});

	it("ID token を Authorization ヘッダーに付与する", async () => {
		mockGetIdToken.mockReturnValue("google-token");
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		await authenticatedHttpRequest({ path: "/users/me" });

		expect(fetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: "Bearer google-token",
				}),
			}),
		);
	});
});
