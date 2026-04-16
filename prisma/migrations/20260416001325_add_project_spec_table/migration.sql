/*
  Warnings:

  - You are about to drop the column `specMarkdown` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "specMarkdown";

-- CreateTable
CREATE TABLE "ProjectSpec" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectSpec_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectSpec_projectId_idx" ON "ProjectSpec"("projectId");

-- CreateIndex
CREATE INDEX "ProjectSpec_createdAt_idx" ON "ProjectSpec"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "ProjectSpec" ADD CONSTRAINT "ProjectSpec_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
