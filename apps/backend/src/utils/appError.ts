export interface ErrorDetail {
  field?: string;
  message: string;
}

/**
 * HTTP ステータスとアプリケーション固有コードを保持する例外型。
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: ErrorDetail[]
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * 400 Bad Request 用のアプリケーション例外を生成する。
 */
export const badRequest = (message: string, details?: ErrorDetail[]) =>
  new AppError(message, 400, "VALIDATION_ERROR", details);

/**
 * 401 Unauthorized 用のアプリケーション例外を生成する。
 */
export const unauthorized = (message = "Unauthorized") =>
  new AppError(message, 401, "UNAUTHORIZED");

/**
 * 403 Forbidden 用のアプリケーション例外を生成する。
 */
export const forbidden = (message = "Forbidden") =>
  new AppError(message, 403, "FORBIDDEN");

/**
 * 404 Not Found 用のアプリケーション例外を生成する。
 */
export const notFound = (message: string) =>
  new AppError(message, 404, "NOT_FOUND");

/**
 * 409 Conflict 用のアプリケーション例外を生成する。
 */
export const conflict = (message: string) =>
  new AppError(message, 409, "CONFLICT");
