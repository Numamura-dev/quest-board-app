"use client";

import { useAuth } from "@/hooks/useAuth";
import { authenticatedApiClient } from "@/services/httpClient";
import type { CredentialResponse } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const router = useRouter();
	const { login } = useAuth();

	const handleSuccess = async (response: CredentialResponse) => {
		if (!response.credential) return;

		login(response.credential);

		try {
			await authenticatedApiClient.post("/users", {});
		} catch (error) {
			console.error("ユーザー同期エラー:", error);
		}

		router.push("/");
	};

	const handleError = () => {
		alert("Google ログインに失敗しました。再度お試しください。");
	};

	const handleBack = () => {
		router.push("/");
	};

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
					<GoogleLogin onSuccess={handleSuccess} onError={handleError} />
				</div>

				<button
					type="button"
					className="w-full bg-gray-500 text-white py-3 rounded hover:bg-gray-600 transition duration-300"
					onClick={handleBack}
				>
					戻る
				</button>
			</div>
		</main>
	);
}
