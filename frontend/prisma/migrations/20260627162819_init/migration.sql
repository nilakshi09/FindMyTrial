-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "location" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'weekly',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertResult" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "nctId" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedSummary" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_email_idx" ON "Alert"("email");

-- CreateIndex
CREATE INDEX "Alert_isActive_idx" ON "Alert"("isActive");

-- CreateIndex
CREATE INDEX "AlertResult_alertId_idx" ON "AlertResult"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "AlertResult_alertId_nctId_key" ON "AlertResult"("alertId", "nctId");

-- CreateIndex
CREATE UNIQUE INDEX "SharedSummary_shareId_key" ON "SharedSummary"("shareId");

-- CreateIndex
CREATE INDEX "SharedSummary_shareId_idx" ON "SharedSummary"("shareId");

-- CreateIndex
CREATE INDEX "SharedSummary_expiresAt_idx" ON "SharedSummary"("expiresAt");

-- AddForeignKey
ALTER TABLE "AlertResult" ADD CONSTRAINT "AlertResult_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;
