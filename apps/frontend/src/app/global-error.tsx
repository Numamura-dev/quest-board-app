"use client";

import { useEffect } from "react";
import AppErrorFallback from "@/components/organisms/AppErrorFallback";

type GlobalErrorPageProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorPageProps) {
	useEffect(() => {
		console.error("Global error boundary caught an error", error);
	}, [error]);

	return (
		<html lang="ja">
			<body className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 antialiased">
				<AppErrorFallback
					title="アプリ全体でエラーが発生しました"
					message="ページ全体の描画に失敗しました。再試行するか、トップページへ戻って最初から操作をやり直してください。"
					retryLabel="再読み込みする"
					onRetry={reset}
				/>
			</body>
		</html>
	);
}
