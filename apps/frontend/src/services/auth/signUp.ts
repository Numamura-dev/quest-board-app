import { auth } from "@/services/firebase";
import { authenticatedApiClient } from "@/services/httpClient";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export const signUp = async (name: string, email: string, password: string) => {
	try {
		// 1. Identity Platform でアカウント作成
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password,
		);

		if (auth.currentUser) {
			// 2. ユーザープロファイルに displayName を設定
			await updateProfile(auth.currentUser, {
				displayName: name,
			});
			await auth.currentUser.reload();

			// 3. バックエンドの MySQL にユーザー情報を保存
			try {
				await authenticatedApiClient.post("/users", {
					name: name,
					role: "user",
				});
			} catch (error: unknown) {
				console.error("バックエンド同期エラー:", error);
				console.warn(
					"アカウント作成は成功しましたが、バックエンドとの同期に失敗しました",
				);
			}
		}

		return userCredential;
	} catch (error: unknown) {
		console.error("サインアップエラー:", error);
		throw error;
	}
};
