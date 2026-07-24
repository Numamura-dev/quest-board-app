import type { Request, Response, NextFunction } from "express";
import { createRateLimiter } from "../../middlewares/rateLimiter";

function mockRequest(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    path: "/api/quests",
    socket: { remoteAddress: "127.0.0.1" },
    ...overrides,
  } as unknown as Request;
}

function mockResponse(): Response & {
  _status: number;
  _json: unknown;
  _headers: Record<string, unknown>;
} {
  const headers: Record<string, unknown> = {};
  const res = {
    _status: 200,
    _json: null as unknown,
    _headers: headers,
    setHeader(key: string, value: unknown) {
      headers[key] = value;
    },
    status(code: number) {
      this._status = code;
      return this;
    },
    json(data: unknown) {
      this._json = data;
      return this;
    },
  };
  return res as unknown as Response & {
    _status: number;
    _json: unknown;
    _headers: Record<string, unknown>;
  };
}

describe("createRateLimiter", () => {
  it("制限内のリクエストは next() を呼ぶ", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });
    const req = mockRequest({ socket: { remoteAddress: "192.168.1.1" } } as Partial<Request>);
    const res = mockResponse();
    const next = jest.fn();

    limiter(req, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res._status).toBe(200);
  });

  it("制限を超えたリクエストは 429 を返す", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
    const req = mockRequest({ socket: { remoteAddress: "10.0.0.1" } } as Partial<Request>);
    const res1 = mockResponse();
    const res2 = mockResponse();
    const res3 = mockResponse();
    const next = jest.fn();

    limiter(req, res1 as Response, next as NextFunction);
    limiter(req, res2 as Response, next as NextFunction);
    limiter(req, res3 as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res3._status).toBe(429);
  });

  it("429 レスポンスに適切な error/code フィールドが含まれる", () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 1,
      message: "Too many requests",
    });
    const req = mockRequest({ socket: { remoteAddress: "10.0.0.2" } } as Partial<Request>);
    const res1 = mockResponse();
    const res2 = mockResponse();
    const next = jest.fn();

    limiter(req, res1 as Response, next as NextFunction);
    limiter(req, res2 as Response, next as NextFunction);

    expect(res2._json).toEqual({
      success: false,
      error: "Too many requests",
      code: "RATE_LIMIT_EXCEEDED",
    });
  });

  it("X-RateLimit ヘッダーが設定される", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
    const req = mockRequest({ socket: { remoteAddress: "10.0.0.3" } } as Partial<Request>);
    const res = mockResponse();
    const next = jest.fn();

    limiter(req, res as Response, next as NextFunction);

    expect(res._headers["X-RateLimit-Limit"]).toBe(10);
    expect(typeof res._headers["X-RateLimit-Remaining"]).toBe("number");
    expect(typeof res._headers["X-RateLimit-Reset"]).toBe("number");
  });

  it("異なる IP のリクエストは独立してカウントされる", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
    // Express が trust proxy 設定で x-forwarded-for から解決した req.ip を模倣する
    const req1 = mockRequest({
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
      ip: "203.0.113.1",
      socket: { remoteAddress: "10.0.0.1" },
      path: "/api/quests",
    } as unknown as Partial<Request>);
    const req2 = mockRequest({
      headers: { "x-forwarded-for": "203.0.113.2, 10.0.0.1" },
      ip: "203.0.113.2",
      socket: { remoteAddress: "10.0.0.1" },
      path: "/api/quests",
    } as unknown as Partial<Request>);
    const res1 = mockResponse();
    const res2 = mockResponse();
    const next = jest.fn();

    limiter(req1, res1 as Response, next as NextFunction);
    limiter(req2, res2 as Response, next as NextFunction);

    // 異なる転送元 IP なので両方 next() が呼ばれる
    expect(next).toHaveBeenCalledTimes(2);
  });
});
