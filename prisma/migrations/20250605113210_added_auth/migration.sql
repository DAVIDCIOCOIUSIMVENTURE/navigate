/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `ProblemTrigger` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProblemTriggersBucket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProblemTriggerToProblemTriggersBucket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProblemTrigger" DROP CONSTRAINT "ProblemTrigger_selfDiscoveryQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemTrigger" DROP CONSTRAINT "ProblemTrigger_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemTriggersBucket" DROP CONSTRAINT "ProblemTriggersBucket_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ProblemTriggerToProblemTriggersBucket" DROP CONSTRAINT "_ProblemTriggerToProblemTriggersBucket_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProblemTriggerToProblemTriggersBucket" DROP CONSTRAINT "_ProblemTriggerToProblemTriggersBucket_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "password" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "ProblemTrigger";

-- DropTable
DROP TABLE "ProblemTriggersBucket";

-- DropTable
DROP TABLE "_ProblemTriggerToProblemTriggersBucket";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
