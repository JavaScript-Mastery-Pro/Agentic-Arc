"use client";

import { Check, Copy, Loader2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CollaboratorRecord {
  id: string;
  collaboratorEmail: string;
  createdAt: string;
}

interface ShareDialogProps {
  roomId: string;
  canManageSharing: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({
  roomId,
  canManageSharing,
  isOpen,
  onOpenChange,
}: ShareDialogProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [collaborators, setCollaborators] = useState<CollaboratorRecord[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const loadCollaborators = useCallback(async () => {
    if (!canManageSharing) return;

    setIsLoadingCollaborators(true);
    setShareError(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(roomId)}/collaborators`,
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setShareError(data.error ?? "Failed to load collaborators.");
        setCollaborators([]);
        return;
      }

      const data = (await response.json()) as {
        collaborators: CollaboratorRecord[];
      };

      setCollaborators(data.collaborators);
    } catch {
      setShareError("Failed to load collaborators.");
      setCollaborators([]);
    } finally {
      setIsLoadingCollaborators(false);
    }
  }, [canManageSharing, roomId]);

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
    }
  }, [isOpen, loadCollaborators]);

  async function handleInviteCollaborator() {
    const email = inviteEmail.trim();

    if (!email || !canManageSharing) return;

    setIsInviting(true);
    setShareError(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(roomId)}/collaborators`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setShareError(data.error ?? "Failed to invite collaborator.");
        return;
      }

      setInviteEmail("");
      await loadCollaborators();
    } catch {
      setShareError("Failed to invite collaborator.");
    } finally {
      setIsInviting(false);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsLinkCopied(true);
      window.setTimeout(() => setIsLinkCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy room link", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-300" />
            Share project
          </DialogTitle>
          <DialogDescription>
            Invite collaborators by email and share the room link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {canManageSharing ? (
            <div className="flex items-center gap-2">
              <Input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="teammate@company.com"
                type="email"
              />
              <Button
                type="button"
                onClick={handleInviteCollaborator}
                disabled={!inviteEmail.trim() || isInviting}>
                {isInviting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  "Invite"
                )}
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-400">
              Only the project creator can invite collaborators.
            </div>
          )}

          {shareError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {shareError}
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Invited collaborators
            </p>

            <div className="max-h-44 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/60 p-2">
              {isLoadingCollaborators ? (
                <div className="flex items-center gap-2 px-2 py-3 text-xs text-zinc-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading invites...
                </div>
              ) : collaborators.length ? (
                <div className="space-y-1.5">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200">
                      {collaborator.collaboratorEmail}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-2 py-3 text-xs text-zinc-500">
                  No invited collaborators yet.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2">
            <p className="truncate pr-3 text-xs text-zinc-400">{`/editor/${roomId}`}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="rounded-lg">
              {isLinkCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy link
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
