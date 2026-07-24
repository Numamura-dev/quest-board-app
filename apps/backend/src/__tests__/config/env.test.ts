import { resolve } from "node:path";

describe("config/env", () => {
	const originalDatabaseUrl = process.env.DATABASE_URL;
	const originalCwd = process.cwd();

	afterEach(() => {
		jest.resetModules();
		jest.restoreAllMocks();
		process.chdir(originalCwd);

		if (originalDatabaseUrl === undefined) {
			Reflect.deleteProperty(process.env, "DATABASE_URL");
			return;
		}

		process.env.DATABASE_URL = originalDatabaseUrl;
	});

	it("DATABASE_URL が未設定なら分かりやすいエラーを投げる", () => {
		Reflect.deleteProperty(process.env, "DATABASE_URL");
		jest.doMock("dotenv", () => ({
			config: jest.fn(),
		}));
		jest.doMock("node:fs", () => ({
			existsSync: () => false,
		}));

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

	it("repo root から実行しても apps/backend/.env.local を探索できる", () => {
		Reflect.deleteProperty(process.env, "DATABASE_URL");
		process.chdir(resolve(__dirname, "../../../../.."));

		const configMock = jest.fn((options?: { path?: string }) => {
			if (options?.path?.endsWith("apps/backend/.env.local")) {
				process.env.DATABASE_URL =
					"mysql://user:password@localhost:3306/from-root";
			}

			return { parsed: {} };
		});

		jest.doMock("dotenv", () => ({
			config: configMock,
		}));
		jest.doMock("node:fs", () => ({
			existsSync: (path: string) => path.endsWith("apps/backend/.env.local"),
		}));

		expect(() => {
			jest.isolateModules(() => {
				require("@/config/env");
			});
		}).not.toThrow();

		expect(configMock).toHaveBeenCalledWith(
			expect.objectContaining({
				path: expect.stringMatching(/apps\/backend\/\.env\.local$/),
			}),
		);
	});
});
