/**
 * バックエンドの標準エラーレスポンス型
 * - apps/backend/src/middlewares/errorHandler.ts と対応
 */
export interface ApiErrorResponse {
	success: false;
	error: string;
	code: ApiErrorCode | string;
	details?: Array<{
		field?: string;
		message: string;
	}>;
}

export type ApiErrorCode =
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "VALIDATION_ERROR"
	| "CONFLICT"
	| "INTERNAL_SERVER_ERROR"
	| "NETWORK_ERROR"
	| "UNKNOWN_ERROR";

/**
 * バックエンドの標準エラーレスポンスをラップするエラークラス
 *
 * try-catch で `error instanceof ApiError` を判定することで
 * フロントエンドで統一的なエラーハンドリングが可能になる。
 *
 * @example
 * ```ts
 * try {
 *   await questService.getAllQuests();
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error(error.code); // "VALIDATION_ERROR" | "UNAUTHORIZED" | ...
 *     console.error(error.message); // 人間が読めるメッセージ
 *   }
 * }
 * ```
 */
export class ApiError extends Error {
	/** バックエンドのエラーコード (例: "UNAUTHORIZED", "NOT_FOUND") */
	readonly code: ApiErrorCode | string;
	/** HTTP ステータスコード */
	readonly status: number;
	/** バックエンドが返したフィールドレベルの詳細エラー */
	readonly details: ApiErrorResponse["details"];

	constructor(
		message: string,
		code: ApiErrorCode | string,
		status: number,
		details?: ApiErrorResponse["details"],
	) {
		super(message);
		this.name = "ApiError";
		this.code = code;
		this.status = status;
		this.details = details;
	}

	/** 認証エラーかどうかを判定 */
	isUnauthorized(): boolean {
		return this.status === 401;
	}

	/** バリデーションエラーかどうかを判定 */
	isValidationError(): boolean {
		return this.code === "VALIDATION_ERROR";
	}

	/** 404 Not Found かどうかを判定 */
	isNotFound(): boolean {
		return this.status === 404;
	}
}

/**
 * レスポンスボディが ApiErrorResponse かどうかを判定するタイプガード
 */
export function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
	return (
		typeof body === "object" &&
		body !== null &&
		(body as ApiErrorResponse).success === false &&
		typeof (body as ApiErrorResponse).error === "string" &&
		typeof (body as ApiErrorResponse).code === "string"
	);
}

export function isAuthRequiredError(error: unknown): boolean {
	return (
		error instanceof ApiError &&
		(error.status === 401 ||
			error.status === 403 ||
			error.code === "UNAUTHORIZED" ||
			error.code === "FORBIDDEN")
	);
}

export function getValidationFieldErrors(
	error: unknown,
): Record<string, string> {
	if (!(error instanceof ApiError) || !error.isValidationError()) {
		return {};
	}

	return (error.details ?? []).reduce<Record<string, string>>((acc, detail) => {
		if (detail.field) {
			acc[detail.field] = detail.message;
		}
		return acc;
	}, {});
}

export function getUserFacingErrorMessage(
	error: unknown,
	fallback = "エラーが発生しました。時間をおいて再度お試しください。",
): string {
	if (error instanceof ApiError) {
		if (error.code === "UNAUTHORIZED" || error.status === 401) {
			return "ログインが必要です。";
		}
		if (error.code === "FORBIDDEN" || error.status === 403) {
			return "この操作を行う権限がありません。";
		}
		if (error.code === "NOT_FOUND" || error.status === 404) {
			return "対象のデータが見つかりません。";
		}
		if (error.code === "VALIDATION_ERROR" || error.status === 400) {
			return error.message || "入力内容を確認してください。";
		}
		if (error.code === "CONFLICT" || error.status === 409) {
			return error.message || "既に処理済み、または競合が発生しました。";
		}
		if (error.code === "INTERNAL_SERVER_ERROR" || error.status >= 500) {
			return "サーバーで問題が発生しました。時間をおいて再度お試しください。";
		}
		return error.message || fallback;
	}

	if (error instanceof TypeError && error.message === "Failed to fetch") {
		return "ネットワークに接続できません。通信状況を確認してください。";
	}

	if (error instanceof Error) {
		const maybeCode = (error as { code?: unknown }).code;
		if (typeof maybeCode === "string") {
			if (maybeCode === "auth/email-already-in-use") {
				return "このメールアドレスはすでに登録されています。";
			}
			if (maybeCode === "auth/invalid-email") {
				return "メールアドレスの形式が正しくありません。";
			}
			if (maybeCode === "auth/weak-password") {
				return "パスワードは6文字以上で入力してください。";
			}
			if (
				maybeCode === "auth/invalid-credential" ||
				maybeCode === "auth/user-not-found" ||
				maybeCode === "auth/wrong-password"
			) {
				return "メールアドレスまたはパスワードが正しくありません。";
			}
			if (maybeCode === "auth/network-request-failed") {
				return "ネットワークに接続できません。通信状況を確認してください。";
			}
		}

		if (error.message === "User not authenticated") {
			return "ログインが必要です。";
		}
	}

	return fallback;
}
