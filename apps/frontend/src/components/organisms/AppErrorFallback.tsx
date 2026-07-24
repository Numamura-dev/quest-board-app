"use client";

import Link from "next/link";

type AppErrorFallbackProps = {
	title?: string;
	message?: string;
	retryLabel?: string;
	onRetry?: () => void;
};

const AppErrorFallback = ({
	title = "エラーが発生しました",
	message = "時間をおいて再度お試しください。解消しない場合はトップページから操作をやり直してください。",
	retryLabel = "再試行する",
	onRetry,
}: AppErrorFallbackProps) => {
	return (
		<main
			className="min-h-[calc(100vh-8rem)] px-4 py-16"
			aria-labelledby="app-error-title"
		>
			<div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-red-200 bg-white/95 p-8 text-center shadow-xl">
				<span className="mb-4 inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
					Error
				</span>
				<h1
					id="app-error-title"
					className="mb-3 text-3xl font-bold text-slate-900"
				>
					{title}
				</h1>
				<p className="mb-8 text-sm leading-7 text-slate-600">{message}</p>
				<div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
					<button
						type="button"
						onClick={onRetry}
						className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
					>
						{retryLabel}
					</button>
					<Link
						href="/"
						className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
					>
						トップページへ戻る
					</Link>
				</div>
			</div>
		</main>
	);
};

export default AppErrorFallback;
