import { openApiDocument } from "../../openapi/document";

describe("openApiDocument", () => {
	it("主要な API path を公開している", () => {
		expect(openApiDocument.openapi).toBe("3.0.0");
		expect(openApiDocument.paths["/api/quests"]).toBeDefined();
		expect(openApiDocument.paths["/api/users"]).toBeDefined();
		expect(openApiDocument.paths["/api/openapi.json"]).toBeDefined();
	});

	it("bearer 認証スキームを定義している", () => {
		expect(openApiDocument.components?.securitySchemes).toMatchObject({
			bearerAuth: {
				type: "http",
				scheme: "bearer",
			},
		});
	});

	it("管理者向け条件を含む path のレスポンス定義を持つ", () => {
		expect(openApiDocument.paths["/api/quests"]?.get?.responses).toMatchObject({
			401: expect.any(Object),
			403: expect.any(Object),
		});
		expect(
			openApiDocument.paths["/api/users"]?.get?.responses?.["200"],
		).toMatchObject({
			description: "ユーザー一覧",
		});
	});
});
