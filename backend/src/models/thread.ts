import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface createThread {
	content: string;
	images: [];
	number_of_replies?: number;
	createdBy: string;
	updatedBy: string;
}

export interface updateThread {
	content?: string;
	image: [];
	number_of_replies?: number;
	updatedBy: string;
}

class ThreadModel {
	static async create(data: createThread) {
		return prisma.thread.create({
			data: {
				content: data.content,
				image: data.images,
				number_of_replies: data.number_of_replies ?? 0,
				createdBy: data.createdBy,
				updatedBy: data.updatedBy,
			},
		});
	}

	static async findAllThread() {
		const threads = await prisma.thread.findMany({
			orderBy: { createdAt: "desc" },
		});

		const userIds = [
			...new Set(threads.map(t => Number(t.createdBy))),
		];

		const users = await prisma.user.findMany({
			where: { id: { in: userIds } },
			select: {
				id: true,
				username: true,
				full_name: true,
				photo_profile: true,
			},
		});

		const userMap = mapUserById(users);

		return threads.map(thread => ({
			...thread,
			user: userMap.get(Number(thread.createdBy)) || null,
		}));
	}

	// get by thread id
	static async getById(id: number) {
		const thread = await prisma.thread.findUnique({
			where: { id },
		});
		if (!thread) return null;

		const user = await prisma.user.findUnique({
			where: { id: Number(thread.createdBy) },
			select: {
				id: true,
				username: true,
				full_name: true,
				photo_profile: true,
			},
		});

		return {
			...thread,
			user: user || null,
		};
	}

	// get by user id
	static async getUserId(user_id: string) {
		const threads = await prisma.thread.findMany({
			where: { createdBy: user_id },
			orderBy: { createdAt: "desc" },
		});

		const user = await prisma.user.findUnique({
			where: { id: Number(user_id) },
			select: {
				id: true,
				username: true,
				full_name: true,
				photo_profile: true,
			},
		});

		return threads.map(thread => ({
			...thread,
			user: user || null,
		}));
	}

	// for updating thread
	static async update(id: number, data: updateThread) {
		return prisma.thread.update({
			where: { id },
			data: {
				...data,
				updatedAt: new Date(),
			},
		});
	}

	// delete
	static async deleteThread(id: number) {
		return prisma.thread.delete({ where: { id } });
	}

	// reply auto terisi jika user reply suatu post
	static async incrementReplies(id: number) {
		return prisma.thread.update({
			where: { id },
			data: {
				number_of_replies: { increment: 1 },
			},
		});
	}

	// searh thread
	static async search(query: string) {
		const threads = await prisma.thread.findMany({
			where: {
				content: {
					contains: query,
					mode: "insensitive",
				},
			},
			orderBy: { createdAt: "desc" },
		});

		const userIds = [
			...new Set(threads.map(t => Number(t.createdBy))),
		];

		const users = await prisma.user.findMany({
			where: { id: { in: userIds } },
			select: {
				id: true,
				username: true,
				full_name: true,
				photo_profile: true,
			},
		});

		const userMap = mapUserById(users);

		return threads.map(thread => ({
			...thread,
			user: userMap.get(Number(thread.createdBy)) || null,
		}));
	}
}

// 
function mapUserById(users: any[]) {
	const map = new Map<number, any>();
	users.forEach(user => map.set(user.id, user));
	return map;
}

export default ThreadModel;
