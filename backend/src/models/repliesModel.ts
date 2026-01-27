import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateReplyThread {
  content: string;
  image: string;
  userId: number;
  threadId: number;
  created_by: string;
  updated_by: string;
}

export interface UpdateReplyThread {
  content?: string;
  image?: string;
  updated_by: string;
  updated_at?: Date;
}

class ThreadReply {
  // Create a new reply
  async create(data: CreateReplyThread) {
  return await prisma.reply.create({
    data: {
      content: data.content,
      image: data.image,
      userId: data.userId,
      threadId: data.threadId,
      created_by: data.created_by,
      updated_by: data.updated_by,
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
}

  //  get all rep & user info dari spesifik thread id 
  async findByThreadId(threadId: number) {
    const replies = await prisma.reply.findMany({
      where: {
        threadId: threadId,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    // get user info masing2 di reply
    const repliesWithUser = await Promise.all(
      replies.map(async (reply) => {
        const user = await prisma.user.findUnique({
          where: { id: reply.userId },
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
          },
        });

        return {
          id: reply.id,
          content: reply.content,
          image: reply.image,
          created_at: reply.created_at,
          user: user || null,
        };
      })
    );

    return repliesWithUser;
  }

  // get all replies & user info di semua thread
  async findAll() {
    const replies = await prisma.reply.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    // Get user info for each reply
    const repliesWithUser = await Promise.all(
      replies.map(async (reply) => {
        const user = await prisma.user.findUnique({
          where: { id: reply.userId },
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
          },
        });

        return {
          id: reply.id,
          content: reply.content,
          image: reply.image,
          created_at: reply.created_at,
          user: user || null,
        };
      })
    );

    return repliesWithUser;
  }

  // Update a reply
  async update(id: number, data: UpdateReplyThread) {
    const updateData: any = {
      updated_by: data.updated_by,
      updated_at: new Date(),
    };

    if (data.content !== undefined) {
      updateData.content = data.content;
    }

    if (data.image !== undefined) {
      updateData.image = data.image;
    }

    return await prisma.reply.update({
      where: { id },
      data: updateData,
    });
  }

  // Delete a reply
  async delete(id: number) {
    return await prisma.reply.delete({
      where: { id },
    });
  }

}

export default new ThreadReply();
