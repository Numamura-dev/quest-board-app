import { randomUUID } from "node:crypto";
// @ts-nocheck
import {
	type APIRequestContext,
	expect,
	request,
	test,
} from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001";

test.describe.configure({ mode: "serial" });

test.describe("User Management API E2E Test", () => {
	let apiContext: APIRequestContext;
	const prisma = new PrismaClient();
	let createdUserId: number;
	let createdUserEmail: string;
	let createdUserName: string;
	let shouldCleanup = false;

	test.beforeAll(async () => {
		apiContext = await request.newContext({
			baseURL: BASE_URL,
		});

		const uniqueSuffix = randomUUID();

		const user = await prisma.user.create({
			data: {
				name: `e2e-user-${uniqueSuffix.slice(0, 8)}`,
				email: `e2e-user-${uniqueSuffix}@example.com`,
				role: "user",
			},
		});

		createdUserId = user.id;
		createdUserEmail = user.email;
		createdUserName = user.name;
		shouldCleanup = true;
	});

	test.afterAll(async () => {
		if (shouldCleanup) {
			await prisma.user
				.delete({ where: { id: createdUserId } })
				.catch(() => {});
		}
		await prisma.$disconnect();
		await apiContext.dispose();
	});

	test("GET /api/users?email=... でユーザー情報を取得できる", async () => {
		const response = await apiContext.get(
			`/api/users?email=${encodeURIComponent(createdUserEmail)}`,
		);

		expect(response.ok()).toBeTruthy();
		const body = await response.json();

		expect(body[0]).toMatchObject({
			id: createdUserId,
			name: createdUserName,
			email: createdUserEmail,
		});
	});

	test("GET /api/users?name=... の結果からユーザーIDを取得できる", async () => {
		const response = await apiContext.get(
			`/api/users?name=${encodeURIComponent(createdUserName)}`,
		);

		expect(response.ok()).toBeTruthy();
		const body = await response.json();
		expect(body[0]?.id).toBe(createdUserId);
	});

	test("GET /api/users で対象ユーザーが含まれている", async () => {
		const response = await apiContext.get("/api/users");
		expect(response.ok()).toBeTruthy();

		const users = (await response.json()) as Array<{
			id: number;
			email: string;
		}>;
		const found = users.find((user) => user.id === createdUserId);
		expect(found).toBeTruthy();
		expect(found?.email).toBe(createdUserEmail);
	});

	test("PUT /api/admin/users/:id/role でユーザーのロールを更新できる", async () => {
		const response = await apiContext.put(
			`/api/admin/users/${createdUserId}/role`,
			{
				data: { role: "admin" },
			},
		);

		expect(response.ok()).toBeTruthy();
		const body = await response.json();
		expect(body.user.role).toBe("admin");

		const updatedUser = await prisma.user.findUnique({
			where: { id: createdUserId },
		});
		expect(updatedUser?.role).toBe("admin");
	});

	test("DELETE /api/users/:id でユーザーを削除できる", async () => {
		const response = await apiContext.delete(`/api/users/${createdUserId}`);

		expect(response.ok()).toBeTruthy();

		const body = await response.json();
		expect(body.message).toBe("User deleted successfully");
		expect(body.user.id).toBe(createdUserId);

		const deletedUser = await prisma.user.findUnique({
			where: { id: createdUserId },
		});
		expect(deletedUser).toBeNull();

		shouldCleanup = false;

		const notFound = await apiContext.get(
			`/api/users?email=${encodeURIComponent(createdUserEmail)}`,
		);
		expect(notFound.ok()).toBeTruthy();
		expect(await notFound.json()).toEqual([]);
	});
});
