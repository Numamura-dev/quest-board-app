import type { Request } from "express";
import { z } from "zod";
import { AppError } from "../../utils/appError";
import { validateRequest } from "../../utils/validate";

describe("validateRequest", () => {
	it("params と body を schema に従って変換する", () => {
		const req = {
			params: { id: "42" },
			body: { count: "3" },
			query: {},
		} as unknown as Request;

		const result = validateRequest(req, {
			params: z.object({ id: z.coerce.number().int() }),
			body: z.object({ count: z.coerce.number().int().positive() }),
		});

		expect(result.params).toEqual({ id: 42 });
		expect(result.body).toEqual({ count: 3 });
	});

	it("schema 違反を AppError に変換する", () => {
		const req = {
			params: {},
			body: { count: 0 },
			query: {},
		} as unknown as Request;

		expect(() =>
			validateRequest(req, {
				body: z.object({ count: z.number().int().positive() }),
			}),
		).toThrow(AppError);

		try {
			validateRequest(req, {
				body: z.object({ count: z.number().int().positive() }),
			});
		} catch (error) {
			const appError = error as AppError;
			expect(appError.statusCode).toBe(400);
			expect(appError.code).toBe("VALIDATION_ERROR");
			expect(appError.details).toEqual(
				expect.arrayContaining([expect.objectContaining({ field: "count" })]),
			);
		}
	});
});
