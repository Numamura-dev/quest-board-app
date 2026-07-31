const TOKEN_KEY = "google_id_token";

export const setIdToken = (token: string): void => {
	if (typeof window === "undefined") return;
	localStorage.setItem(TOKEN_KEY, token);
};

export const getIdToken = (): string | null => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(TOKEN_KEY);
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
