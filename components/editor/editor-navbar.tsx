"use client";

import {
  Link2,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────

export type SaveStatus = "idle" | "saving" | "saved";

interface EditorNavbarProps {
  roomId: string;
  saveStatus: SaveStatus;
  isSidebarOpen: boolean;
  isAiChatOpen: boolean;
  onToggleSidebar: () => void;
  onSave: () => void;
  onOpenImport: () => void;
  onOpenShare: () => void;
  onToggleAiChat: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────

function formatRoomName(roomId: string): string {
  return roomId
    .split("-")
    .filter(Boolean)
    .map((seg) => seg[0]?.toUpperCase() + seg.slice(1))
    .join(" ");
}

function SaveButtonLabel({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </>
    );
  }
  return (
    <>
      <Save className="h-3.5 w-3.5" />
      {status === "saved" ? "Saved" : "Save"}
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────

export function EditorNavbar({
  roomId,
  saveStatus,
  isSidebarOpen,
  isAiChatOpen,
  onToggleSidebar,
  onSave,
  onOpenImport,
  onOpenShare,
  onToggleAiChat,
}: EditorNavbarProps) {
  return (
    <header className="relative flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4">
      {/* Left – sidebar toggle */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={onToggleSidebar}
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
      </div>

      {/* Centre – room name */}
      <p className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-zinc-100">
        {formatRoomName(roomId)}
      </p>

      {/* Right – actions */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={saveStatus === "saving"}
          className="rounded-lg">
          <SaveButtonLabel status={saveStatus} />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenImport}
          className="rounded-lg">
          <Upload className="h-3.5 w-3.5" />
          Import
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onOpenShare}
          className="rounded-lg">
          <Link2 className="h-3.5 w-3.5" />
          Share
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onToggleAiChat}
          className={cn(
            "rounded-lg",
            isAiChatOpen && "bg-indigo-600 hover:bg-indigo-500",
          )}>
          <Sparkles className="h-3.5 w-3.5" />
          AI
        </Button>
      </div>
    </header>
  );
}
