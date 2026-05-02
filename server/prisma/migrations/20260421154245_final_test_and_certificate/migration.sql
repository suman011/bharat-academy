-- AlterTable
ALTER TABLE "UserNotificationState" ALTER COLUMN "announcementsSeenAt" SET DEFAULT NOW();

-- CreateTable
CREATE TABLE "FinalTestAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseKey" TEXT NOT NULL,
    "scorePct" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinalTestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseCertificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseKey" TEXT NOT NULL,
    "certCode" TEXT NOT NULL,
    "attemptId" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinalTestAttempt_userId_idx" ON "FinalTestAttempt"("userId");

-- CreateIndex
CREATE INDEX "FinalTestAttempt_courseKey_idx" ON "FinalTestAttempt"("courseKey");

-- CreateIndex
CREATE INDEX "FinalTestAttempt_createdAt_idx" ON "FinalTestAttempt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCertificate_certCode_key" ON "CourseCertificate"("certCode");

-- CreateIndex
CREATE INDEX "CourseCertificate_userId_idx" ON "CourseCertificate"("userId");

-- CreateIndex
CREATE INDEX "CourseCertificate_courseKey_idx" ON "CourseCertificate"("courseKey");

-- CreateIndex
CREATE INDEX "CourseCertificate_issuedAt_idx" ON "CourseCertificate"("issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCertificate_userId_courseKey_key" ON "CourseCertificate"("userId", "courseKey");

-- AddForeignKey
ALTER TABLE "FinalTestAttempt" ADD CONSTRAINT "FinalTestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCertificate" ADD CONSTRAINT "CourseCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
