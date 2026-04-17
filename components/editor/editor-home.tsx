"use client";

import { Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

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

function slugifyProjectName(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "untitled-project";
}

interface EditorHomeProps {
  myProjects: EditorProject[];
  sharedProjects: EditorProject[];
}

export function EditorHome({ myProjects, sharedProjects }: EditorHomeProps) {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateProject() {
    const roomId = slugifyProjectName(projectName);
    const name = projectName.trim();

    if (!name) return;

    setIsCreating(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, roomId }),
      });

      if (!response.ok) {
        console.error("Failed to create project", await response.text());
        return;
      }

      setIsCreateDialogOpen(false);
      setProjectName("");
      setIsSidebarOpen(false);

      startTransition(() => {
        router.push(`/editor/${encodeURIComponent(roomId)}`);
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="relative h-screen overflow-hidden bg-zinc-950 text-zinc-100">
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
              /editor/{slugifyProjectName(projectName || "untitled project")}
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

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreateProject={() => setIsCreateDialogOpen(true)}
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
