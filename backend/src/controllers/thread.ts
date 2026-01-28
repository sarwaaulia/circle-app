import { Request, Response } from "express";
import prisma from "../prisma/client";
import ThreadModel from "../models/thread";
import { createThreadSchema, updateThreadSchema } from "../validation/auth_joi";
import { broadcast } from "../services/socket";

class ThreadController {
	// Get all threads
	async getAllThreads(req: Request, res: Response) {
		try {
			const authUser = (req as any).user;
			const rawThreads = await ThreadModel.findAllThread();

			const threads = await Promise.all(
				rawThreads.map(async (t: any) => {
					const likes = await prisma.like.count({
						where: { threadId: t.id },
					});

					const isLiked = await prisma.like.findFirst({
						where: {
							threadId: t.id,
							userId: authUser?.id,
						},
					});

					return {
						...t,
						likesCount: likes,
						isLiked: Boolean(isLiked),
						full_name: t.user?.full_name,
						username: t.user?.username || "user",
						photo_profile: t.user?.photo_profile || null,
						userId: t.user?.id,
					};
				}),
			);

			res.status(200).json({
				success: true,
				message: `get data thread successfully`,
				data: threads,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error fetching threads",
				error: (error as Error).message,
			});
		}
	}

	// Get thread by ID
	async getThreadById(req: Request, res: Response) {
		try {
			const authUser = (req as any).user;
			const id = req.params.id as string;

			const rawThread = await ThreadModel.getById(parseInt(id as string));

			if (!rawThread) {
				return res.status(404).json({
					success: false,
					message: "Thread not found",
				});
			}

			//
			const likes = await prisma.like.count({
				where: { threadId: parseInt(id as string) },
			});

			// Check if current user liked
			const isLiked = await prisma.like.findFirst({
				where: {
					threadId: parseInt(id as string),
					userId: authUser?.id,
				},
			});

			const threadData = {
				...rawThread,
				likesCount: likes,
				isLiked: Boolean(isLiked),
			};

			res.status(200).json({
				success: true,
				data: threadData,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error fetching thread",
				error: (error as Error).message,
			});
		}
	}

	// Get threads by user
	async getThreadsByUser(req: Request, res: Response) {
		try {
			const { userId } = req.params;
			const threads = await ThreadModel.getUserId(userId as string);

			res.status(200).json({
				success: true,
				message: `get user ID ${userId} successfully`,
				data: threads,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error fetching user threads",
				error: (error as Error).message,
			});
		}
	}

	// Create a new thread
	async createThread(req: Request, res: Response) {
		try {
			if (!req.body || typeof req.body !== "object") {
				return res.status(400).json({
					success: false,
					message: "Invalid request body",
				});
			}

			const { error } = createThreadSchema.validate(req.body);
			if (error) {
				return res.status(400).json({
					success: false,
					message: error.details[0].message,
				});
			}

			const { content } = req.body;
			let images: string[] = [];

			if (req.files && Array.isArray(req.files)) {
				// Ambil semua filename dan masukkan ke dalam array images
				images = (req.files as Express.Multer.File[]).map(
					(file) => file.filename,
				);
			}
			const authUser = (req as any).user;

			// Fetch user info for the new thread
			const newThread = await ThreadModel.create({
				content,
				images: images as any,
				number_of_replies: 0,
				createdBy: authUser.id.toString(),
				updatedBy: authUser.id.toString(),
			});

			const fullThread = await ThreadModel.getById(newThread.id);

			if (!fullThread)
				throw new Error("failed to retrieve complete thread data ");

			// BROADCAST DATA FINAL
			broadcast({
				type: "NEW_THREAD",
				data: fullThread,
			});

			return res.status(201).json({
				success: true,
				data: fullThread,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error creating thread",
				error: (error as Error).message,
			});
		}
	}

	// Update thread
	async updateThread(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!req.body || typeof req.body !== "object") {
				return res.status(400).json({
					success: false,
					message: "Invalid request body",
				});
			}

			const { error } = updateThreadSchema.validate(req.body);
			if (error) {
				return res.status(400).json({
					success: false,
					message: error.details[0].message,
				});
			}

			const { content, image } = req.body;
			const authUser = (req as any).user;

