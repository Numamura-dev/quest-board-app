import type { Request } from "express";
import type { ZodError, ZodTypeAny } from "zod";
import { badRequest } from "./appError";

type RequestSchemas = {
	body?: ZodTypeAny;
	params?: ZodTypeAny;
	query?: ZodTypeAny;
};

const formatIssues = (error: ZodError) =>
	error.issues.map((issue) => ({
		field: issue.path.join(".") || undefined,
		message: issue.message,
	}));

const parseSegment = <T extends ZodTypeAny>(
	schema: T | undefined,
	value: unknown,
): T["_output"] | undefined => {
	if (!schema) {
		return undefined;
	}

	const result = schema.safeParse(value);
	if (!result.success) {
		throw badRequest("Request validation failed", formatIssues(result.error));
	}

	return result.data;
};

export const validateRequest = <T extends RequestSchemas>(
	req: Request,
	schemas: T,
) => ({
	body: parseSegment(schemas.body, req.body),
	params: parseSegment(schemas.params, req.params),
	query: parseSegment(schemas.query, req.query),
});
