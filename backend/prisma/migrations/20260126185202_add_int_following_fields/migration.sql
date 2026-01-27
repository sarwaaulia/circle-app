/*
  Warnings:

  - You are about to drop the column `created_at` on the `Following` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Following" DROP COLUMN "created_at",
ADD COLUMN     "followerId" INTEGER,
ADD COLUMN     "following" INTEGER;
