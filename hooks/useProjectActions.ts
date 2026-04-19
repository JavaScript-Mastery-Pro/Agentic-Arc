"use client";

import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

// Re-exported so consumers can use it in JSX without importing nanoid directly.
export function slugifyProjectName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "untitled-project";
}

interface UseProjectActionsOptions {
  /**
   * When set, the delete handler redirects to /editor instead of refreshing
   * if the deleted project matches this ID (the currently open workspace).
   */
  currentRoomId?: string;
  /**
   * Called after a project is successfully created (e.g. to close the sidebar).
   */
  onAfterCreate?: () => void;
}

export function useProjectActions(options?: UseProjectActionsOptions) {
  const router = useRouter();
  const { currentRoomId, onAfterCreate } = options ?? {};

  // ── Create ───────────────────────────────────────────────────────
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [roomSuffix, setRoomSuffix] = useState(() => nanoid(6));
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isCreateDialogOpen) {
      setRoomSuffix(nanoid(6));
      setProjectName("");
    }
  }, [isCreateDialogOpen]);

  async function handleCreateProject() {
    const slug = slugifyProjectName(projectName);
    const newRoomId = `${slug}-${roomSuffix}`;
    const name = projectName.trim();

    if (!name) return;

    setIsCreating(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, roomId: newRoomId }),
      });

      if (!response.ok) {
        console.error("Failed to create project", await response.text());
        return;
      }

      setIsCreateDialogOpen(false);
      setProjectName("");
      onAfterCreate?.();

      startTransition(() => {
        router.push(`/editor/${encodeURIComponent(newRoomId)}`);
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setIsCreating(false);
    }
  }

  // ── Rename ───────────────────────────────────────────────────────
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [renameName, setRenameName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    if (renameTarget) {
      setRenameName(renameTarget.name);
    }
  }, [renameTarget]);

  async function handleConfirmRename() {
    if (!renameTarget || !renameName.trim()) return;

    setIsRenaming(true);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(renameTarget.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: renameName.trim() }),
        },
      );

      if (!response.ok) {
        console.error("Failed to rename project", await response.text());
        return;
      }

      setRenameTarget(null);
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Failed to rename project", error);
    } finally {
      setIsRenaming(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        console.error("Failed to delete project", await response.text());
        return;
      }

      setDeleteTarget(null);

      if (currentRoomId && deleteTarget.id === currentRoomId) {
        startTransition(() => router.push("/editor"));
      } else {
        startTransition(() => router.refresh());
      }
    } catch (error) {
      console.error("Failed to delete project", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    // create
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    projectName,
    setProjectName,
    roomSuffix,
    isCreating,
    handleCreateProject,
    // rename
    renameTarget,
    setRenameTarget,
    renameName,
    setRenameName,
    isRenaming,
    handleConfirmRename,
    // delete
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    handleConfirmDelete,
  };
}
