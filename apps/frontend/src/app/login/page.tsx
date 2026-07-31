"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// @react-oauth/google は Next.js 15 RSC webpack と非互換のため SSR を無効化する
const GoogleLoginForm = dynamic(() => import("./_components/GoogleLoginForm"), {
	ssr: false,
});

export default function LoginPage() {
	const router = useRouter();

	return (
		<main
			id="main-content"
			className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900"
		>
			<div className="bg-[#fef3c7] border-2 border-[#fbbf24] rounded-lg shadow-lg p-8 w-full max-w-md">
				<h1 className="text-2xl font-bold mb-6 text-center text-[#1e3a8a]">
					ログイン
				</h1>

				<div className="flex justify-center mb-6">
					<GoogleLoginForm />
				</div>

				<button
					type="button"
					className="w-full bg-gray-500 text-white py-3 rounded hover:bg-gray-600 transition duration-300"
					onClick={() => router.push("/")}
				>
					戻る
				</button>
			</div>
		</main>
	);
}
