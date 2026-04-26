"use client";

import { UserButton } from "@clerk/nextjs";
import { useOthersMapped } from "@liveblocks/react/suspense";
import {
  Link2,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";
import { useSyncExternalStore, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

// Types

export type SaveStatus = "idle" | "saving" | "saved";

interface EditorNavbarProps {
  title: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  actions?: ReactNode;
  accountControls?: ReactNode;
}

interface EditorRoomNavbarProps {
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

interface EditorRoomActionsProps {
  saveStatus: SaveStatus;
  isAiChatOpen: boolean;
  onSave: () => void;
  onOpenImport: () => void;
  onOpenShare: () => void;
  onToggleAiChat: () => void;
  isCanvasReady?: boolean;
}

interface PresenceUserInfo {
  name: string;
  avatar: string;
  color: string;
}

const subscribeToMount = () => () => {};
const getClientMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;
const AVATAR_SIZE_CLASS = "h-8 w-8";
const accountMenuAppearance = {
  elements: {
    userButtonAvatarBox: {
      height: "32px",
      width: "32px",
    },
    userButtonBox: {
      height: "32px",
      width: "32px",
    },
    userButtonTrigger: {
      height: "32px",
      minHeight: "32px",
      padding: "0",
      width: "32px",
    },
  },
};

// Helpers

export function formatRoomName(roomId: string): string {
  const withoutSuffix = roomId.replace(/-[^-]{6}$/, "");
  return withoutSuffix
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

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase() ?? "")
      .join("") || "A"
  );
}

// Components

function AccountMenu() {
  const isMounted = useSyncExternalStore(
    subscribeToMount,
    getClientMountedSnapshot,
    getServerMountedSnapshot,
  );
  const fallback = (
    <div
      className={`${AVATAR_SIZE_CLASS} rounded-full border border-surface-border bg-elevated`}
    />
  );

  const menu = isMounted ? (
    <UserButton
      userProfileMode="modal"
      fallback={fallback}
      appearance={accountMenuAppearance}
    />
  ) : (
    fallback
  );

  return menu;
}

function CurrentUserControl({
  hasCollaborators = false,
}: {
  hasCollaborators?: boolean;
}) {
  if (!hasCollaborators) {
    return <AccountMenu />;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-px bg-surface-border-strong" aria-hidden="true" />
      <AccountMenu />
    </div>
  );
}

function CollaboratorAvatar({ user }: { user: PresenceUserInfo }) {
  const className = `${AVATAR_SIZE_CLASS} flex items-center justify-center rounded-full border border-surface-border-strong text-[10px] font-semibold text-copy-primary`;

  if (user.avatar) {
    return (
      <div
        title={user.name}
        aria-label={user.name}
        className={`${className} bg-elevated bg-cover bg-center`}
        style={{ backgroundImage: `url(${user.avatar})` }}
      />
    );
  }

  return (
    <div
      title={user.name}
      aria-label={user.name}
      className={className}
      style={{ backgroundColor: user.color }}>
      {getInitials(user.name)}
    </div>
  );
}

export function RoomAccountControls() {
  const others = useOthersMapped((other) => other.info);
  const collaborators = others.map(([connectionId, info]) => ({
    connectionId,
    info: info as PresenceUserInfo,
  }));
  const visibleCollaborators = collaborators.slice(0, 4);
  const overflowCount = collaborators.length - visibleCollaborators.length;

  return (
    <div className="flex items-center gap-3">
      {visibleCollaborators.length > 0 ? (
        <div
          className="flex -space-x-2"
          aria-label={`${collaborators.length} collaborator${
            collaborators.length === 1 ? "" : "s"
          } online`}>
          {visibleCollaborators.map((collaborator) => (
            <CollaboratorAvatar
              key={collaborator.connectionId}
              user={collaborator.info}
            />
          ))}
          {overflowCount > 0 ? (
            <div
              className={`${AVATAR_SIZE_CLASS} flex items-center justify-center rounded-full border border-surface-border-strong bg-elevated text-[10px] font-semibold text-copy-secondary`}>
              +{overflowCount}
            </div>
          ) : null}
        </div>
      ) : null}

      <CurrentUserControl hasCollaborators={visibleCollaborators.length > 0} />
    </div>
  );
}

export function CanvasPresenceDock() {
  const others = useOthersMapped((other) => other.info);
  const collaborators = others.map(([connectionId, info]) => ({
    connectionId,
    info: info as PresenceUserInfo,
  }));
  const visibleCollaborators = collaborators.slice(0, 5);
  const overflowCount = collaborators.length - visibleCollaborators.length;

  return (
    <div className="absolute right-5 top-5 z-20 flex items-center gap-3">
      {visibleCollaborators.length > 0 ? (
        <div
          className="flex -space-x-2"
          aria-label={`${collaborators.length} collaborator${
            collaborators.length === 1 ? "" : "s"
          } online`}>
          {visibleCollaborators.map((collaborator) => (
            <CollaboratorAvatar
              key={collaborator.connectionId}
              user={collaborator.info}
            />
          ))}
          {overflowCount > 0 ? (
            <div
              className={`${AVATAR_SIZE_CLASS} flex items-center justify-center rounded-full border border-surface-border-strong bg-base text-[10px] font-semibold text-copy-secondary`}>
              +{overflowCount}
            </div>
          ) : null}
        </div>
      ) : null}

      <CurrentUserControl hasCollaborators={visibleCollaborators.length > 0} />
    </div>
  );
}

export function CanvasPresenceDockFallback() {
  return (
    <div className="absolute right-5 top-5 z-20 flex items-center">
      <CurrentUserControl />
    </div>
  );
}

export function EditorNavbar({
  title,
  isSidebarOpen,
  onToggleSidebar,
  actions,
  accountControls = <AccountMenu />,
}: EditorNavbarProps) {
  const hasAccountControls =
    accountControls !== null && accountControls !== false;

  return (
    <header className="relative flex h-14 items-center justify-between border-b border-surface-border bg-base/95 px-4">
      {/* Left - workspace controls */}
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

      {/* Center - page or room title */}
      <p className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-copy-primary">
        {title}
      </p>

      {/* Right - route-specific actions */}
      <div className="flex min-w-9 items-center justify-end gap-3">
        {actions}
        {actions && hasAccountControls ? (
          <div className="h-6 w-px bg-surface-border" />
        ) : null}
        {hasAccountControls ? accountControls : null}
      </div>
    </header>
  );
}

export function EditorRoomActions({
  saveStatus,
  isAiChatOpen,
  onSave,
  onOpenImport,
  onOpenShare,
  onToggleAiChat,
  isCanvasReady = true,
}: EditorRoomActionsProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={!isCanvasReady || saveStatus === "saving"}
          className="rounded-lg">
          <SaveButtonLabel status={saveStatus} />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenImport}
          disabled={!isCanvasReady}
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
          variant={isAiChatOpen ? "accent" : "outline"}
          size="sm"
          onClick={onToggleAiChat}
          disabled={!isCanvasReady}
          className="rounded-lg bg-linear-to-r from-blue-600 to-fuchsia-500 text-copy-primary hover:from-fuchsia-500 hover:to-blue-600">
          <Sparkles className="h-3.5 w-3.5" />
          AI
        </Button>
      </div>
    </>
  );
}

export function EditorRoomNavbar({
  roomId,
  saveStatus,
  isSidebarOpen,
  isAiChatOpen,
  onToggleSidebar,
  onSave,
  onOpenImport,
  onOpenShare,
  onToggleAiChat,
}: EditorRoomNavbarProps) {
  return (
    <EditorNavbar
      title={formatRoomName(roomId)}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={onToggleSidebar}
      accountControls={<RoomAccountControls />}
      actions={
        <EditorRoomActions
          saveStatus={saveStatus}
          isAiChatOpen={isAiChatOpen}
          onSave={onSave}
          onOpenImport={onOpenImport}
          onOpenShare={onOpenShare}
          onToggleAiChat={onToggleAiChat}
        />
      }
    />
  );
}
