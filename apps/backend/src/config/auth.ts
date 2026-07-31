import "./env";
import { OAuth2Client } from "google-auth-library";
import { logger } from "./logger";

const clientId = process.env.GOOGLE_CLIENT_ID;
if (!clientId) {
	logger.warn(
		"[auth] GOOGLE_CLIENT_ID が未設定です。認証機能が正しく動作しない可能性があります。",
	);
}

export const oauth2Client = new OAuth2Client(clientId);
