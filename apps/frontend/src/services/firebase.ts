// services/firebase.ts
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { resolveFirebaseConfig } from "./firebaseConfig";

const { config: firebaseConfig, missingEnvVars, isFallback } =
  resolveFirebaseConfig();

if (isFallback) {
  console.warn(
    "Firebase環境変数が不足しているため、ローカル開発用のダミー設定で起動します:",
    missingEnvVars
  );
}

// Firebase アプリ初期化（既に初期化済みの場合は再利用）
export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Firebase Auth
export const auth = getAuth(app);

// Firebase Firestore
export const db = getFirestore(app);

// ログイン中のユーザーのIDトークンを取得
export const getIdToken = async (): Promise<string | null> => {
  if (!auth.currentUser) return null;
  return await auth.currentUser.getIdToken();
};
