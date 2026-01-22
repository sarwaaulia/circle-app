import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface createThread {
	content: string;
	image: string;
	number_of_replies: number;
	createdBy: string;
	updatedBy: string;
}

export interface updateThread {
	content?: string;
	image?: string;
	number_of_replies?: number;
	updatedBy: string;
	updated_at?: Date;
}

class ThreadModel {
	static async create(data: createThread) {
		// create thrread
		return await prisma.thread.create({
			data: {
				content: data.content,
				image: data.image,
				number_of_replies: data.number_of_replies,
				createdBy: data.createdBy,
				updatedBy: data.updatedBy,
			},
		});
	}

	// get thread
	static async findAllThread() {
		return await prisma.thread.findMany({
			orderBy: { createdAt: "desc" },
		});
	}

	// get thread id
	static async getById(id: number) {
		const thread = await prisma.thread.findUnique({
			where: { id: id },
		});
		if (!thread) return null;

		const user = await prisma.user.findUnique({
			where: { id: parseInt(thread.createdBy) },
			select: {
				id: true,
				username: true,
				full_name: true,
				photo_profile: true,
			},
		});

		return {
			id: thread?.id,
			content: thread?.content,
			image: thread?.image,
			number_of_replies: thread?.number_of_replies,
			createdBy: thread?.createdBy,
			updatedBy: thread?.updatedBy,
			user: user || null,
		};
	}

	// get user id
	static async getUserId(user_id: string) {
		const thread = await prisma.thread.findMany({
			where: { createdBy: user_id },
			orderBy: { createdAt: "desc" },
		});
		const user = await prisma.user.findUnique({
			where: { id: parseInt(user_id) },
			select: {
				id: true,
				username: true,
				full_name: true,
				photo_profile: true,
			},
		});
		return thread.map((thread) => ({
			id: thread.id,
			content: thread.content,
			image: thread.image,
			number_of_replies: thread?.number_of_replies,
			createdBy: thread?.createdBy,
			updatedBy: thread?.updatedBy,
			user: user || null,
		}));
	}

	static async update(id: number, data: updateThread) {
		return await prisma.thread.update({
			where: { id },
			data: {
				...data,
				updatedAt: new Date(),
			},
		});
	}

	static async deleteThread(id: number) {
		return await prisma.thread.delete({
			where: { id },
		});
	}

	// jumlah reply yang terisi
	static async incrementReplies(id: number) {
		return await prisma.thread.update({
			where: { id },
			data: {
				number_of_replies: {
					increment: 1,
				},
			},
		});
	}

	// content thread dengan user info
	static async search(query: string) {
		const threads = await prisma.thread.findMany({
			where: {
				content: {
					contains: query,
					mode: "insensitive",
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		const threadsWithUser = await Promise.all(
			threads.map(async (thread) => {
				const user = await prisma.user.findUnique({
					where: { id: parseInt(thread.createdBy) },
					select: {
						id: true,
						username: true,
						full_name: true,
						photo_profile: true,
					},
				});

				return {
					id: thread.id,
					content: thread.content,
					image: thread.image,
					number_of_replies: thread.number_of_replies,
					created_at: thread.createdAt,
					user: user || null,
				};
			}),
		);

		return threadsWithUser;
	}
}

export default ThreadModel;
