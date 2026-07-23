"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebase";
import Link from "next/link";
import QuestList from "@/components/organisms/QuestList";

export default function RootPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <main
      id="main-content"
      className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900"
    >
      {/* ログインしている場合 */}
      {isLoggedIn ? (
        /* クエスト一覧表示 */
        <QuestList />
      ) : (
        /* ログインしていない場合 */
        <div className="bg-[#fef3c7] border-2 border-[#fbbf24] rounded-lg shadow-lg p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-[#1e3a8a] mb-6">
            ようこそ クエスト掲示板 へ
          </h1>
          <p className="text-gray-700 mb-6">
            ログインまたは新規登録をして、クエストに挑戦しましょう！
          </p>
          <div className="flex flex-col gap-4">
            <Link
              href="/login"
              className="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
            >
              ログイン
            </Link>
            <Link
              href="/signUp"
              className="w-full px-4 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
            >
              新規登録
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
