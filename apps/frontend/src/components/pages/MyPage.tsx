"use client";

import React, { useEffect, useState } from "react";
import UserProfile from "../organisms/UserProfile";
import QuestHistory from "../organisms/QuestHistory";
import NotificationList from "../organisms/NotificationList";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user";
import type { UserResponse } from "@/services/user";
import { useMyPageData } from "@/hooks/useMyPageData";

const MyPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserResponse | null>(null);
  const { notifications, questGroups } = useMyPageData();

  // 認証ユーザーが確定・変化したらDBユーザーを取得（ヘッダーと同様）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (authUser?.uid) {
          const me = await userService.getCurrentUser();
          if (!cancelled) setUser(me);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("/users/me の取得に失敗しました", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authUser]);

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
                name: user?.name || authUser?.displayName || "",
                email: authUser?.email || user?.email || "",
                avatar: (user?.name || authUser?.displayName || "")
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
