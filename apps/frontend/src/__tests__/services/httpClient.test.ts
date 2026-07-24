import { describe, it, expect, vi, beforeEach } from "vitest";
import { httpRequest, authenticatedHttpRequest } from "@/services/httpClient";

// firebase モック（authenticatedHttpRequest 用）
vi.mock("@/services/firebase", () => ({
	auth: {
		currentUser: null,
	},
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

	it("HTTP エラー時に Error をスロー（JSON レスポンス）", async () => {
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(JSON.stringify({ message: "Not Found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			}),
		);

		await expect(httpRequest({ path: "/quests/999" })).rejects.toThrow(
			"HTTP 404: Not Found",
		);
	});

	it("HTTP エラー時に Error をスロー（テキストレスポンス）", async () => {
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response("Internal Server Error", {
				status: 500,
				statusText: "Internal Server Error",
			}),
		);

		await expect(httpRequest({ path: "/quests" })).rejects.toThrow("HTTP 500");
	});
});

describe("authenticatedHttpRequest", () => {
	it("currentUser が null の場合に Error をスロー", async () => {
		await expect(
			authenticatedHttpRequest({ path: "/quests" }),
		).rejects.toThrow("User not authenticated");
	});
});
