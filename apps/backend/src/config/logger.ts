import pino from "pino";
import pinoHttp from "pino-http";

const isProduction = process.env.NODE_ENV === "production";

/**
 * アプリケーション共通で利用する Pino ロガー。
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
  base: undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      },
});

/**
 * HTTP リクエスト単位のログ出力を行う Pino middleware。
 */
export const httpLogger = pinoHttp({
  logger,
  customLogLevel(_req, res, error) {
    if (error || res.statusCode >= 500) {
      return "error";
    }
    if (res.statusCode >= 400) {
      return "warn";
    }
    return "info";
  },
  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} を ${res.statusCode} で処理しました`;
  },
  customErrorMessage(req, res, error) {
    return `${req.method} ${req.url} の処理に失敗しました (${res.statusCode}): ${error.message}`;
  },
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
