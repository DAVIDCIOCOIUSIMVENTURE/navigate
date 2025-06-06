-- CreateTable
CREATE TABLE "ProblemTrigger" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "selfDiscoveryQuestionId" INTEGER,

    CONSTRAINT "ProblemTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemTriggersBucket" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProblemTriggersBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProblemTriggerToProblemTriggersBucket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProblemTriggerToProblemTriggersBucket_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProblemTriggerToProblemTriggersBucket_B_index" ON "_ProblemTriggerToProblemTriggersBucket"("B");

-- AddForeignKey
ALTER TABLE "ProblemTrigger" ADD CONSTRAINT "ProblemTrigger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTrigger" ADD CONSTRAINT "ProblemTrigger_selfDiscoveryQuestionId_fkey" FOREIGN KEY ("selfDiscoveryQuestionId") REFERENCES "SelfDiscoveryQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTriggersBucket" ADD CONSTRAINT "ProblemTriggersBucket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemTriggerToProblemTriggersBucket" ADD CONSTRAINT "_ProblemTriggerToProblemTriggersBucket_A_fkey" FOREIGN KEY ("A") REFERENCES "ProblemTrigger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemTriggerToProblemTriggersBucket" ADD CONSTRAINT "_ProblemTriggerToProblemTriggersBucket_B_fkey" FOREIGN KEY ("B") REFERENCES "ProblemTriggersBucket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
