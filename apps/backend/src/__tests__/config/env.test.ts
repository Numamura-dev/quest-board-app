describe("config/env", () => {
	const originalDatabaseUrl = process.env.DATABASE_URL;

	afterEach(() => {
		jest.resetModules();

		if (originalDatabaseUrl === undefined) {
			// biome-ignore lint/performance/noDelete: process.env のキー削除には delete が必要（= undefined は文字列 "undefined" になる）
			delete process.env.DATABASE_URL;
			return;
		}

		process.env.DATABASE_URL = originalDatabaseUrl;
	});

	it("DATABASE_URL が未設定なら分かりやすいエラーを投げる", () => {
		// biome-ignore lint/performance/noDelete: process.env のキー削除には delete が必要
		delete process.env.DATABASE_URL;

		expect(() => {
			jest.isolateModules(() => {
				require("@/config/env");
			});
		}).toThrow(
			"DATABASE_URL が未設定です。apps/backend/.env.local を確認してください。",
		);
	});

	it("DATABASE_URL が設定済みならそのまま読み込める", () => {
		process.env.DATABASE_URL = "mysql://user:password@localhost:3306/test_db";

		expect(() => {
			jest.isolateModules(() => {
				require("@/config/env");
			});
		}).not.toThrow();
	});
});
