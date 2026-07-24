/**
 * バックエンドの標準エラーレスポンス型
 * - apps/backend/src/middlewares/errorHandler.ts と対応
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: Array<{
    field?: string;
    message: string;
  }>;
}

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
  readonly code: string;
  /** HTTP ステータスコード */
  readonly status: number;
  /** バックエンドが返したフィールドレベルの詳細エラー */
  readonly details: ApiErrorResponse["details"];

  constructor(
    message: string,
    code: string,
    status: number,
    details?: ApiErrorResponse["details"]
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
