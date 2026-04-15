"use client";

import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useOthersMapped,
  useSelf,
} from "@liveblocks/react/suspense";
import {
  Background,
  ConnectionMode,
  Handle,
  MarkerType,
  MiniMap,
  NodeResizer,
  NodeToolbar,
  Position,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import {
  FolderKanban,
  Link2,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

import { EditorErrorBoundary } from "@/components/editor/error-boundary";
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
import { cn } from "@/lib/utils";

interface EditorProject {
  id: string;
  name: string;
}

interface EditorProps {
  roomId: string;
  projects: EditorProject[];
}

interface PresenceUserInfo {
  name: string;
  avatar: string;
  color: string;
}

interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: string;
}

type CanvasNode = Node<CanvasNodeData, "canvasNode">;
type CanvasEdge = Edge;

const defaultNodeColor = "#1e293b";
const defaultEdgeColor = "#e2e8f0";

// Vivid dark hues — clearly identifiable on a black canvas, readable with white text
const nodeColorPalette = [
  "#1e293b", // slate
  "#1e3a8a", // blue
  "#0369a1", // sky
  "#0f766e", // teal
  "#065f46", // emerald
  "#3730a3", // indigo
  "#5b21b6", // violet
  "#7e22ce", // purple
  "#9f1239", // rose
  "#9a3412", // orange
  "#713f12", // amber
  "#292524", // stone
];

const edgeStyle = {
  stroke: defaultEdgeColor,
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
};
const edgeMarker = {
  type: MarkerType.ArrowClosed,
  color: defaultEdgeColor,
  width: 14,
  height: 14,
};

const initialNodes: CanvasNode[] = [
  {
    id: "client",
    type: "canvasNode",
    data: { label: "Client App", color: "#0f172a" },
    position: { x: 120, y: 80 },
    width: 260,
    height: 120,
  },
  {
    id: "gateway",
    type: "canvasNode",
    data: { label: "API Gateway", color: "#1e293b" },
    position: { x: 430, y: 90 },
    width: 260,
    height: 120,
  },
  {
    id: "worker",
    type: "canvasNode",
    data: { label: "Worker Service", color: "#14532d" },
    position: { x: 760, y: 230 },
    width: 260,
    height: 120,
  },
  {
    id: "database",
    type: "canvasNode",
    data: { label: "Database", color: "#7c2d12" },
    position: { x: 430, y: 300 },
    width: 260,
    height: 120,
  },
];

const initialEdges: CanvasEdge[] = [
  {
    id: "client-gateway",
    source: "client",
    target: "gateway",
    type: "smoothstep",
    style: edgeStyle,
    markerEnd: edgeMarker,
  },
  {
    id: "gateway-worker",
    source: "gateway",
    target: "worker",
    type: "smoothstep",
    style: edgeStyle,
    markerEnd: edgeMarker,
  },
  {
    id: "gateway-database",
    source: "gateway",
    target: "database",
    type: "smoothstep",
    style: edgeStyle,
    markerEnd: edgeMarker,
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

function slugifyProjectName(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "untitled-project";
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

// Connection handle shared style — white dot, visible on any node color
const handleClass =
  "!h-3 !w-3 !rounded-full !border-2 !border-zinc-900 !bg-white !transition-opacity !duration-150 !opacity-0 group-hover/node:!opacity-100";

function CanvasNodeView({ id, data, selected }: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const [isEditing, setIsEditing] = useState(false);

  const hasText =
    typeof data.label === "string" && data.label.trim().length > 0;
  const nodeColor =
    typeof data.color === "string" ? data.color : defaultNodeColor;

  return (
    <div
      className={cn(
        // group/node lets handles fade in on any hover within the node
        "group/node relative flex h-full w-full min-h-[100px] min-w-[140px] items-center justify-center rounded-2xl border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-shadow duration-150",
        selected &&
          "border-white/50 shadow-[0_8px_32px_rgba(255,255,255,0.10)]",
      )}
      style={{ backgroundColor: nodeColor }}>
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
        minWidth={140}
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
        className="flex w-full flex-col items-center justify-center px-5 py-3"
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}>
        {isEditing ? (
          <textarea
            value={data.label}
            autoFocus
            rows={3}
            onChange={(e) => updateNodeData(id, { label: e.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsEditing(false);
            }}
            className="nodrag nopan nowheel w-full resize-none bg-transparent text-center text-sm font-medium text-zinc-100 outline-none placeholder:text-zinc-500"
            placeholder="Add text…"
          />
        ) : (
          <p
            className={cn(
              "w-full select-none break-words text-center text-sm font-semibold leading-snug",
              hasText ? "text-zinc-100" : "text-zinc-500",
            )}>
            {hasText ? data.label : "Add Text"}
          </p>
        )}
      </div>
    </div>
  );
}

function ProjectSidebar({
  isOpen,
  onClose,
  onCreateProject,
  roomId,
  projects,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: () => void;
  roomId: string;
  projects: EditorProject[];
}) {
  return (
    <aside
      className={cn(
        "absolute left-4 top-4 bottom-4 z-40 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-zinc-800 bg-zinc-950/94 p-4 shadow-2xl shadow-black/40 backdrop-blur transition-all duration-300",
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

      {/* <p className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200">
        {formatRoomName(roomId)}
      </p> */}

      <Button
        type="button"
        className="mt-4 w-full justify-start"
        onClick={onCreateProject}>
        <Plus className="h-4 w-4" />
        Create project
      </Button>

      <div className="mt-4 space-y-2 overflow-y-auto pr-1">
        {projects.map((project) => {
          const isActive = project.id === roomId;

          return (
            <Link
              key={project.id}
              href={`/editor/${encodeURIComponent(project.id)}`}
              className={cn(
                "block rounded-xl border px-3 py-3 text-sm transition",
                isActive
                  ? "border-cyan-400/50 bg-cyan-500/10 text-zinc-50"
                  : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100",
              )}>
              <p className="truncate font-medium">{project.name}</p>
              <p className="truncate text-xs text-zinc-500">
                /editor/{project.id}
              </p>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

function EditorWorkspace({ roomId, projects }: EditorProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [flow, setFlow] = useState<ReactFlowInstance<
    CanvasNode,
    CanvasEdge
  > | null>(null);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: initialNodes },
      edges: { initial: initialEdges },
    });

  const canvasNodes = nodes ?? [];
  const canvasEdges = edges ?? [];

  const nodeTypes = useMemo(
    () => ({
      canvasNode: CanvasNodeView,
    }),
    [],
  );

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy room link", error);
    }
  }

  function handleCreateProject() {
    const nextRoomId = slugifyProjectName(projectName);
    setIsCreateDialogOpen(false);
    setProjectName("");
    setIsSidebarOpen(false);

    startTransition(() => {
      router.push(`/editor/${encodeURIComponent(nextRoomId)}`);
    });
  }

  function handleResetView() {
    flow?.fitView({ duration: 300, padding: 0.2 });
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
              onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateProject}
              disabled={!projectName.trim()}>
              Create project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreateProject={() => setIsCreateDialogOpen(true)}
        roomId={roomId}
        projects={projects}
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
              onClick={handleResetView}
              className="rounded-lg">
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCopyLink}
              className="rounded-lg">
              <Link2 className="h-3.5 w-3.5" />
              {isCopied ? "Copied" : "Share"}
            </Button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 bg-zinc-950">
          <CanvasPresence />

          <ReactFlow<CanvasNode, CanvasEdge>
            fitView
            connectionMode={ConnectionMode.Loose}
            onInit={(instance) =>
              setFlow(instance as ReactFlowInstance<CanvasNode, CanvasEdge>)
            }
            nodes={canvasNodes}
            edges={canvasEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDelete={onDelete}
            defaultEdgeOptions={{
              type: "smoothstep",
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
                    : defaultNodeColor;

                return color;
              }}
            />
            <Cursors />
          </ReactFlow>

          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 p-1.5 shadow-lg shadow-black/30">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => flow?.zoomOut({ duration: 150 })}
              aria-label="Zoom out">
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => flow?.fitView({ duration: 200, padding: 0.2 })}
              aria-label="Fit view">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => flow?.zoomIn({ duration: 150 })}
              aria-label="Zoom in">
              <Plus className="h-4 w-4" />
            </Button>
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
