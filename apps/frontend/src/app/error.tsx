"use client";

import { useEffect } from "react";
import AppErrorFallback from "@/components/organisms/AppErrorFallback";

type ErrorPageProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
	useEffect(() => {
		console.error("App Router error boundary caught an error", error);
	}, [error]);

	return (
		<AppErrorFallback
			title="ページの表示中にエラーが発生しました"
			message="一時的な問題の可能性があります。再試行するか、トップページへ戻って操作をやり直してください。"
			onRetry={reset}
		/>
	);
}
