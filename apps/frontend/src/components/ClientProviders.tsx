"use client";

import { AuthProvider } from "@/contexts/AuthContext";

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return <AuthProvider>{children}</AuthProvider>;
};
