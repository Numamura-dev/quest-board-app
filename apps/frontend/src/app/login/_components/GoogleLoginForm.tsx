"use client";

import { useAuth } from "@/hooks/useAuth";
import { authenticatedApiClient } from "@/services/httpClient";
import type { CredentialResponse } from "@react-oauth/google";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useRouter } from "next/navigation";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function GoogleLoginForm() {
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

	return (
		<GoogleOAuthProvider clientId={clientId}>
			<GoogleLogin onSuccess={handleSuccess} onError={handleError} />
		</GoogleOAuthProvider>
	);
}
