import express from "express";
import prisma from "../prisma/client";
import { Request, Response } from "express";

// follow others
export const follow = async (req: Request, res: Response) => {
	const { user } = req as any;
	const { targetUserId } = req.body;

	if (!targetUserId || user.id === targetUserId) {
		return res.status(400).json({ message: "Invalid target user" });
	}

	try {
		const existing = await prisma.following.findUnique({
			where: {
				followerId_followingId: {
					followerId: user.id,
					followingId: targetUserId,
				},
			},
		});

		if (existing) {
			return res.status(400).json({ message: "Already following" });
		}

		const followOthres = await prisma.following.create({
			data: {
				followerId: user.id,
				followingId: targetUserId,
			},
		});

		return res.json({ message: "Followed successfully", data: followOthres });
	} catch (error) {
		return res.status(500).json({ message: "Internal server error" });
	}
};

// unfollow user
export const unfollow = async (req: Request, res: Response) => {
	const { user } = req as any;
	const { targetUserId } = req.body;

	try {
		const unfollUser = await prisma.following.delete({
			where: {
				followerId_followingId: {
					followerId: user.id,
					followingId: targetUserId,
				},
			},
		});

		return res.json({
			message: "Unfollowed someone successfully",
			data: unfollUser,
		});
	} catch (error) {
		return res.status(500).json({ message: "Internal server error" });
	}
};

// list followers
export const followersList = async (req: Request, res: Response) => {
	const userId = Number(req.params.id);

	try {
		const followers = await prisma.following.findMany({
			where: { followingId: userId },
			select: {
				follower: {
					select: {
						id: true,
						username: true,
						full_name: true,
						photo_profile: true,
						bio: true,
					},
				},
			},
		});

		return res.json(followers.map((f) => f.follower));
	} catch {
		return res.status(500).json({ message: "Internal server error" });
	}
};

// list following (yang kita ikuti)
export const followingList = async (req: Request, res: Response) => {
	const userId = Number(req.params.id);

	try {
		const following = await prisma.following.findMany({
			where: { followerId: userId },
			select: {
				following: {
					select: {
						id: true,
						username: true,
						full_name: true,
						photo_profile: true,
						bio: true,
					},
				},
			},
		});

		return res.json(following.map((f) => f.following));
	} catch {
		return res.status(500).json({ message: "Internal server error" });
	}
};

// suggest user
export const suggestUser = async (req: Request, res: Response) => {
	const userId = Number(req.params.userId);

	try {
		const following = await prisma.following.findMany({
			where: { followerId: userId },
			select: { followingId: true },
		});

		const followingIds = following.map((f) => f.followingId);

		const users = await prisma.user.findMany({
			where: {
				AND: [{ id: { not: userId } }, { id: { notIn: followingIds } }],
			},
			select: {
				id: true,
				username: true,
				full_name: true,
				photo_profile: true,
				bio: true,
			},
			take: 5,
		});

		return res.json(users);
	} catch {
		return res.status(500).json({ message: "Internal server error" });
	}
};

// jumlah follower dan following
export const followStats = async (req: Request, res: Response) => {
	const userId = Number(req.params.id);

	try {
		const [followers, following] = await Promise.all([
			prisma.following.count({
				where: { followingId: userId },
			}),
			prisma.following.count({
				where: { followerId: userId },
			}),
		]);

		return res.json({
			followersCount: followers,
			followingCount: following,
		});
	} catch {
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const toggleFollow = async (req: Request, res: Response) => {
	// ambil data user
	try {
		const followerId = (req as any).user;
		const followingId = Number(req.params.followingId);

		if (!followingId) {
			return res.status(400).json({
				status: "error",
				message: "followingId is required",
			});
		}

		// mencegah follow ke diri sendiri
		if (followerId === followingId) {
			return res.status(400).json({
				status: "error",
				message: "You cannot follow yourself",
			});
		}

		// cek apakah sudah follow
		const existingFollow = await prisma.following.findFirst({
			where: {
				followerId,
				followingId,
			},
		});

		if (existingFollow) {
			await prisma.following.delete({
				where: {
					id: existingFollow.id,
				},
			});

			return res.status(200).json({
				status: "success",
				message: "Successfully unfollowed user",
				data: {
					user_id: followingId,
					isFollowed: false,
				},
			});
		}

		await prisma.following.create({
			data: {
				followerId,
				followingId,
			},
		});

		return res.status(201).json({
			status: "success",
			message: "Successfully followed user",
			data: {
				user_id: followingId,
				isFollowed: true,
			},
		});
	} catch (error) {
		return res.status(500).json({ message: `internal server error` });
	}
};

export const searchUser = async (req: Request, res: Response) => {
	try {
		const { q } = req.query;
		const authUser = (req as any).user;

		if (!q || typeof q !== "string" || q.trim().length < 1) {
			return res.status(400).json({ message: `search query is required` });
		}

		const query = q.trim();
		const users = await prisma.user.findMany({
			where: {
				AND: [
					{ id: { not: authUser.id } },
					{
						OR: [
							{
								username: {
									contains: query,
									mode: "insensitive",
								},
							},
							{
								full_name: {
									contains: query,
									mode: "insensitive",
								},
							},
						],
					},
				],
			},
			select: {
				id: true,
				username: true,
				full_name: true,
				photo_profile: true,
				bio: true
			},
			take: 3
		});
		return res.status(200).json({
			message: `success search user`,
			data: users
		})
	} catch (error: any) {
		console.error(`cannot search user`, error)
		return res.status(500).json({message: 'internal server error'})
	}
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = Number(id);

        if (isNaN(userId)) {
            return res.status(400).json({ 
                status: "error",
                message: "Invalid user ID" 
            });
        }

        const userData = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                full_name: true,
                photo_profile: true,
                bio: true,
            }
        });

        if (!userData) {
            return res.status(404).json({ 
                status: "error",
                message: "User not found" 
            });
        }

        return res.status(200).json({
            status: "success",
            message: "User profile found",
            user: userData
        });
    } catch (error: any) {
        return res.status(500).json({ 
            status: "error",
            message: "Internal server error",
            error: error.message 
        });
    }
};