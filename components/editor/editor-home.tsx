"use client";

import { Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";

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
    <div className="relative h-screen overflow-hidden bg-zinc-950 text-zinc-100">
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
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-400">
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
              className="border border-red-800 bg-red-950/40 text-red-400 hover:border-red-700 hover:bg-red-900/40 hover:text-red-300"
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
        <header className="relative flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4">
          <Button
            type="button"
            onClick={() => setIsSidebarOpen((current) => !current)}
            aria-label={
              isSidebarOpen ? "Hide project sidebar" : "Show project sidebar"
            }
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-lg">
            {isSidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>

          <p className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-zinc-100">
            Editor Home
          </p>

          <div className="w-9" />
        </header>

        <main className="relative min-h-0 flex-1 overflow-hidden">
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
              className="absolute inset-0 z-30 bg-zinc-950/35"
            />
          ) : null}

          <div className="absolute inset-0 bg-[linear-gradient(rgba(39,39,42,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(39,39,42,0.5)_1px,transparent_1px)] bg-[size:36px_36px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_42%),radial-gradient(circle_at_bottom,_rgba(99,102,241,0.08),_transparent_42%)]" />

          {/* <div className="relative z-10 flex h-full items-center justify-center px-6">
            <div className="max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/70 p-10 text-center shadow-2xl shadow-black/40 backdrop-blur">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
                Welcome to your architecture workspace
              </h1>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Select a project from the sidebar or create a new one to get
                started.
              </p>
            </div>
          </div> */}
        </main>
      </div>
    </div>
  );
}
