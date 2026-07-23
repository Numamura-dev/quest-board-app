import "./env"; // 環境変数ロード（単一エントリポイント）
import admin from "firebase-admin";
import { logger } from "./logger";

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? "";
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY ?? "";

  let privateKey: string | undefined;
  if (rawPrivateKey) {
    try {
      const maybeDecoded = Buffer.from(rawPrivateKey, "base64").toString("utf8");
      if (
        maybeDecoded.includes("-----BEGIN") &&
        maybeDecoded.includes("PRIVATE KEY-----")
      ) {
        privateKey = maybeDecoded;
      } else {
        privateKey = rawPrivateKey.replace(/\\n/g, "\n");
      }
    } catch {
      privateKey = rawPrivateKey.replace(/\\n/g, "\n");
    }
  }

  try {
    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
      logger.info("[firebase] Firebase Admin SDK をサービスアカウントで初期化しました");
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      logger.warn(
        "[firebase] Application Default Credentials を使用しています。サービスアカウントを使う場合は FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY を設定してください。"
      );
    }
  } catch (e) {
    logger.error({ err: e }, "[firebase] Firebase Admin SDK の初期化に失敗しました");
    // サービスアカウント認証に失敗した場合は ADC にフォールバック
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
        logger.warn(
          "[firebase] サービスアカウント初期化に失敗したため、Application Default Credentials にフォールバックします。"
        );
      }
    } catch (fallbackError) {
      logger.error(
        { err: fallbackError },
        "[firebase] Application Default Credentials へのフォールバックにも失敗しました"
      );
      logger.warn(
        "[firebase] Firebase Admin SDK の初期化に失敗しました。認証機能が正しく動作しない可能性があります。"
      );
    }
  }
}

/**
 * 初期化済みの Firebase Admin SDK インスタンス。
 */
export default admin;
