"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/contexts/AuthContext";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<GoogleOAuthProvider clientId={clientId}>
			<AuthProvider>{children}</AuthProvider>
		</GoogleOAuthProvider>
	);
};
