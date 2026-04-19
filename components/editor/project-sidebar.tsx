"use client";

import { FolderKanban, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface EditorProject {
  id: string;
  name: string;
}

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: () => void;
  onRenameProject?: (id: string, currentName: string) => void;
  onDeleteProject?: (id: string, name: string) => void;
  roomId?: string;
  myProjects: EditorProject[];
  sharedProjects: EditorProject[];
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  roomId,
  myProjects,
  sharedProjects,
}: ProjectSidebarProps) {
  const renderProjectList = (
    projects: EditorProject[],
    emptyLabel: string,
    owned = false,
  ) => {
    if (!projects.length) {
      return (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 px-3 py-4 text-xs text-zinc-500">
          {emptyLabel}
        </div>
      );
    }

    return projects.map((project) => {
      const isActive = roomId === project.id;

      return (
        <Link
          key={project.id}
          href={`/editor/${encodeURIComponent(project.id)}`}
          className={cn(
            "group block rounded-xl border px-3 py-3 text-sm transition",
            isActive
              ? "border-cyan-400/50 bg-cyan-500/10 text-zinc-50"
              : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100",
          )}>
          <div className="flex items-start gap-1">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{project.name}</p>
              <p className="truncate text-xs text-zinc-500">
                /editor/{project.id}
              </p>
            </div>
            {owned && (onRenameProject || onDeleteProject) && (
              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                {onRenameProject && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRenameProject(project.id, project.name);
                    }}
                    aria-label="Rename project"
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                {onDeleteProject && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteProject(project.id, project.name);
                    }}
                    aria-label="Delete project"
                    className="rounded p-1 text-zinc-400 hover:bg-red-500/20 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </Link>
      );
    });
  };

  return (
    <aside
      className={cn(
        "absolute left-4 top-4 bottom-4 z-40 flex w-[min(20rem,calc(100vw-2rem))] flex-col rounded-2xl border border-zinc-800 bg-zinc-950/94 p-4 shadow-2xl shadow-black/40 backdrop-blur transition-all duration-300",
        isOpen
          ? "translate-x-0 opacity-100"
          : "pointer-events-none -translate-x-[calc(100%+1.5rem)] opacity-0",
      )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
            <FolderKanban className="h-3.5 w-3.5" />
            Projects
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Create a project or jump into an existing room.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close project sidebar"
          className="h-9 w-9 border border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:text-zinc-100">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Button
        type="button"
        className="mt-4 w-full justify-start"
        onClick={onCreateProject}>
        <Plus className="h-4 w-4" />
        Create project
      </Button>

      <Tabs defaultValue="my" className="mt-4 flex min-h-0 flex-1 flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="mt-3 flex min-h-0 flex-1 flex-col">
          <ScrollArea className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/40 p-2">
            <div className="space-y-2 pr-1">
              {renderProjectList(
                myProjects,
                "You have not created any projects yet.",
                true,
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="shared"
          className="mt-3 flex min-h-0 flex-1 flex-col">
          <ScrollArea className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/40 p-2">
            <div className="space-y-2 pr-1">
              {renderProjectList(
                sharedProjects,
                "No shared projects yet. Ask a teammate to invite your email.",
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
