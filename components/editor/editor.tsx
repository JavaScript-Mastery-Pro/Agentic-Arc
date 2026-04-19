"use client";

import {
  Cursors,
  useLiveblocksFlow,
  type CursorsCursorProps,
} from "@liveblocks/react-flow";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useCanRedo,
  useCanUndo,
  useOther,
  useOthersMapped,
  useRedo,
  useSelf,
  useUndo,
} from "@liveblocks/react/suspense";
import {
  Background,
  BaseEdge,
  ConnectionMode,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  MiniMap,
  NodeResizer,
  NodeToolbar,
  Position,
  ReactFlow,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import {
  Circle,
  Database,
  Diamond,
  Hexagon,
  Link2,
  Loader2,
  Maximize2,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RectangleHorizontal,
  Redo2,
  RefreshCw,
  Save,
  Sparkles,
  Undo2,
} from "lucide-react";
import { type DragEvent, useMemo, useRef, useState } from "react";

import { EditorErrorBoundary } from "@/components/editor/error-boundary";
import { AiChatSidebar } from "@/components/editor/ai-chat-sidebar";
import {
  ProjectSidebar,
  type EditorProject,
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
  DEFAULT_EDGE_COLOR,
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
  type CanvasEdge,
  type CanvasNode,
  type NodeShape,
} from "@/types/canvas";
import { cn } from "@/lib/utils";
import { ShareDialog } from "@/components/editor/ShareDialog";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  slugifyProjectName,
  useProjectActions,
} from "@/hooks/useProjectActions";

interface EditorProps {
  roomId: string;
  myProjects: EditorProject[];
  sharedProjects: EditorProject[];
  canManageSharing: boolean;
}

interface PresenceUserInfo {
  name: string;
  avatar: string;
  color: string;
}

// Vivid dark hues — clearly identifiable on a black canvas, readable with white text
const nodeColorPalette = NODE_COLORS;

const edgeStyle = {
  stroke: DEFAULT_EDGE_COLOR,
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
};
const edgeMarker = {
  type: MarkerType.ArrowClosed,
  color: DEFAULT_EDGE_COLOR,
  width: 14,
  height: 14,
};

// ── Shape panel items ──────────────────────────────────────────────
interface ShapePanelItem {
  shape: NodeShape;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultWidth: number;
  defaultHeight: number;
}

function PillIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="2" y="8" width="20" height="8" rx="4" />
    </svg>
  );
}

const shapePanelItems: ShapePanelItem[] = [
  {
    shape: "rectangle",
    label: "Rectangle",
    icon: RectangleHorizontal,
    defaultWidth: 260,
    defaultHeight: 120,
  },
  {
    shape: "diamond",
    label: "Diamond",
    icon: Diamond,
    defaultWidth: 200,
    defaultHeight: 200,
  },
  {
    shape: "circle",
    label: "Circle",
    icon: Circle,
    defaultWidth: 160,
    defaultHeight: 160,
  },
  {
    shape: "pill",
    label: "Pill",
    icon: PillIcon,
    defaultWidth: 260,
    defaultHeight: 80,
  },
  {
    shape: "cylinder",
    label: "Database",
    icon: Database,
    defaultWidth: 200,
    defaultHeight: 240,
  },
  {
    shape: "hexagon",
    label: "Service",
    icon: Hexagon,
    defaultWidth: 220,
    defaultHeight: 200,
  },
];

