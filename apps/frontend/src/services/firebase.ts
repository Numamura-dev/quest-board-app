// services/firebase.ts
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { resolveFirebaseConfig } from "./firebaseConfig";

const {
	config: firebaseConfig,
	missingEnvVars,
	isFallback,
} = resolveFirebaseConfig({
	NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
		process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

if (isFallback) {
	console.warn(
		"Identity Platform 環境変数が不足しているため、ローカル開発用のダミー設定で起動します:",
		missingEnvVars,
	);
}

// Google Cloud Identity Platform アプリ初期化（既に初期化済みの場合は再利用）
export const app =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Identity Platform Auth
export const auth = getAuth(app);

// ログイン中のユーザーのIDトークンを取得
export const getIdToken = async (): Promise<string | null> => {
	if (!auth.currentUser) return null;
	return await auth.currentUser.getIdToken();
};
