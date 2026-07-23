"use client";

type Props = {
	error: Error;
	reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
	return (
		<html lang="ja">
			<body className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col items-center justify-center p-8 text-center">
				<h2 className="text-2xl font-semibold text-red-400 mb-2">
					致命的なエラーが発生しました
				</h2>
				<p className="text-gray-300 mb-6 text-sm">
					問題が解決しない場合は管理者にお問い合わせください。
				</p>
				<button
					type="button"
					onClick={reset}
					className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 border-2 bg-gradient-to-b from-stone-200 to-stone-300 text-stone-700 border-stone-400 hover:from-stone-300 hover:to-stone-400"
				>
					再試行
				</button>
			</body>
		</html>
	);
}
