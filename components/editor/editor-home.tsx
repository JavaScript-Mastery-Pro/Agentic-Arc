"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
// import { EditorWorkspaceBackground } from "@/components/editor/editor-workspace-background";
import {
  type EditorProject,
  ProjectSidebar,
} from "@/components/editor/project-sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  slugifyProjectName,
  useProjectActions,
} from "@/hooks/useProjectActions";

interface EditorHomeProps {
  myProjects: EditorProject[];
  sharedProjects: EditorProject[];
}

export function EditorHome({ myProjects, sharedProjects }: EditorHomeProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    projectName,
    setProjectName,
    roomSuffix,
    isCreating,
    handleCreateProject,
    renameTarget,
    setRenameTarget,
    renameName,
    setRenameName,
    isRenaming,
    handleConfirmRename,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    handleConfirmDelete,
  } = useProjectActions({ onAfterCreate: () => setIsSidebarOpen(false) });

  return (
    <div className="relative h-screen overflow-hidden bg-base text-copy-primary">
      {/* Create project dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              Enter a project name to create a new room.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              id="project-name"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Realtime architecture map"
              autoFocus
            />
            <div className="rounded-xl border border-surface-border bg-base/80 px-3 py-2 text-sm text-copy-muted">
              /editor/{slugifyProjectName(projectName || "untitled-project")}-
              {roomSuffix}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateProject}
              disabled={!projectName.trim() || isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename project dialog */}
      <Dialog
        open={!!renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Enter a new name for &quot;{renameTarget?.name}&quot;.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            placeholder="New project name"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleConfirmRename()}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameTarget(null)}
              disabled={isRenaming}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmRename}
              disabled={!renameName.trim() || isRenaming}>
              {isRenaming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete project dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="relative z-10 flex h-full min-w-0 flex-col">
        <EditorNavbar
          title="Editor Home"
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
        />

        <main className="relative min-h-0 flex-1 overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-base" />
            <div className="absolute inset-0 bg-[linear-gradient(var(--canvas-grid)_1px,transparent_1px),linear-gradient(90deg,var(--canvas-grid)_1px,transparent_1px)] bg-size-[20px_20px] opacity-70" />
          </div>

          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onCreateProject={() => setIsCreateDialogOpen(true)}
            onRenameProject={(id, name) => setRenameTarget({ id, name })}
            onDeleteProject={(id, name) => setDeleteTarget({ id, name })}
            myProjects={myProjects}
            sharedProjects={sharedProjects}
          />

          {isSidebarOpen ? (
            <button
              type="button"
              aria-label="Close project sidebar backdrop"
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 z-30 bg-base/35 lg:hidden"
            />
          ) : null}

          <div className="relative z-10 flex h-full items-center justify-center px-6">
            <div className="flex max-w-md flex-col items-center text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-copy-primary">
                Create a project or open an existing one
              </h1>
              <p className="mt-3 text-sm leading-6 text-copy-muted">
                Start a new architecture workspace, or choose a project from the
                sidebar.
              </p>
              <Button
                type="button"
                className="mt-6"
                onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                New project
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
