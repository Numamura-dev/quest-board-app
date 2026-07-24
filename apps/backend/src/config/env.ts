import { join } from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: join(process.cwd(), ".env.local") });
dotenv.config();

if (!process.env.DATABASE_URL) {
	throw new Error(
		"DATABASE_URL が未設定です。apps/backend/.env.local を確認してください。",
	);
}
