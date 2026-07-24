"use client";

type Props = {
	error: Error;
	reset: () => void;
};

// global-error.tsx はルートレイアウトをバイパスするため globals.css が読み込まれない。
// Tailwind クラスは効かないのでインラインスタイルで記述する。
export default function GlobalError({ error: _error, reset }: Props) {
	return (
		<html lang="ja">
			<body
				style={{
					minHeight: "100vh",
					background: "linear-gradient(to bottom, #1f2937, #111827)",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					padding: "2rem",
					textAlign: "center",
					margin: 0,
				}}
			>
				<h2
					style={{
						fontSize: "1.5rem",
						fontWeight: 600,
						color: "#f87171",
						marginBottom: "0.5rem",
					}}
				>
					致命的なエラーが発生しました
				</h2>
				<p
					style={{
						color: "#d1d5db",
						marginBottom: "1.5rem",
						fontSize: "0.875rem",
					}}
				>
					問題が解決しない場合は管理者にお問い合わせください。
				</p>
				<button
					type="button"
					onClick={reset}
					style={{
						padding: "0.75rem 1.5rem",
						borderRadius: "0.5rem",
						fontWeight: 600,
						border: "2px solid #a8a29e",
						background: "linear-gradient(to bottom, #e7e5e4, #d6d3d1)",
						color: "#44403c",
						cursor: "pointer",
					}}
				>
					再試行
				</button>
			</body>
		</html>
	);
}
