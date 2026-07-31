"use client";

import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<ToastProvider>
			<AuthProvider>{children}</AuthProvider>
		</ToastProvider>
	);
};
