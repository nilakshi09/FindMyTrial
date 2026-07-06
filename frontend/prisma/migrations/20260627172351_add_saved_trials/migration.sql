-- CreateTable
CREATE TABLE "UserSavedTrial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nctId" TEXT NOT NULL,
    "trialData" JSONB NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "UserSavedTrial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSavedTrial_userId_nctId_key" ON "UserSavedTrial"("userId", "nctId");

-- AddForeignKey
ALTER TABLE "UserSavedTrial" ADD CONSTRAINT "UserSavedTrial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
