"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/hooks/useAuth";
import { useMyPageData } from "@/hooks/useMyPageData";
import { getUserFacingErrorMessage } from "@/services/apiError";
import { userService } from "@/services/user";
import type { UserResponse } from "@/services/user";
import type React from "react";
import { useEffect, useState } from "react";
import NotificationList from "../organisms/NotificationList";
import QuestHistory from "../organisms/QuestHistory";
import UserProfile from "../organisms/UserProfile";

const MyPage: React.FC = () => {
	const { user: authUser } = useAuth();
	const [user, setUser] = useState<UserResponse | null>(null);
	const { notifications, questGroups } = useMyPageData();
	const { showToast } = useToast();

	// 認証ユーザーが確定・変化したらDBユーザーを取得（ヘッダーと同様）
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				if (authUser?.sub) {
					const me = await userService.getCurrentUser();
					if (!cancelled) setUser(me);
				} else {
					setUser(null);
				}
			} catch (e) {
				console.error("/users/me の取得に失敗しました", e);
				showToast(
					getUserFacingErrorMessage(e, "ユーザー情報の取得に失敗しました。"),
					"error",
				);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [authUser, showToast]);

	return (
		<main className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 px-6 py-10">
			<section className="max-w-4xl mx-auto space-y-10">
				{/* ユーザー情報 */}
				{
					// 認証情報を優先して表示（fallbackでバックエンドのユーザー情報を使用）
					(authUser || user) && (
						<UserProfile
							user={{
								// ヘッダーと同様にDBのnameを優先し、次にdisplayName
								name: user?.name || authUser?.name || "",
								email: authUser?.email || user?.email || "",
								avatar: (user?.name || authUser?.name || "")
									.slice(0, 1)
									.toUpperCase(),
							}}
						/>
					)
				}

				{/* 参加中・完了済みクエスト（一覧と同じカード情報を使用）*/}
				<QuestHistory questData={questGroups} />

				{/* 通知メッセージ */}
				<NotificationList notifications={notifications} />
			</section>
		</main>
	);
};

export default MyPage;
