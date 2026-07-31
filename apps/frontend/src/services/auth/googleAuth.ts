const TOKEN_KEY = "google_id_token";

export const setIdToken = (token: string): void => {
	if (typeof window === "undefined") return;
	localStorage.setItem(TOKEN_KEY, token);
};

export const getIdToken = (): string | null => {
	if (typeof window === "undefined") return null;
	const token = localStorage.getItem(TOKEN_KEY);
	if (!token) return null;

	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
			localStorage.removeItem(TOKEN_KEY);
			return null;
		}
	} catch {
		localStorage.removeItem(TOKEN_KEY);
		return null;
	}

	return token;
};

export const clearIdToken = (): void => {
	if (typeof window === "undefined") return;
	localStorage.removeItem(TOKEN_KEY);
};

export interface GoogleUser {
	sub: string;
	name?: string;
	email?: string;
	picture?: string;
}

export const decodeIdToken = (token: string): GoogleUser | null => {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		return {
			sub: payload.sub,
			name: payload.name,
			email: payload.email,
			picture: payload.picture,
		};
	} catch {
		return null;
	}
};
