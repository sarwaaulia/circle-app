import { Request, Response } from "express";
import prisma from "../prisma/client";
import ThreadReply from "../models/repliesModel";
import ThreadModel from "../models/thread";
import {
	createThreadReplySchema,
	updateThreadReplySchema,
} from "../validation/auth_joi";
import { broadcastingNewReply } from "../services/socket";

class ReplyController {
	// Create a new reply
	async createReply(req: Request, res: Response) {
		try {
			const threadId = Number(req.params.threadId);

			if (!req.body || typeof req.body !== "object") {
				return res.status(400).json({
					success: false,
					message: "Invalid request body",
				});
			}

			const { error } = createThreadReplySchema.validate(req.body);
			if (error) {
				return res.status(400).json({
					success: false,
					message: error.details[0].message,
				});
			}

			const { content } = req.body;
			let image = req.file ? req.file.filename : null;

			if (Array.isArray(req.files)) {
				const uploadedImg = req.files.find((f: any) => f.fieldname === "image");
				if (uploadedImg) {
					image = uploadedImg.filename;
				}
			}

			const authUser = (req as any).user;

			//check jika ada thread
			const thread = await ThreadModel.getById(threadId);
			if (!thread) {
				return res.status(404).json({
					success: false,
					message: "Thread not found",
				});
			}
			
			const createdReply = await prisma.reply.create({
				data: {
					content,
					image: image || "",
					userId: authUser.id,
					threadId,
					created_by: authUser.id.toString(),
					updated_by: authUser.id.toString(),
				},
				include: {
					user: {
						select: {
							id: true,
							username: true,
							full_name: true,
							photo_profile: true,
						},
					},
				},
			});
			const updatedThread = await prisma.thread.update({
				where: { id: threadId },
				data: {
					number_of_replies: {
						increment: 1,
					},
				},
				select: {
					number_of_replies: true,
				},
			});

			// 3. Broadcast ke client
			broadcastingNewReply({
				threadId,
				reply: createdReply,
				repliesCount: updatedThread.number_of_replies,
			});

			res.status(201).json({
				success: true,
				message: "Reply created successfully",
				data: createdReply,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error creating reply",
				error: (error as Error).message,
			});
		}
	}

	// Get all replies for a thread
	async getRepliesByThread(req: Request, res: Response) {
		try {
			const threadId = Number(req.params.threadId);

			const replies = await ThreadReply.findByThreadId(threadId);

			res.status(200).json({
				success: true,
				data: replies,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error fetching replies",
				error: (error as Error).message,
			});
		}
	}

	// Update a reply
	async updateReply(req: Request, res: Response) {
		try {
			const { id } = req.params;

			if (!req.body || typeof req.body !== "object") {
				return res.status(400).json({
					success: false,
					message: "Invalid request body",
				});
			}

			const { error } = updateThreadReplySchema.validate(req.body);
			if (error) {
				return res.status(400).json({
					success: false,
					message: error.details[0].message,
				});
			}

			const { content, image } = req.body;
			const authUser = (req as any).user;

			// Fetch the reply to check ownership
			const reply = await ThreadReply.findAll();
			const replyData = reply.find((r) => r.id === Number(id));

			if (!replyData) {
				return res.status(404).json({
					success: false,
					message: "Reply not found",
				});
			}

			// Check if the reply was created by the current user
			if (!replyData.user || replyData.user.id !== authUser.id) {
				return res.status(403).json({
					success: false,
					message: "You can only update your own replies",
				});
			}

			const updateData: any = {
				updated_by: authUser.id.toString(),
			};

			if (content !== undefined) updateData.content = content;
			if (image !== undefined) updateData.image = image;

			const updatedReply = await ThreadReply.update(Number(id), updateData);

			res.status(200).json({
				success: true,
				message: "Reply updated successfully",
				data: updatedReply,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error updating reply",
				error: (error as Error).message,
			});
		}
	}

	// Delete a reply
	async deleteReply(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const authUser = (req as any).user;

			// Fetch the raw reply from database to get thread_id and check ownership
			const reply = await prisma.reply.findUnique({
				where: { id: Number(id) },
			});

			if (!reply) {
				return res.status(404).json({
					success: false,
					message: "Reply not found",
				});
			}

			// Check if the reply was created by the current user
			if (reply.userId !== authUser.id) {
				return res.status(403).json({
					success: false,
					message: "You can only delete your own replies",
				});
			}

			// Get thread_id before deleting
			const threadId = reply.threadId;

			await ThreadReply.delete(Number(id));

			// Decrement thread reply count
			if (threadId > 0) {
				await prisma.thread.update({
					where: { id: threadId },
					data: {
						number_of_replies: {
							decrement: 1,
						},
					},
				});
			}

			res.status(200).json({
				success: true,
				message: "Reply deleted successfully",
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Error deleting reply",
				error: (error as Error).message,
			});
		}
	}

	async toggleLike(req: Request, res: Response) {
		try {
			const replyId = Number(req.params.replyId);
			const authUser = (req as any).user;

			if (!authUser) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const userId = authUser.id;

			// cek apakah user sudah like reply
			const existLike = await prisma.like.findFirst({
				where: {
					replyId,
					userId,
				},
			});

			// Kalau SUDAH LIKE → UNLIKE
			if (existLike) {
				await prisma.like.delete({
					where: { id: existLike.id },
				});

				return res.status(200).json({
					success: true,
					liked: false,
					message: "Unliked",
				});
			}

			// Kalau BELUM LIKE → CREATE LIKE
			await prisma.like.create({
				data: {
					replyId,
					userId,
					createdBy: String(userId),
					updatedBy: String(userId),
				},
			});

			return res.status(200).json({
				success: true,
				liked: true,
				message: "Liked",
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

export default new ReplyController();
