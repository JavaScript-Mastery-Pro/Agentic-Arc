"use client";

import { Check, Copy, Loader2, Users, X } from "lucide-react";
import Image from "next/image";
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
  displayName: string | null;
  avatarUrl: string | null;
  clerkUserId: string | null;
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
  const [removingCollaboratorId, setRemovingCollaboratorId] = useState<
    string | null
  >(null);
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

  async function handleRemoveCollaborator(collaboratorId: string) {
    if (!canManageSharing || removingCollaboratorId) return;

    setRemovingCollaboratorId(collaboratorId);
    setShareError(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(roomId)}/collaborators`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collaboratorId }),
        },
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setShareError(data.error ?? "Failed to remove collaborator.");
        return;
      }

      setCollaborators((currentCollaborators) =>
        currentCollaborators.filter(
          (collaborator) => collaborator.id !== collaboratorId,
        ),
      );
    } catch {
      setShareError("Failed to remove collaborator.");
    } finally {
      setRemovingCollaboratorId(null);
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
            <Users className="h-4 w-4 text-brand" />
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
            <div className="rounded-xl border border-surface-border bg-base/70 px-3 py-2 text-xs text-copy-muted">
              Only the project creator can invite collaborators.
            </div>
          )}

          {shareError ? (
            <div className="rounded-xl border border-danger-border bg-danger px-3 py-2 text-xs text-danger-foreground">
              {shareError}
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-copy-faint">
              Invited collaborators
            </p>

            <div className="max-h-44 overflow-y-auto rounded-xl border border-surface-border bg-base/60 p-2">
              {isLoadingCollaborators ? (
                <div className="flex items-center gap-2 px-2 py-3 text-xs text-copy-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading invites...
                </div>
              ) : collaborators.length ? (
                <div className="space-y-1.5">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-surface-border bg-elevated/60 px-3 py-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <CollaboratorAvatar collaborator={collaborator} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-copy-primary">
                            {collaborator.displayName ??
                              collaborator.collaboratorEmail}
                          </p>
                          {collaborator.displayName ? (
                            <p className="truncate text-xs text-copy-faint">
                              {collaborator.collaboratorEmail}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {canManageSharing ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemoveCollaborator(collaborator.id)
                          }
                          disabled={removingCollaboratorId === collaborator.id}
                          className="h-8 w-8 shrink-0 rounded-full text-copy-faint hover:bg-danger hover:text-danger-foreground"
                          aria-label={`Remove ${collaborator.collaboratorEmail}`}>
                          {removingCollaboratorId === collaborator.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-2 py-3 text-xs text-copy-faint">
                  No invited collaborators yet.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-brand/20 bg-brand-dim px-3 py-2">
            <p className="truncate pr-3 text-xs text-brand">{`/editor/${roomId}`}</p>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleCopyLink}>
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

function CollaboratorAvatar({
  collaborator,
}: {
  collaborator: CollaboratorRecord;
}) {
  const label = collaborator.displayName ?? collaborator.collaboratorEmail;
  const initials = getCollaboratorInitials(label);

  if (collaborator.avatarUrl) {
    return (
      <Image
        src={collaborator.avatarUrl}
        alt={label}
        width={36}
        height={36}
        unoptimized
        className="h-9 w-9 shrink-0 rounded-full border border-surface-border bg-elevated object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-border bg-elevated text-[11px] font-semibold text-copy-primary"
      aria-label={label}
      title={label}>
      {initials}
    </div>
  );
}

function getCollaboratorInitials(label: string) {
  const [namePart] = label.split("@");
  const initials = namePart
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "U";
}