			// Fetch the thread to check ownership
			const thread = await ThreadModel.getById(parseInt(id as string));
			if (!thread) {
				return res.status(404).json({
					success: false,
					message: "Thread not found",
				});
			}

			// Check if the thread was created by the current user
			if (thread.createdBy !== authUser.id.toString()) {
				return res.status(403).json({
					success: false,
					message: "you cant update thread someone else",
				});
			}

			const updatedThread = await ThreadModel.update(parseInt(id as string), {
				content,
				image,
				updatedBy: authUser.id.toString(),
			});

			res.status(200).json({
				success: true,
				message: "Thread updated successfully",
				data: updatedThread,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error updating thread",
				error: (error as Error).message,
			});
		}
	}

	// Delete thread
	async deleteThread(req: Request, res: Response) {
		try {
			const { id } = req.params;

			await ThreadModel.deleteThread(parseInt(id as string));

			res.status(200).json({
				success: true,
				message: "Thread deleted successfully",
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error deleting thread",
				error: (error as Error).message,
			});
		}
	}

	// Increment reply count
	async incrementReplies(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const updatedThread = await ThreadModel.incrementReplies(
				parseInt(id as string),
			);

			res.status(200).json({
				success: true,
				message: "Reply count incremented",
				data: updatedThread,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error incrementing replies",
				error: (error as Error).message,
			});
		}
	}

	// Search threads
	async searchThreads(req: Request, res: Response) {
		try {
			const query = req.query.q as string | string[];

			if (!query) {
				return res.status(400).json({ message: "Query is required" });
			}

			let searchQuery: string;
			if (typeof query === "string") {
				searchQuery = query;
			} else if (Array.isArray(query) && typeof query[0] === "string") {
				searchQuery = query[0];
			} else {
				return res.status(400).json({ message: "Invalid query format" });
			}

			const threads = await ThreadModel.search(searchQuery);

			res.status(200).json({
				success: true,
				message: "Threads searched successfully",
				data: threads,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error searching threads",
				error: (error as Error).message,
			});
		}
	}

	// Get like status and count
	async getLikeStatus(req: Request, res: Response) {
		try {
			const threadId = parseInt(req.params.id as string);
			const authUser = (req as any).user;

			if (!authUser) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const userId = authUser.id;

			// Count likes
			const likesCount = await prisma.like.count({
				where: { threadId: threadId },
			});

			// Check if current user liked
			const isLiked = await prisma.like.findFirst({
				where: {
					threadId: threadId,
					userId: userId,
				},
			});

			return res.status(200).json({
				success: true,
				isLiked: Boolean(isLiked),
				likesCount,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error fetching like status",
				error: (error as Error).message,
			});
		}
	}

	// Toggle like / unlike
	async toggleLike(req: Request, res: Response) {
		try {
			const threadId = parseInt(req.params.threadId as string);
			const authUser = (req as any).user;

			if (!authUser) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const userId = authUser.id;

			// cek apakah user sudah like
			const existingLike = await prisma.like.findFirst({
				where: {
					threadId: threadId,
					userId: userId,
				},
			});

			// Kalau SUDAH LIKE → UNLIKE
			if (existingLike) {
				await prisma.like.delete({
					where: { id: existingLike.id },
				});

				const likesCount = await prisma.like.count({
					where: { threadId: threadId },
				});

				broadcast({
					type: "LIKE_UPDATE",
					threadId,
					userId,
					liked: false,
					likesCount,
				});

				return res.status(200).json({
					success: true,
					liked: false,
					message: "LIKE_UPDATE",
				});
			}

			// Kalau BELUM LIKE → CREATE LIKE
			await prisma.like.create({
				data: {
					threadId: threadId,
					userId: userId,
					createdBy: String(userId),
					updatedBy: String(userId),
				},
			});

			const likesCount = await prisma.like.count({
				where: { threadId: threadId },
			});

			broadcast({
				type: "LIKED_UPDATE",
				threadId,
				userId,
				liked: true,
				likesCount,
			});

			return res.status(200).json({
				success: true,
				liked: true,
				message: "LIKED",
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error toggling like",
				error: (error as Error).message,
			});
		}
	}
}

export default new ThreadController();
