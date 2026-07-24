import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/services/firebase";
import { getIdToken } from "@/services/firebase";

export const signUp = async (name: string, email: string, password: string) => {
  try {
    // 1. Firebase Authenticationでアカウント作成
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
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
          "Firestoreへの保存に失敗しましたが、アカウント作成は成功しています"
        );
      }

      // 4. バックエンドのMySQLデータベースにもユーザー情報を保存
      try {
        const idToken = await getIdToken();
        const apiUrl = `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
        }/api/users`;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            name: name,
            role: "user",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("バックエンドユーザー作成エラー:", errorData);
          console.warn(
            "Firebaseでのアカウント作成は成功しましたが、バックエンドとの同期に失敗しました"
          );
        }
      } catch (error: unknown) {
        console.error("バックエンド同期エラー:", error);
        console.warn(
          "Firebaseでのアカウント作成は成功しましたが、バックエンドとの同期に失敗しました"
        );
      }
    }

    return userCredential;
  } catch (error: unknown) {
    console.error("サインアップエラー:", error);
    throw error;
  }
};
