import crypto from "node:crypto";
import express from "express";
import { prisma } from "../config/db";

const router = express.Router();

// テスト用トークン発行エンドポイント（非本番環境のみ有効）
// E2E テストから呼び出し、Google OAuth をバイパスするためのトークンを取得する
router.post("/token", async (req, res) => {
	const { email } = req.body as { email?: string };
	if (!email) {
		res.status(400).json({ error: "email is required" });
		return;
	}

	const secret =
		process.env.TEST_TOKEN_SECRET ?? "dev-only-secret-do-not-use-in-prod";

	const user = await prisma.user.findUnique({ where: { email } });
	const name = user?.name ?? email;

	const header = Buffer.from(
		JSON.stringify({ typ: "JWT", alg: "HMAC-TEST" }),
	).toString("base64");
	const payload = Buffer.from(
		JSON.stringify({ sub: email, email, name }),
	).toString("base64");
	const sig = crypto
		.createHmac("sha256", secret)
		.update(`${header}.${payload}`)
		.digest("base64");

	res.json({ token: `${header}.${payload}.${sig}` });
});

export default router;
