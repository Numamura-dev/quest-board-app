"use client";

type Props = {
	error: Error;
	reset: () => void;
};

export default function ErrorPage({ error, reset }: Props) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
			<h2 className="text-2xl font-semibold text-red-400 mb-2">
				エラーが発生しました
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
		</div>
	);
}
