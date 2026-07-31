import { prisma } from "../../config/db";
import type { User } from "@prisma/client";

export interface CreateUserData {
	name: string;
	email: string;
	role: string;
	google_sub: string;
}

export interface UpdateUserData {
	name?: string;
	email?: string;
	role?: string;
	google_sub?: string;
}

export class UserDataAccessor {
	async findById(id: number): Promise<User | null> {
		return await prisma.user.findUnique({
			where: { id },
		});
	}

	async findByEmail(email: string): Promise<User | null> {
		return await prisma.user.findUnique({
			where: { email },
		});
	}

	async findByName(name: string): Promise<User | null> {
		return await prisma.user.findFirst({
			where: { name },
		});
	}

	async findByNameOrEmail(name: string, email: string): Promise<User | null> {
		return await prisma.user.findFirst({
			where: {
				OR: [{ name }, { email }],
			},
		});
	}

	async create(data: CreateUserData): Promise<User> {
		return await prisma.user.create({
			data,
		});
	}

	async update(id: number, data: UpdateUserData): Promise<User> {
		return await prisma.user.update({
			where: { id },
			data,
		});
	}

	async findByGoogleSub(googleSub: string): Promise<User | null> {
		return await prisma.user.findUnique({
			where: { google_sub: googleSub },
		});
	}

	async getAllForAdmin() {
		return await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				created_at: true,
			},
			orderBy: {
				created_at: "desc",
			},
		});
	}

	async delete(id: number): Promise<User> {
		return await prisma.user.delete({
			where: { id },
		});
	}

	async deleteByGoogleSub(googleSub: string): Promise<User> {
		return await prisma.user.delete({
			where: { google_sub: googleSub },
		});
	}

	async findRelatedData(userId: number) {
		const [
			clearSubmissions,
			entries,
			feedbacks,
			incentivePayments,
			notifications,
			offers,
			pointTransactions,
			questParticipants,
			reviews,
		] = await Promise.all([
			prisma.clearSubmission.count({ where: { user_id: userId } }),
			prisma.entry.count({ where: { user_id: userId } }),
			prisma.feedback.count({ where: { user_id: userId } }),
			prisma.incentivePayment.count({ where: { user_id: userId } }),
			prisma.notification.count({ where: { user_id: userId } }),
			prisma.offer.count({ where: { user_id: userId } }),
			prisma.pointTransaction.count({ where: { user_id: userId } }),
			prisma.questParticipant.count({ where: { user_id: userId } }),
			prisma.review.count({ where: { reviewer_id: userId } }),
		]);

		return {
			clearSubmissions,
			entries,
			feedbacks,
			incentivePayments,
			notifications,
			offers,
			pointTransactions,
			questParticipants,
			reviews,
		};
	}

	async deleteRelatedData(userId: number) {
		await prisma.clearSubmission.deleteMany({ where: { user_id: userId } });
		await prisma.entry.deleteMany({ where: { user_id: userId } });
		await prisma.feedback.deleteMany({ where: { user_id: userId } });
		await prisma.incentivePayment.deleteMany({ where: { user_id: userId } });
		await prisma.notification.deleteMany({ where: { user_id: userId } });
		await prisma.offer.deleteMany({ where: { user_id: userId } });
		await prisma.pointTransaction.deleteMany({ where: { user_id: userId } });
		await prisma.questParticipant.deleteMany({ where: { user_id: userId } });
		await prisma.review.deleteMany({ where: { reviewer_id: userId } });
	}
}
