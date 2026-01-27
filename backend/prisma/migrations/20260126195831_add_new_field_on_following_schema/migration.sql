/*
  Warnings:

  - You are about to drop the column `follower_id` on the `Following` table. All the data in the column will be lost.
  - You are about to drop the column `following_id` on the `Following` table. All the data in the column will be lost.
  - Added the required column `followerId` to the `Following` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followingId` to the `Following` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Following" DROP COLUMN "follower_id",
DROP COLUMN "following_id",
ADD COLUMN     "followerId" INTEGER NOT NULL,
ADD COLUMN     "followingId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Following" ADD CONSTRAINT "Following_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Following" ADD CONSTRAINT "Following_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
