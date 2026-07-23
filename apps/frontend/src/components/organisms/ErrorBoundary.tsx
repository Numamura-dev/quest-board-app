"use client";

import React from "react";

type Props = {
	children: React.ReactNode;
	fallback?: React.ReactNode;
};

type State = {
	hasError: boolean;
	error: Error | null;
};

class ErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo): void {
		console.error("ErrorBoundary caught an error:", error, info);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback !== undefined) {
				return this.props.fallback;
			}

			return (
				<div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
					<h2 className="text-xl font-semibold text-red-400 mb-2">
						予期しないエラーが発生しました
					</h2>
					<p className="text-gray-300 mb-4 text-sm">
						問題が解決しない場合は管理者にお問い合わせください。
					</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 border-2 bg-gradient-to-b from-stone-200 to-stone-300 text-stone-700 border-stone-400 hover:from-stone-300 hover:to-stone-400"
					>
						再読み込み
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
