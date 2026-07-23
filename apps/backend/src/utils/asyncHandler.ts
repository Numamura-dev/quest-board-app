import { NextFunction, Request, Response } from "express";

/**
 * 非同期ハンドラーの例外を Express の `next` に委譲する。
 * @param handler - Promise を返す Express ハンドラー
 * @returns Express 互換のラッパー関数
 */
export const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
};
