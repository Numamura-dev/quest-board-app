"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/hooks/useAuth";
import { getUserFacingErrorMessage } from "@/services/apiError";
import { authenticatedApiClient } from "@/services/httpClient";
import type { CredentialResponse } from "@react-oauth/google";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useRouter } from "next/navigation";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function GoogleLoginForm() {
	const router = useRouter();
	const { login, logout } = useAuth();
	const { showToast } = useToast();

	const handleSuccess = async (response: CredentialResponse) => {
		if (!response.credential) return;

		login(response.credential);

		try {
			await authenticatedApiClient.post("/users", {});
			router.push("/");
		} catch (error) {
			console.error("ユーザー同期エラー:", error);
			logout();
			showToast(
				getUserFacingErrorMessage(
					error,
					"ログインに失敗しました。再度お試しください。",
				),
				"error",
			);
		}
	};

	const handleError = () => {
		showToast("Google ログインに失敗しました。再度お試しください。", "error");
	};

	return (
		<GoogleOAuthProvider clientId={clientId}>
			<GoogleLogin onSuccess={handleSuccess} onError={handleError} />
		</GoogleOAuthProvider>
	);
}
