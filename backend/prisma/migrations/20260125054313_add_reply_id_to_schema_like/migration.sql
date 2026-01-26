-- DropIndex
DROP INDEX "Like_userId_threadId_key";

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "replyId" INTEGER,
ALTER COLUMN "threadId" DROP NOT NULL;
