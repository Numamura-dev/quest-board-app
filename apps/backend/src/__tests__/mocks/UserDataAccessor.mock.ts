import type { User } from "@prisma/client";

export const mockAdminUser1: User = {
	id: 1,
	name: "Alice",
	email: "alice@example.com",
	role: "admin",
	google_sub: "google_sub_admin_1",
	created_at: new Date("2025-01-01T00:00:00.000Z"),
	updated_at: new Date("2025-01-01T00:00:00.000Z"),
};

export const mockAdminUser2: User = {
	id: 2,
	name: "Bob",
	email: "bob@example.com",
	role: "user",
	google_sub: "google_sub_user_2",
	created_at: new Date("2025-01-02T00:00:00.000Z"),
	updated_at: new Date("2025-01-02T00:00:00.000Z"),
};

type AdminUserView = Omit<
	User,
	| "google_sub"
	| "clear_submissions"
	| "entries"
	| "feedbacks"
	| "incentive_payments"
	| "notifications"
	| "offers"
	| "point_transactions"
	| "quest_participants"
	| "reviews"
>;

export const mockAllUsersForAdmin: AdminUserView[] = [
	{
		id: mockAdminUser1.id,
		name: mockAdminUser1.name,
		email: mockAdminUser1.email,
		role: mockAdminUser1.role,
		created_at: mockAdminUser1.created_at,
		updated_at: mockAdminUser1.updated_at,
	},
	{
		id: mockAdminUser2.id,
		name: mockAdminUser2.name,
		email: mockAdminUser2.email,
		role: mockAdminUser2.role,
		created_at: mockAdminUser2.created_at,
		updated_at: mockAdminUser2.updated_at,
	},
];

export const mockUser1: User = {
	id: 3,
	name: "Charlie",
	email: "charlie@example.com",
	role: "user",
	google_sub: "google_sub_user_3",
	created_at: new Date("2025-01-03T00:00:00.000Z"),
	updated_at: new Date("2025-01-03T00:00:00.000Z"),
};

export const mockUser2: User = {
	id: 4,
	name: "Diana",
	email: "diana@example.com",
	role: "user",
	google_sub: "google_sub_user_4",
	created_at: new Date("2025-01-04T00:00:00.000Z"),
	updated_at: new Date("2025-01-04T00:00:00.000Z"),
};

export const mockUserWithGoogleSub: User = {
	id: 5,
	name: "Eve",
	email: "eve@example.com",
	role: "user",
	google_sub: "google_sub_user_5",
	created_at: new Date("2025-01-05T00:00:00.000Z"),
	updated_at: new Date("2025-01-05T00:00:00.000Z"),
};

export const mockUserDataAccessor = {
	getAllForAdmin: jest.fn().mockResolvedValue(mockAllUsersForAdmin),
	findById: jest.fn().mockImplementation((id: number) => {
		return [
			mockAdminUser1,
			mockAdminUser2,
			mockUser1,
			mockUser2,
			mockUserWithGoogleSub,
		].find((user) => user.id === id);
	}),
	findByEmail: jest.fn().mockImplementation((email: string) => {
		return [
			mockAdminUser1,
			mockAdminUser2,
			mockUser1,
			mockUser2,
			mockUserWithGoogleSub,
		].find((user) => user.email === email);
	}),
	findByName: jest.fn().mockImplementation((name: string) => {
		return [
			mockAdminUser1,
			mockAdminUser2,
			mockUser1,
			mockUser2,
			mockUserWithGoogleSub,
		].find((user) => user.name === name);
	}),
	findByNameOrEmail: jest.fn(),
	findByGoogleSub: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	findRelatedData: jest.fn(),
	deleteRelatedData: jest.fn(),
};
