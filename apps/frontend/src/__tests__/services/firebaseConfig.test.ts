import { describe, expect, it } from "vitest";
import {
	getMissingFirebaseEnvVars,
	resolveFirebaseConfig,
} from "@/services/firebaseConfig";

describe("getMissingFirebaseEnvVars", () => {
	it("不足している env 名を返す", () => {
		expect(
			getMissingFirebaseEnvVars({
				NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
				NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: undefined,
				NEXT_PUBLIC_FIREBASE_PROJECT_ID: "project-id",
			}),
		).toEqual(["authDomain"]);
	});
});

describe("resolveFirebaseConfig", () => {
	it("env が揃っていればその値を返す", () => {
		expect(
			resolveFirebaseConfig({
				NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
				NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "example.firebaseapp.com",
				NEXT_PUBLIC_FIREBASE_PROJECT_ID: "project-id",
			}),
		).toEqual({
			config: {
				apiKey: "api-key",
				authDomain: "example.firebaseapp.com",
				projectId: "project-id",
			},
			missingEnvVars: [],
			isFallback: false,
		});
	});

	it("env が不足していればダミー設定へフォールバックする", () => {
		expect(
			resolveFirebaseConfig({
				NEXT_PUBLIC_FIREBASE_API_KEY: undefined,
				NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: undefined,
				NEXT_PUBLIC_FIREBASE_PROJECT_ID: undefined,
			}),
		).toEqual({
			config: {
				apiKey: "local-dev-api-key",
				authDomain: "local-dev.firebaseapp.com",
				projectId: "local-dev-project",
			},
			missingEnvVars: ["apiKey", "authDomain", "projectId"],
			isFallback: true,
		});
	});
});
