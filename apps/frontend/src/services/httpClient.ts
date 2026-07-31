import { API_CONFIG } from "../constants/config";
import { ApiError, isApiErrorResponse } from "./apiError";
import { getIdToken } from "./auth/googleAuth";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
	method?: HttpMethod;
	baseUrl?: string;
	path: string;
	query?: Record<string, string | number | boolean | undefined | null>;
	body?: TBody;
	headers?: Record<string, string>;
	init?: Omit<RequestInit, "body" | "method" | "headers">;
}

const defaultBaseUrl = API_CONFIG.BASE_URL;

/** @deprecated use ApiError instead */
interface LegacyErrorResponseBody {
	error?: string;
	message?: string;
}

function buildQueryString(query: RequestOptions["query"]): string {
	if (!query) return "";
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value === undefined || value === null) continue;
		params.append(key, String(value));
	}
	const qs = params.toString();
	return qs ? `?${qs}` : "";
}

export async function httpRequest<TResponse = unknown, TBody = unknown>(
	options: RequestOptions<TBody>,
): Promise<TResponse> {
	const {
		method = "GET",
		baseUrl = defaultBaseUrl,
		path,
		query,
		body,
		headers,
		init: initOptions,
	} = options;

	const url = `${baseUrl}${path}${buildQueryString(query)}`;

	const init: RequestInit = {
		method,
		headers: {
			"Content-Type": "application/json",
			...(headers || {}),
		},
		...(initOptions || {}),
	};

	if (body !== undefined && method !== "GET") {
		init.body = JSON.stringify(body);
	}

	const res = await fetch(url, init);
	if (!res.ok) {
		const contentType = res.headers.get("content-type") || "";

		if (contentType.includes("application/json")) {
			const errorBody = (await res.json().catch(() => null)) as unknown;

			if (isApiErrorResponse(errorBody)) {
				throw new ApiError(
					errorBody.error,
					errorBody.code,
					res.status,
					errorBody.details,
				);
			}

			const legacyBody = errorBody as LegacyErrorResponseBody | null;
			const message =
				legacyBody?.error || legacyBody?.message || res.statusText;
			throw new ApiError(message, getCodeForStatus(res.status), res.status);
		}

		const text = await res.text().catch(() => "");
		throw new ApiError(
			text || res.statusText,
			getCodeForStatus(res.status),
			res.status,
		);
	}

	const contentType = res.headers.get("content-type") || "";
	if (contentType.includes("application/json")) {
		return (await res.json()) as TResponse;
	}
	return (await res.text()) as unknown as TResponse;
}

export async function authenticatedHttpRequest<
	TResponse = unknown,
	TBody = unknown,
>(options: RequestOptions<TBody>): Promise<TResponse> {
	const idToken = getIdToken();
	if (!idToken) {
		throw new ApiError("User not authenticated", "UNAUTHORIZED", 401);
	}

	return httpRequest<TResponse, TBody>({
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${idToken}`,
		},
	});
}

export const apiClient = {
	get: <TResponse>(path: string, query?: RequestOptions["query"]) =>
		httpRequest<TResponse>({ path, query, method: "GET" }),
	post: <TResponse, TBody>(path: string, body: TBody) =>
		httpRequest<TResponse, TBody>({ path, body, method: "POST" }),
	put: <TResponse, TBody>(path: string, body: TBody) =>
		httpRequest<TResponse, TBody>({ path, body, method: "PUT" }),
	patch: <TResponse, TBody>(path: string, body: TBody) =>
		httpRequest<TResponse, TBody>({ path, body, method: "PATCH" }),
	delete: <TResponse>(path: string) =>
		httpRequest<TResponse>({ path, method: "DELETE" }),
};

function getCodeForStatus(status: number) {
	if (status === 401) return "UNAUTHORIZED";
	if (status === 403) return "FORBIDDEN";
	if (status === 404) return "NOT_FOUND";
	if (status === 409) return "CONFLICT";
	if (status >= 500) return "INTERNAL_SERVER_ERROR";
	return "UNKNOWN_ERROR";
}

export const authenticatedApiClient = {
	get: <TResponse>(path: string, query?: RequestOptions["query"]) =>
		authenticatedHttpRequest<TResponse>({ path, query, method: "GET" }),
	post: <TResponse, TBody>(path: string, body: TBody) =>
		authenticatedHttpRequest<TResponse, TBody>({ path, body, method: "POST" }),
	put: <TResponse, TBody>(path: string, body: TBody) =>
		authenticatedHttpRequest<TResponse, TBody>({ path, body, method: "PUT" }),
	patch: <TResponse, TBody>(path: string, body: TBody) =>
		authenticatedHttpRequest<TResponse, TBody>({ path, body, method: "PATCH" }),
	delete: <TResponse>(path: string) =>
		authenticatedHttpRequest<TResponse>({ path, method: "DELETE" }),
};