function formatRoomName(roomId: string) {
  return roomId
    .split("-")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");
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

function PresenceAvatar({ user }: { user: PresenceUserInfo }) {
  const className =
    "flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-semibold text-white ring-2 ring-zinc-950";

  if (user.avatar) {
    return (
      <div
        title={user.name}
        aria-label={user.name}
        className={`${className} bg-zinc-900 bg-cover bg-center`}
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

function CanvasPresence() {
  const self = useSelf((me) => me.info);
  const others = useOthersMapped((other) => other.info);

  const participants = [
    ...(self ? [self] : []),
    ...others.map(([, info]) => info),
  ] as PresenceUserInfo[];

  const visibleParticipants = participants.slice(0, 5);

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-20 flex -space-x-2">
      {visibleParticipants.map((participant, index) => (
        <PresenceAvatar
          key={`${participant.name}-${index}`}
          user={participant}
        />
      ))}
    </div>
  );
}

function CursorWithName({ connectionId }: CursorsCursorProps) {
  const info = useOther(connectionId, (user) => user.info);
  const thinking = useOther(connectionId, (user) => user.presence?.thinking);

  return (
    <>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0.583374 0.291748L19.4167 8.45841L10.2917 12.1251L6.62504 19.7084L0.583374 0.291748Z"
          fill={info.color}
        />
      </svg>
      <span
        className="absolute left-4 top-4 flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium text-white shadow-md"
        style={{ backgroundColor: info.color }}>
        {info.name}
        {thinking ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
      </span>
    </>
  );
}

// ── Shape-specific wrapper styles ──────────────────────────────────
const simpleShapeClasses: Record<"rectangle" | "pill" | "circle", string> = {
  rectangle: "rounded-2xl",
  circle: "rounded-full",
  pill: "rounded-full",
};

// Connection handle shared style — white dot, visible on any node color
const handleClass =
  "!z-20 !h-3 !w-3 !rounded-full !border-2 !border-zinc-900 !bg-white !transition-opacity !duration-150 !opacity-0 group-hover/node:!opacity-100";

function CanvasNodeView({ id, data, selected }: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const [isEditing, setIsEditing] = useState(false);

  const hasText =
    typeof data.label === "string" && data.label.trim().length > 0;
  const nodeColor =
    typeof data.color === "string" ? data.color : DEFAULT_NODE_COLOR;
  const nodeShape: NodeShape = data.shape ?? "rectangle";
  const isComplexShape =
    nodeShape === "diamond" ||
    nodeShape === "hexagon" ||
    nodeShape === "cylinder";
  const borderStroke = selected
    ? "rgba(255, 255, 255, 0.95)"
    : "rgba(255, 255, 255, 0.14)";
  const borderWidth = selected ? 0.7 : 0.6;

  function renderShapeBackground() {
    if (nodeShape === "diamond") {
      return (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
          aria-hidden="true">
          <polygon
            points="50,1.5 98.5,50 50,98.5 1.5,50"
            fill={nodeColor}
            stroke={borderStroke}
            strokeWidth={borderWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    }

    if (nodeShape === "hexagon") {
      return (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
          aria-hidden="true">
          <polygon
            points="25,1.5 75,1.5 98.5,50 75,98.5 25,98.5 1.5,50"
            fill={nodeColor}
            stroke={borderStroke}
            strokeWidth={borderWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    }

    if (nodeShape === "cylinder") {
      return (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
          aria-hidden="true">
          <path
            d="M10 16 C10 8, 90 8, 90 16 L90 84 C90 92, 10 92, 10 84 Z"
            fill={nodeColor}
            stroke={borderStroke}
            strokeWidth={borderWidth}
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx="50"
            cy="16"
            rx="40"
            ry="8"
            fill="none"
            stroke={borderStroke}
            strokeWidth={borderWidth}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M10 84 C10 92, 90 92, 90 84"
            fill="none"
            stroke={
              selected ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.24)"
            }
            strokeWidth={selected ? 1.6 : 1.2}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    }

    return null;
  }

  return (
    <div
      className={cn(
        // group/node lets handles fade in on any hover within the node
        "group/node relative flex h-full w-full min-h-[80px] min-w-[80px] items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-shadow duration-150",
        !isComplexShape && "border border-white/10",
        (nodeShape === "rectangle" ||
          nodeShape === "pill" ||
          nodeShape === "circle") &&
          simpleShapeClasses[nodeShape],
        selected &&
          "border-white/50 shadow-[0_8px_32px_rgba(255,255,255,0.10)]",
      )}
      style={{ backgroundColor: isComplexShape ? "transparent" : nodeColor }}>
      {renderShapeBackground()}

      {/* ── Color picker toolbar (visible only when selected) ─────────── */}
      <NodeToolbar isVisible={selected} position={Position.Top} offset={14}>
        <div className="nodrag flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-950 p-1.5 shadow-2xl">
          {nodeColorPalette.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => updateNodeData(id, { color })}
              className={cn(
                "h-6 w-6 rounded-lg border-2 transition-all duration-100 hover:scale-110",
                nodeColor === color
                  ? "scale-110 border-white/90"
                  : "border-transparent hover:border-zinc-500",
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </NodeToolbar>

      {/* ── Resize handles (visible only when selected) ──────────────── */}
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={80}
        color="#67e8f9"
        lineClassName="!border-white/30"
        handleClassName="!h-2.5 !w-2.5 !rounded !border !border-zinc-900 !bg-white"
      />

      {/* ── Connection handles – all four sides, source type + ConnectionMode.Loose ── */}
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className={handleClass}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className={handleClass}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className={handleClass}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className={handleClass}
      />

      {/* ── Node body – centered text, double-click to edit ──────────── */}
      <div
        className="relative z-10 flex w-full flex-col items-center justify-center px-5 py-3"
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!isEditing) setIsEditing(true);
        }}>
        {/*
         * The <p> is always in the DOM so the container never changes height
         * (preventing the vertical jump). It becomes invisible while editing
         * and the <textarea> is absolutely positioned on top of it.
         */}
        <p
          aria-hidden={isEditing}
          className={cn(
            "w-full select-none break-words text-center text-sm leading-snug",
            hasText ? "text-zinc-100" : "text-zinc-500",
            isEditing && "invisible",
          )}>
          {hasText && data.label}
        </p>

        {isEditing && (
          <textarea
            value={data.label}
            autoFocus
            onChange={(e) => updateNodeData(id, { label: e.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsEditing(false);
            }}
            // inset-0 + matching padding makes this overlay pixel-perfect
            className="nodrag nopan nowheel absolute inset-0 resize-none bg-transparent px-5 py-3 text-center text-sm leading-snug text-zinc-100 outline-none placeholder:text-zinc-500"
            placeholder="Add text"
          />
        )}
      </div>
    </div>
  );
}

// ── Custom edge – selection highlight + editable midpoint label ─────
function CanvasEdgeView({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
  selected,
  markerEnd,
  style,
}: EdgeProps) {
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const label = typeof data?.label === "string" ? data.label : "";
  // Active = hovered or selected — both make the edge fully opaque white
  const isActive = selected || isHovered;
  const strokeColor = isActive ? "#e2e8f0" : "rgba(226, 232, 240, 0.42)";
  const strokeWidth = isActive ? 2.2 : 1.8;

  function handleLabelDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    setDraft(label);
    setIsEditing(true);
  }

  function commitLabel() {
    updateEdgeData(id, { label: draft.trim() });
    setIsEditing(false);
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ ...style, stroke: strokeColor, strokeWidth }}
        markerEnd={markerEnd}
        interactionWidth={20}
      />

      {/* Thick transparent overlay — hover highlight + double-click to edit label */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={handleLabelDoubleClick}
      />

      <EdgeLabelRenderer>
        <div
          className="pointer-events-auto absolute nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}>
          {isEditing ? (
            <input
              value={draft}
              autoFocus
              // size grows with content so long labels stay fully visible while typing
              size={Math.max(10, draft.length + 2)}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  e.preventDefault();
                  commitLabel();
                }
              }}
              className="nodrag nopan nowheel rounded-md bg-zinc-900 px-2 py-0.5 text-center text-xs text-zinc-100 shadow-lg outline-none ring-1 ring-zinc-500 placeholder:text-zinc-500"
              placeholder="Add label"
            />
          ) : label ? (
            <span
              className="cursor-default rounded-md border border-zinc-700/60 bg-zinc-900/90 px-2 py-0.5 text-[11px] text-zinc-300 shadow backdrop-blur-sm"
              onDoubleClick={handleLabelDoubleClick}>
              {label}
            </span>
          ) : isActive ? (
            <span
              className="cursor-default rounded px-1.5 py-0.5 text-[10px] text-zinc-500"
              onDoubleClick={handleLabelDoubleClick}>
              Double-click to label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

// ── Floating node panel  ───────────────────────────────────────────
function NodePanel() {
  function handleDragStart(event: DragEvent, item: ShapePanelItem) {
    const payload = JSON.stringify({
      shape: item.shape,
      defaultWidth: item.defaultWidth,
      defaultHeight: item.defaultHeight,
    });

    event.dataTransfer.setData("application/reactflow", payload);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/90 p-1.5 shadow-lg shadow-black/30 backdrop-blur">
      {shapePanelItems.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.shape}
            draggable
            onDragStart={(event) => handleDragStart(event, item)}
            title={item.label}
            className="flex h-10 w-10 cursor-grab items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 active:cursor-grabbing">
            <Icon className="h-5 w-5" />
          </div>
        );
      })}
    </div>
  );
}

function EditorWorkspace({
  roomId,
  myProjects,
  sharedProjects,
  canManageSharing,
}: EditorProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

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
  } = useProjectActions({
    currentRoomId: roomId,
    onAfterCreate: () => setIsSidebarOpen(false),
  });

  const [flow, setFlow] = useState<ReactFlowInstance<
    CanvasNode,
    CanvasEdge
  > | null>(null);
  const nodeIdCounter = useRef(0);

  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const canvasNodes = useMemo(() => nodes ?? [], [nodes]);
  const canvasEdges = useMemo(() => edges ?? [], [edges]);

  const nodeTypes = useMemo(
    () => ({
      canvasNode: CanvasNodeView,
    }),
    [],
  );

  // Maps both new edges ("canvasEdge") and any existing "smoothstep" edges
  // already persisted in Liveblocks storage to the same custom renderer.
  const edgeTypes = useMemo(
    () => ({
      canvasEdge: CanvasEdgeView,
      smoothstep: CanvasEdgeView,
    }),
    [],
  );

  const { saveStatus, saveCanvas } = useAutoSave(
    roomId,
    canvasNodes,
    canvasEdges,
  );
  useKeyboardShortcuts(flow, undo, redo);

  function handleResetView() {
    flow?.fitView({ duration: 300, padding: 0.2 });
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();

    const raw = event.dataTransfer.getData("application/reactflow");
    if (!raw || !flow) return;

    try {
      const { shape, defaultWidth, defaultHeight } = JSON.parse(raw) as {
        shape: NodeShape;
        defaultWidth: number;
        defaultHeight: number;
      };

      const position = flow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      nodeIdCounter.current += 1;
      const newNode: CanvasNode = {
        id: `${shape}-${Date.now()}-${nodeIdCounter.current}`,
        type: "canvasNode",
        position,
        data: { label: "", color: DEFAULT_NODE_COLOR, shape },
        width: defaultWidth,
        height: defaultHeight,
      };

      flow.addNodes(newNode);
    } catch {
      // ignore malformed drag data
    }
  }

  return (
    <div className="relative h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <ShareDialog
        roomId={roomId}
        canManageSharing={canManageSharing}
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />

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
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating…
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
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
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
              className="border border-red-800 shadow-none bg-red-950/40 text-red-400 hover:border-red-700 hover:bg-red-900/40 hover:text-red-300"
              onClick={handleConfirmDelete}
              disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
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
          <div className="flex items-center gap-2">
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
          </div>

          <p className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-zinc-100">
            {formatRoomName(roomId)}
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={saveCanvas}
              disabled={saveStatus === "saving"}
              className="rounded-lg">
              {saveStatus === "saving" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saveStatus === "saved"
                ? "Saved"
                : saveStatus === "saving"
                  ? "Saving…"
                  : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetView}
              className="rounded-lg">
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsShareDialogOpen(true)}
              className="rounded-lg">
              <Link2 className="h-3.5 w-3.5" />
              Share
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsAiChatOpen((v) => !v)}
              className={cn(
                "rounded-lg",
                isAiChatOpen && "bg-indigo-600 hover:bg-indigo-500",
              )}>
              <Sparkles className="h-3.5 w-3.5" />
              AI
            </Button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 bg-zinc-950">
          <CanvasPresence />

          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onCreateProject={() => setIsCreateDialogOpen(true)}
            onRenameProject={(id, name) => setRenameTarget({ id, name })}
            onDeleteProject={(id, name) => setDeleteTarget({ id, name })}
            roomId={roomId}
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

          <AiChatSidebar
            roomId={roomId}
            isOpen={isAiChatOpen}
            onClose={() => setIsAiChatOpen(false)}
            nodes={canvasNodes}
            edges={canvasEdges}
          />

          <ReactFlow<CanvasNode, CanvasEdge>
            // fitView
            defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
            connectionMode={ConnectionMode.Loose}
            onInit={(instance) =>
              setFlow(instance as ReactFlowInstance<CanvasNode, CanvasEdge>)
            }
            nodes={canvasNodes}
            edges={canvasEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDelete={onDelete}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            defaultEdgeOptions={{
              type: "canvasEdge",
              style: edgeStyle,
              markerEnd: edgeMarker,
            }}
            connectionLineStyle={{
              stroke: "#e2e8f0",
              strokeWidth: 1.8,
              strokeDasharray: "5 4",
            }}
            className="bg-zinc-950">
            <Background color="#2f2f35" gap={20} size={1.1} />
            <MiniMap
              pannable
              zoomable
              className="!rounded-lg !border !border-zinc-800 !bg-zinc-900"
              nodeColor={(node) => {
                const color =
                  typeof node.data?.color === "string"
                    ? node.data.color
                    : DEFAULT_NODE_COLOR;

                return color;
              }}
            />
            <Cursors components={{ Cursor: CursorWithName }} />
          </ReactFlow>

          <NodePanel />

          <div className="absolute bottom-16 left-4 z-20 flex items-center rounded-lg border border-zinc-800 bg-zinc-900/90 shadow-lg shadow-black/30">
            {/* Zoom controls */}
            <div className="flex items-center gap-0.5 p-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => flow?.zoomOut({ duration: 150 })}
                aria-label="Zoom out (-)">
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => flow?.fitView({ duration: 200, padding: 0.15 })}
                aria-label="Fit view">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => flow?.zoomIn({ duration: 150 })}
                aria-label="Zoom in (+)">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Divider */}
            <div className="my-1.5 w-px self-stretch bg-zinc-700" />

            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5 p-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md disabled:opacity-30"
                onClick={undo}
                disabled={!canUndo}
                aria-label="Undo (⌘Z)">
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md disabled:opacity-30"
                onClick={redo}
                disabled={!canRedo}
                aria-label="Redo (⌘⇧Z)">
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Editor(props: EditorProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={props.roomId} initialPresence={{ cursor: null }}>
        <EditorErrorBoundary
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
              <div className="max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center">
                <h1 className="text-2xl font-semibold text-zinc-50">
                  Realtime editor is not ready yet.
                </h1>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Check the Liveblocks server configuration, especially the auth
                  endpoint and LIVEBLOCKS_SECRET_KEY.
                </p>
              </div>
            </div>
          }>
          <ClientSideSuspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-400">
                Loading collaborative canvas...
              </div>
            }>
            <EditorWorkspace {...props} />
          </ClientSideSuspense>
        </EditorErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
