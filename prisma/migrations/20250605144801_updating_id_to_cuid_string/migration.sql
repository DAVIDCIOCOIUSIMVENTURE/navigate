/*
  Warnings:

  - The primary key for the `ProblemTrigger` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProblemTriggersBucket` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SelfDiscoveryQuestion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SelfDiscoveryQuestionCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - The primary key for the `_ProblemTriggerToProblemTriggersBucket` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemTrigger" DROP CONSTRAINT "ProblemTrigger_selfDiscoveryQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "SelfDiscoveryQuestion" DROP CONSTRAINT "SelfDiscoveryQuestion_selfDiscoveryQuestionCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ProblemTriggerToProblemTriggersBucket" DROP CONSTRAINT "_ProblemTriggerToProblemTriggersBucket_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProblemTriggerToProblemTriggersBucket" DROP CONSTRAINT "_ProblemTriggerToProblemTriggersBucket_B_fkey";

-- AlterTable
ALTER TABLE "ProblemTrigger" DROP CONSTRAINT "ProblemTrigger_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "selfDiscoveryQuestionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProblemTrigger_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProblemTrigger_id_seq";

-- AlterTable
ALTER TABLE "ProblemTriggersBucket" DROP CONSTRAINT "ProblemTriggersBucket_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProblemTriggersBucket_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProblemTriggersBucket_id_seq";

-- AlterTable
ALTER TABLE "SelfDiscoveryQuestion" DROP CONSTRAINT "SelfDiscoveryQuestion_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "selfDiscoveryQuestionCategoryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "SelfDiscoveryQuestion_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SelfDiscoveryQuestion_id_seq";

-- AlterTable
ALTER TABLE "SelfDiscoveryQuestionCategory" DROP CONSTRAINT "SelfDiscoveryQuestionCategory_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SelfDiscoveryQuestionCategory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SelfDiscoveryQuestionCategory_id_seq";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "password",
DROP COLUMN "role";

-- AlterTable
ALTER TABLE "_ProblemTriggerToProblemTriggersBucket" DROP CONSTRAINT "_ProblemTriggerToProblemTriggersBucket_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_ProblemTriggerToProblemTriggersBucket_AB_pkey" PRIMARY KEY ("A", "B");

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Session";

-- AddForeignKey
ALTER TABLE "SelfDiscoveryQuestion" ADD CONSTRAINT "SelfDiscoveryQuestion_selfDiscoveryQuestionCategoryId_fkey" FOREIGN KEY ("selfDiscoveryQuestionCategoryId") REFERENCES "SelfDiscoveryQuestionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTrigger" ADD CONSTRAINT "ProblemTrigger_selfDiscoveryQuestionId_fkey" FOREIGN KEY ("selfDiscoveryQuestionId") REFERENCES "SelfDiscoveryQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemTriggerToProblemTriggersBucket" ADD CONSTRAINT "_ProblemTriggerToProblemTriggersBucket_A_fkey" FOREIGN KEY ("A") REFERENCES "ProblemTrigger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemTriggerToProblemTriggersBucket" ADD CONSTRAINT "_ProblemTriggerToProblemTriggersBucket_B_fkey" FOREIGN KEY ("B") REFERENCES "ProblemTriggersBucket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
