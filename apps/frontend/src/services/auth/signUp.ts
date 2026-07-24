import { auth, db } from "@/services/firebase";
import { authenticatedApiClient } from "@/services/httpClient";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const signUp = async (name: string, email: string, password: string) => {
	try {
		// 1. Firebase Authenticationでアカウント作成
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password,
		);

		if (auth.currentUser) {
			// 2. FirebaseのユーザープロファイルにdisplayNameを設定
			await updateProfile(auth.currentUser, {
				displayName: name,
			});
			await auth.currentUser.reload();

			// 3. Firestoreにユーザーロール情報を保存（デフォルトは"user"）
			try {
				const userDocRef = doc(db, "users", auth.currentUser.uid);
				const userData = {
					uid: auth.currentUser.uid,
					displayName: name,
					email: email,
					role: "user",
					createdAt: new Date(),
				};

				await setDoc(userDocRef, userData);
			} catch (firestoreError: unknown) {
				console.error("Firestore保存エラー:", firestoreError);
				console.warn(
					"Firestoreへの保存に失敗しましたが、アカウント作成は成功しています",
				);
			}

			// 4. バックエンドのMySQLデータベースにもユーザー情報を保存
			try {
				await authenticatedApiClient.post("/users", {
					name: name,
					role: "user",
				});
			} catch (error: unknown) {
				console.error("バックエンド同期エラー:", error);
				console.warn(
					"Firebaseでのアカウント作成は成功しましたが、バックエンドとの同期に失敗しました",
				);
			}
		}

		return userCredential;
	} catch (error: unknown) {
		console.error("サインアップエラー:", error);
		throw error;
	}
};
