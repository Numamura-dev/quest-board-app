import { openApiDocument } from "../../openapi/document";

describe("openApiDocument", () => {
	it("主要な API path を公開している", () => {
		expect(openApiDocument.openapi).toBe("3.0.0");
		expect(openApiDocument.paths["/api/quests"]).toBeDefined();
		expect(openApiDocument.paths["/api/users/create"]).toBeDefined();
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
});
