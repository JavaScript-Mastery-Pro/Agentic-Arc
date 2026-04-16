-- CreateTable
CREATE TABLE "ProjectCollaborator" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "collaboratorEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectCollaborator_collaboratorEmail_idx" ON "ProjectCollaborator"("collaboratorEmail");

-- CreateIndex
CREATE INDEX "ProjectCollaborator_projectId_createdAt_idx" ON "ProjectCollaborator"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCollaborator_projectId_collaboratorEmail_key" ON "ProjectCollaborator"("projectId", "collaboratorEmail");

-- AddForeignKey
ALTER TABLE "ProjectCollaborator" ADD CONSTRAINT "ProjectCollaborator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
