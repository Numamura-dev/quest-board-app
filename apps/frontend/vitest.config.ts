import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/__tests__/setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov", "html"],
			include: [
				"src/components/**/*.{ts,tsx}",
				"src/hooks/**",
				"src/services/**",
			],
			exclude: [
				"src/**/*.d.ts",
				"src/__tests__/**",
				"src/services/firebase.ts",
			],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
