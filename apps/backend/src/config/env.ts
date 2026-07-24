import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as dotenv from "dotenv";

const backendRoot = resolve(dirname(__dirname), "..");

const envCandidates = [
	resolve(process.cwd(), ".env.local"),
	resolve(process.cwd(), "apps/backend/.env.local"),
	resolve(backendRoot, ".env.local"),
];

let loadedFromCandidate = false;

// process.cwd() と backendRoot が同じ解決結果になるケースの重複を除外する。
// ファイルが存在しても DATABASE_URL が未設定なら次の候補へ進む。
for (const path of [...new Set(envCandidates)]) {
	if (!existsSync(path)) {
		continue;
	}

	dotenv.config({ path });

	if (process.env.DATABASE_URL) {
		loadedFromCandidate = true;
		break;
	}
}

// .env.local が見つからない場合のみ、従来互換でデフォルトの .env を読む。
if (!loadedFromCandidate) {
	dotenv.config();
}

if (!process.env.DATABASE_URL) {
	throw new Error(
		"DATABASE_URL が未設定です。apps/backend/.env.local を確認してください。",
	);
}
