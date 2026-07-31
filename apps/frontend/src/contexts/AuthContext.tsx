"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
	type GoogleUser,
	clearIdToken,
	decodeIdToken,
	getIdToken,
	setIdToken,
} from "@/services/auth/googleAuth";

interface AuthContextValue {
	user: GoogleUser | null;
	loading: boolean;
	isAuthenticated: boolean;
	login: (credential: string) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<GoogleUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = getIdToken();
		if (token) {
			const decoded = decodeIdToken(token);
			setUser(decoded);
		}
		setLoading(false);
	}, []);

	const login = (credential: string) => {
		setIdToken(credential);
		const decoded = decodeIdToken(credential);
		setUser(decoded);
	};

	const logout = () => {
		clearIdToken();
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{ user, loading, isAuthenticated: !!user, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuthContext = (): AuthContextValue => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
	return ctx;
};
