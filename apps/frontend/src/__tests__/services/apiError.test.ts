import { describe, it, expect } from "vitest";
import { ApiError, isApiErrorResponse } from "@/services/apiError";

describe("ApiError", () => {
  it("メッセージ・コード・ステータスが正しく設定される", () => {
    const err = new ApiError("Not found", "NOT_FOUND", 404);
    expect(err.message).toBe("Not found");
    expect(err.code).toBe("NOT_FOUND");
    expect(err.status).toBe(404);
  });

  it("name が ApiError になる", () => {
    const err = new ApiError("error", "CODE", 400);
    expect(err.name).toBe("ApiError");
  });

  it("details が任意で設定される", () => {
    const details = [{ field: "email", message: "invalid" }];
    const err = new ApiError("Validation failed", "VALIDATION_ERROR", 400, details);
    expect(err.details).toEqual(details);
  });

  it("details なしの場合は undefined", () => {
    const err = new ApiError("error", "CODE", 400);
    expect(err.details).toBeUndefined();
  });

  describe("isUnauthorized()", () => {
    it("status 401 のとき true を返す", () => {
      const err = new ApiError("Unauthorized", "UNAUTHORIZED", 401);
      expect(err.isUnauthorized()).toBe(true);
    });

    it("status 401 以外のとき false を返す", () => {
      const err = new ApiError("Not found", "NOT_FOUND", 404);
      expect(err.isUnauthorized()).toBe(false);
    });
  });

  describe("isValidationError()", () => {
    it("code が VALIDATION_ERROR のとき true を返す", () => {
      const err = new ApiError("Validation error", "VALIDATION_ERROR", 400);
      expect(err.isValidationError()).toBe(true);
    });

    it("code が VALIDATION_ERROR 以外のとき false を返す", () => {
      const err = new ApiError("Not found", "NOT_FOUND", 404);
      expect(err.isValidationError()).toBe(false);
    });
  });

  describe("isNotFound()", () => {
    it("status 404 のとき true を返す", () => {
      const err = new ApiError("Not found", "NOT_FOUND", 404);
      expect(err.isNotFound()).toBe(true);
    });

    it("status 404 以外のとき false を返す", () => {
      const err = new ApiError("error", "CODE", 500);
      expect(err.isNotFound()).toBe(false);
    });
  });

  it("Error のインスタンスである", () => {
    const err = new ApiError("error", "CODE", 500);
    expect(err instanceof Error).toBe(true);
    expect(err instanceof ApiError).toBe(true);
  });
});

describe("isApiErrorResponse", () => {
  it("標準エラー形式のオブジェクトを true と判定する", () => {
    expect(
      isApiErrorResponse({ success: false, error: "msg", code: "CODE" })
    ).toBe(true);
  });

  it("details があっても true を返す", () => {
    expect(
      isApiErrorResponse({
        success: false,
        error: "msg",
        code: "CODE",
        details: [{ message: "detail" }],
      })
    ).toBe(true);
  });

  it("success が true の場合は false を返す", () => {
    expect(
      isApiErrorResponse({ success: true, error: "msg", code: "CODE" })
    ).toBe(false);
  });

  it("error フィールドがない場合は false を返す", () => {
    expect(isApiErrorResponse({ success: false, code: "CODE" })).toBe(false);
  });

  it("code フィールドがない場合は false を返す", () => {
    expect(isApiErrorResponse({ success: false, error: "msg" })).toBe(false);
  });

  it("null の場合は false を返す", () => {
    expect(isApiErrorResponse(null)).toBe(false);
  });

  it("文字列の場合は false を返す", () => {
    expect(isApiErrorResponse("error string")).toBe(false);
  });
});
