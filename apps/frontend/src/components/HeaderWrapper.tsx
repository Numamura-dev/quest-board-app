"use client";

import { Header } from "@/components/organisms/Header";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

export const HeaderWrapper = () => {
	const pathname = usePathname();
	const { isAuthenticated, loading } = useAuth();

	// ヘッダーを非表示にする画面のパス
	const hideHeaderPaths = ["/login", "/signUp"];

	// 指定されたパスではヘッダーを非表示にする
	const isHiddenPath = hideHeaderPaths.some((path) => pathname.includes(path));

	// トップページかつ未ログイン（または認証判定中）の場合はヘッダーを非表示
	const isWelcomeWithoutLogin =
		pathname === "/" && (loading ? true : !isAuthenticated);

	const shouldShowHeader = !(isHiddenPath || isWelcomeWithoutLogin);

	if (!shouldShowHeader) {
		return null;
	}

	return <Header />;
};
