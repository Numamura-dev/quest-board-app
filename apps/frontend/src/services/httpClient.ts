import { API_CONFIG } from "../constants/config";
import { auth } from "./firebase";
import { ApiError, isApiErrorResponse } from "./apiError";

/**
 * - HTTP メソッドのユニオン型
 * - ラッパーのメソッド指定で使用
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * - API リクエストのオプション定義
 * - TBody: 送信するリクエストボディの型（JSON 化）
 */
export interface RequestOptions<TBody = unknown> {
  /** 使用する HTTP メソッド（未指定時は GET） */
  method?: HttpMethod;
  /** ベース URL（未指定時は NEXT_PUBLIC_API_BASE_URL を使用） */
  baseUrl?: string;
  /** API のパス（例: "/api/quests"） */
  path: string;
  /** クエリパラメータ（undefined / null は無視） */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** リクエストボディ（GET の場合は未使用） */
  body?: TBody;
  /** 追加ヘッダー（Content-Type は自動で application/json を付与） */
  headers?: Record<string, string>;
  /** fetch の追加オプション（body/method/headers は上書き不可） */
  init?: Omit<RequestInit, "body" | "method" | "headers">;
}

const defaultBaseUrl = API_CONFIG.BASE_URL;

/** @deprecated use ApiError instead */
interface LegacyErrorResponseBody {
  error?: string;
  message?: string;
}

/**
 * - クエリオブジェクトを URLSearchParams に変換してクエリ文字列を生成
 * - 値が undefined / null のキーは除外
 */
function buildQueryString(query: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.append(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * - fetch をラップした共通 HTTP リクエスト関数
 * - baseUrl と path を連結し、query をクエリ文字列化
 * - JSON 前提で Content-Type を設定、body を自動で JSON 文字列化（GET 以外）
 * - エラー時はレスポンス本文（テキスト）を含む Error を投げる
 * - レスポンスが JSON のときは JSON、その他は text を返す
 * - TResponse: 期待するレスポンスの型
 * - TBody: 送信するリクエストボディの型
 */
export async function httpRequest<TResponse = unknown, TBody = unknown>(
  options: RequestOptions<TBody>
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

      // バックエンドの標準エラーレスポンス形式の場合は ApiError を投げる
      if (isApiErrorResponse(errorBody)) {
        throw new ApiError(
          errorBody.error,
          errorBody.code,
          res.status,
          errorBody.details
        );
      }

      // 旧形式のフォールバック
      const legacyBody = errorBody as LegacyErrorResponseBody | null;
      const message = legacyBody?.error || legacyBody?.message || res.statusText;
      throw new Error(`HTTP ${res.status}: ${message}`);
    }

    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as TResponse;
  }
  return (await res.text()) as unknown as TResponse;
}

/**
 * - 認証付きのHTTPリクエスト関数
 * - Firebase IDトークンを自動でAuthorizationヘッダーに追加
 */
export async function authenticatedHttpRequest<
  TResponse = unknown,
  TBody = unknown
>(options: RequestOptions<TBody>): Promise<TResponse> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const idToken = await user.getIdToken();

    return httpRequest<TResponse, TBody>({
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${idToken}`,
      },
    });
  } catch (error) {
    console.error("Failed to get ID token:", error);
    throw error;
  }
}

/**
 * - シンプルに使える API クライアントのショートハンド
 * - 使用例:
 *   - const quests = await apiClient.get<Quest[]>("/api/quests", { status: "active" })
 *   - await apiClient.post("/api/quests", { title, description })
 */
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

/**
 * - 認証が必要なAPI用のクライアント
 * - Firebase IDトークンを自動で送信
 */
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
