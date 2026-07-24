"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/services/firebase";
import {
  Sword,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user";

// User型にroleを追加
interface AppUser {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  role?: "admin" | "user";
  id?: number;
  name?: string;
}

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user: firebaseUser } = useAuth();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);

  // MySQLからユーザー情報を取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (firebaseUser?.uid) {
        try {
          const userData = await userService.getCurrentUser();
          setUser({
            ...firebaseUser,
            role: userData.role as "admin" | "user",
            id: userData.id,
            name: userData.name,
          });
        } catch (error) {
          console.error("ユーザー情報取得エラー:", error);
          // エラーの場合はFirebaseユーザー情報のみを使用
          setUser(firebaseUser);
        }
      }
    };
    fetchUserInfo();
  }, [firebaseUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("ログアウトしました");
      router.push("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      alert(`ログアウトエラー: ${message}`);
    }
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const getFocusableElements = () =>
      Array.from(
        mobileMenuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    const focusableElements = getFocusableElements();
    focusableElements[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const currentFocusableElements = getFocusableElements();
      const firstElement = currentFocusableElements[0];
      const lastElement = currentFocusableElements.at(-1);

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const primaryNavItems = [
    {
      id: "quests",
      label: "クエスト一覧",
      icon: <Sword className="w-5 h-5" />,
      href: "/quests",
    },
    {
      id: "mypage",
      label: "マイページ",
      icon: <User className="w-5 h-5" />,
      href: "/mypage",
    },
    // 管理者だけに表示
    ...(user?.role === "admin"
      ? [
          {
            id: "dashboard",
            label: "ダッシュボード",
            icon: <Settings className="w-5 h-5" />,
            href: "/admin/dashboard",
          },
        ]
      : []),
  ];

  return (
    <>
      {/* 上部ヘッダー */}
      <header className="bg-slate-800 border-b-4 border-yellow-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sword className="w-6 h-6 text-slate-800" />
              </div>
              <h1
                className="text-2xl font-bold text-yellow-400"
                style={{ fontFamily: "serif" }}
              >
                Quest Board
              </h1>
            </div>

            {/* 右上メニュー */}
            <div className="hidden items-center space-x-4 md:flex">
              <Bell className="w-6 h-6 text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors" />
              <div className="flex items-center space-x-2 bg-slate-700 px-3 py-2 rounded-lg">
                <User className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold text-sm">
                  {user?.name || user?.displayName || user?.email || "ユーザー"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">ログアウト</span>
              </button>
            </div>

            <button
              ref={mobileMenuButtonRef}
              type="button"
              className="rounded-lg border border-slate-600 p-2 text-yellow-400 transition hover:border-yellow-400 md:hidden"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label="メニューを開閉する"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ナビゲーション */}
      <nav
        className="hidden border-b border-slate-600 bg-slate-800 md:block"
        aria-label="主要ナビゲーション"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {primaryNavItems.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors ${
                    isActive
                      ? "border-yellow-400 text-yellow-400"
                      : "border-transparent text-gray-300 hover:text-yellow-400 hover:border-yellow-400"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <nav
          ref={mobileMenuRef}
          id="mobile-navigation"
          className="border-b border-slate-600 bg-slate-800 px-4 py-4 md:hidden"
          aria-label="モバイルナビゲーション"
        >
          <div className="mx-auto max-w-7xl space-y-4">
            <section className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Primary
              </p>
              <div className="grid gap-2">
                {primaryNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                        isActive
                          ? "bg-yellow-400 text-slate-900"
                          : "bg-slate-700/80 text-slate-100"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Account
              </p>
              <div className="rounded-2xl bg-slate-700/80 p-4 text-slate-100">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-full bg-slate-600 p-2 text-yellow-400">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {user?.name || user?.displayName || user?.email || "ユーザー"}
                    </p>
                    <p className="text-xs text-slate-300">{user?.role || "user"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-600 px-4 py-3 text-sm font-medium text-white"
                  >
                    <Bell className="h-4 w-4" />
                    通知
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    ログアウト
                  </button>
                </div>
              </div>
            </section>
          </div>
        </nav>
      )}
    </>
  );
};
