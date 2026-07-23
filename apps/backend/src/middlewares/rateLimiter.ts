import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * シンプルなインメモリレートリミッター
 *
 * 注意: 複数プロセス/インスタンス構成では Redis 等の共有ストアへの移行を推奨。
 */
const store = new Map<string, RateLimitEntry>();

/**
 * 期限切れエントリを定期的にクリーンアップ (メモリリーク防止)
 * .unref() でプロセス終了を妨げず、Jest の open handle 警告も回避する。
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 60_000).unref();

export interface RateLimitOptions {
  /** 制限対象の時間ウィンドウ (ミリ秒) */
  windowMs: number;
  /** ウィンドウ内の最大リクエスト数 */
  max: number;
  /** 制限超過時のエラーメッセージ */
  message?: string;
}

/**
 * レートリミットミドルウェアファクトリ
 *
 * IP 単位でリクエスト数を制限し、超過時に 429 を返す。
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = "Too many requests. Please try again later.",
  } = options;

  return function rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // req.ip は Express の trust proxy 設定に従い安全に解決される。
    // 偽装リスクがある x-forwarded-for の直接参照は使用しない。
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";

    const now = Date.now();
    const key = `${ip}:${req.path}`;

    let entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: now + windowMs };
      store.set(key, entry);
    } else {
      entry.count += 1;
    }

    const remaining = Math.max(0, max - entry.count);
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetSeconds);

    if (entry.count > max) {
      logger.warn(
        { ip, path: req.path, count: entry.count },
        "レートリミットを超過しました"
      );
      res.status(429).json({
        success: false,
        error: message,
        code: "RATE_LIMIT_EXCEEDED",
      });
      return;
    }

    next();
  };
}

/**
 * 検索 API 用レートリミット (60秒に30リクエストまで)
 */
export const searchRateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 30,
  message: "検索リクエストが多すぎます。しばらくしてから再度お試しください。",
});

/**
 * 汎用 API レートリミット (60秒に100リクエストまで)
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 100,
  message:
    "リクエストが多すぎます。しばらくしてから再度お試しください。",
});
