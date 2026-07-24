process.env.DATABASE_URL =
	process.env.DATABASE_URL ?? "mysql://user:password@localhost:3306/test_db";

import { Readable, Writable } from "node:stream";
import type { NextFunction } from "express";
import express from "express";
import { errorHandler } from "../../middlewares/errorHandler";
import questsRouter from "../../routes/quests";
import reviewsRouter from "../../routes/reviews";

const createApp = () => {
	const app = express();
	app.use(express.json());
	app.use("/api/quests", questsRouter);
	app.use("/api/reviews", reviewsRouter);
	app.use(errorHandler);
	return app;
};

type MockResponse = Writable & {
	statusCode: number;
	setHeader: (name: string, value: string | string[] | number) => void;
	getHeader: (name: string) => string | string[] | number | undefined;
	removeHeader: (name: string) => void;
	writeHead: (statusCode: number) => MockResponse;
	end: (chunk?: string | Buffer) => MockResponse;
};

const request = async (path: string, method: "POST" | "PUT" | "DELETE") => {
	const app = createApp() as ReturnType<typeof createApp> & {
		handle: (req: Readable, res: Writable, next: NextFunction) => void;
	};
	const body = JSON.stringify({
		rating: 5,
		comment: "test",
	});
	const req = Object.assign(Readable.from([body]), {
		method,
		url: path,
		headers: {
			"content-type": "application/json",
			"content-length": Buffer.byteLength(body).toString(),
		},
	});
	const chunks: Buffer[] = [];
	const headers = new Map<string, string | string[] | number>();
	const res = Object.assign(
		new Writable({
			write(chunk, _encoding, callback) {
				chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
				callback();
			},
		}),
		{
			statusCode: 200,
			setHeader(name: string, value: string | string[] | number) {
				headers.set(name.toLowerCase(), value);
			},
			getHeader(name: string) {
				return headers.get(name.toLowerCase());
			},
			removeHeader(name: string) {
				headers.delete(name.toLowerCase());
			},
			writeHead(statusCode: number) {
				this.statusCode = statusCode;
				return this;
			},
			end(chunk?: string | Buffer) {
				if (chunk) {
					chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
				}
				(this as unknown as Writable).emit("finish");
				return this;
			},
		},
	) as unknown as MockResponse;

	await new Promise<void>((resolve, reject) => {
		res.on("finish", () => resolve());
		res.on("error", reject);
		app.handle(req, res, reject);
	});

	return {
		status: res.statusCode,
		json: () =>
			JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
				code: string;
			},
	};
};

describe("認証保護ルート", () => {
	it("POST /api/quests/:questId/reviews はトークン無しで 401 を返す", async () => {
		const response = await request("/api/quests/1/reviews", "POST");
		expect(response.status).toBe(401);
		const body = (await response.json()) as { code: string };
		expect(body.code).toBe("UNAUTHORIZED");
	});

	it("PUT /api/reviews/:reviewId はトークン無しで 401 を返す", async () => {
		const response = await request("/api/reviews/1", "PUT");
		expect(response.status).toBe(401);
		const body = (await response.json()) as { code: string };
		expect(body.code).toBe("UNAUTHORIZED");
	});

	it("DELETE /api/reviews/:reviewId はトークン無しで 401 を返す", async () => {
		const response = await request("/api/reviews/1", "DELETE");
		expect(response.status).toBe(401);
		const body = (await response.json()) as { code: string };
		expect(body.code).toBe("UNAUTHORIZED");
	});
});
