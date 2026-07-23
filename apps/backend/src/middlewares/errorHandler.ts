import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { logger } from "../config/logger";

/**
 * アプリケーション共通の例外を HTTP レスポンスへ変換する。
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestLogger = req.log ?? logger;

  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    requestLogger.warn(
      {
        err: error,
        code: error.code,
        details: error.details,
      },
      `アプリケーションエラーが発生しました: ${error.message}`
    );

    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  requestLogger.error({ err: error }, "未処理の例外が発生しました");

  return res.status(500).json({
    success: false,
    error: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
};
