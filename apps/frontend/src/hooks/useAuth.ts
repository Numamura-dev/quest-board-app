import { auth } from "@/services/firebase";
import { type User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export const useAuth = () => {
	const [user, setUser] = useState<FirebaseUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				// 最新のユーザー情報を取得
				await user.reload();
			}
			setUser(user);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	return {
		user,
		loading,
		isAuthenticated: !!user,
	};
};
