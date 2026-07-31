"use client";

import { useAuth } from "@/hooks/useAuth";
import { authenticatedApiClient } from "@/services/httpClient";
import type { CredentialResponse } from "@react-oauth/google";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useRouter } from "next/navigation";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function GoogleLoginForm() {
	const router = useRouter();
	const { login, logout } = useAuth();

	const handleSuccess = async (response: CredentialResponse) => {
		if (!response.credential) return;

		login(response.credential);

		try {
			await authenticatedApiClient.post("/users", {});
			router.push("/");
		} catch (error) {
			console.error("ユーザー同期エラー:", error);
			logout();
			alert("ログインに失敗しました。再度お試しください。");
		}
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
