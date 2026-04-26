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
  useRedo,
  useUndo,
} from "@liveblocks/react/suspense";
import {
  Background,
  ConnectionMode,
  MarkerType,
  MiniMap,
  ReactFlow,
  type ReactFlowInstance,
} from "@xyflow/react";
import {
  Circle,
  Database,
  Diamond,
  Hexagon,
  Loader2,
  Maximize2,
  Minus,
  Plus,
  RectangleHorizontal,
  Redo2,
  Undo2,
} from "lucide-react";
import {
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AiChatSidebar } from "@/components/editor/ai-chat-sidebar";
import {
  CanvasPresenceDock,
  CanvasPresenceDockFallback,
  EditorNavbar,
  EditorRoomActions,
  formatRoomName,
  type SaveStatus,
} from "@/components/editor/editor-navbar";
import { ImportTemplatesModal } from "@/components/editor/import-templates-modal";
import type { CanvasTemplate } from "@/lib/import-templates";
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
  DEFAULT_NODE_TEXT_COLOR,
  type CanvasEdge,
  type CanvasNode,
  type NodeShape,
} from "@/types/canvas";
import { CanvasNodeView } from "@/components/editor/nodes/CanvasNode";
import { CanvasEdgeView } from "@/components/editor/nodes/CanvasEdge";
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

interface CollaborationControls {
  isReady: boolean;
  saveStatus: SaveStatus;
  saveCanvas: () => void;
  importTemplate: (template: CanvasTemplate) => void;
  nodeCount: number;
  getCanvasSnapshot: () => { nodes: CanvasNode[]; edges: CanvasEdge[] };
}

const emptyCanvasSnapshot = { nodes: [], edges: [] };

function createPendingCollaborationControls(): CollaborationControls {
  return {
    isReady: false,
    saveStatus: "idle",
    saveCanvas: () => {},
    importTemplate: () => {},
    nodeCount: 0,
    getCanvasSnapshot: () => emptyCanvasSnapshot,
  };
}

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

interface DragPreviewState {
  shape: NodeShape;
  defaultWidth: number;
  defaultHeight: number;
  position: { x: number; y: number } | null;
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

// ── Floating node panel  ───────────────────────────────────────────
function NodePanel({
  onStartDragging,
  onStopDragging,
}: {
  onStartDragging: (item: ShapePanelItem) => void;
  onStopDragging: () => void;
}) {
  function handleDragStart(event: DragEvent, item: ShapePanelItem) {
    const payload = JSON.stringify({
      shape: item.shape,
      defaultWidth: item.defaultWidth,
      defaultHeight: item.defaultHeight,
    });

    event.dataTransfer.setData("application/reactflow", payload);
    event.dataTransfer.effectAllowed = "move";
    onStartDragging(item);
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
            onDragEnd={onStopDragging}
            title={item.label}
            className="flex h-10 w-10 cursor-grab items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 active:cursor-grabbing">
            <Icon className="h-5 w-5" />
          </div>
        );
      })}
    </div>
  );
}

function CanvasLoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-base text-sm text-copy-secondary">
      <div>Loading collaborative canvas...</div>
    </div>
  );
}

// Defined at module scope so React Flow never sees a new reference on re-render
const nodeTypes = {
  canvasNode: CanvasNodeView,
};

// Maps both new edges ("canvasEdge") and any existing "smoothstep" edges
// already persisted in Liveblocks storage to the same custom renderer.
const edgeTypes = {
  canvasEdge: CanvasEdgeView,
  smoothstep: CanvasEdgeView,
};

interface CollaborativeCanvasProps {
  roomId: string;
  isAiChatOpen: boolean;
  onCloseAiChat: () => void;
  onCollaborationChange: (controls: CollaborationControls) => void;
}

function CollaborativeCanvas({
  roomId,
  isAiChatOpen,
  onCloseAiChat,
  onCollaborationChange,
}: CollaborativeCanvasProps) {
  const [isNodeDragging, setIsNodeDragging] = useState(false);
  const [flow, setFlow] = useState<ReactFlowInstance<
    CanvasNode,
    CanvasEdge
  > | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreviewState | null>(null);
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
  const canvasSnapshotRef = useRef({ nodes: canvasNodes, edges: canvasEdges });
  canvasSnapshotRef.current = { nodes: canvasNodes, edges: canvasEdges };

  const getCanvasSnapshot = useCallback(() => canvasSnapshotRef.current, []);
  const handleNodeDragStart = useCallback(() => setIsNodeDragging(true), []);
  const handleNodeDragStop = useCallback(() => setIsNodeDragging(false), []);

  const renderedNodes = useMemo(() => {
    if (!dragPreview?.position) return canvasNodes;

    const previewNode: CanvasNode = {
      id: "__drag-preview__",
      type: "canvasNode",
      position: dragPreview.position,
      data: {
        label: "",
        color: DEFAULT_NODE_COLOR,
        textColor: DEFAULT_NODE_TEXT_COLOR,
        shape: dragPreview.shape,
        preview: true,
      },
      width: dragPreview.defaultWidth,
      height: dragPreview.defaultHeight,
      draggable: false,
      selectable: false,
      deletable: false,
      connectable: false,
      focusable: false,
    };

    return [...canvasNodes, previewNode];
  }, [canvasNodes, dragPreview]);

  const { saveStatus, saveCanvas } = useAutoSave(
    roomId,
    canvasNodes,
    canvasEdges,
    isNodeDragging,
  );
  useKeyboardShortcuts(flow, undo, redo);

  const handleDragOver = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";

      if (!flow || !dragPreview) return;

      const position = flow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setDragPreview((current) =>
        current
          ? {
              ...current,
              position: {
                x: position.x - current.defaultWidth / 2,
                y: position.y - current.defaultHeight / 2,
              },
            }
          : current,
      );
    },
    [dragPreview, flow],
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData("application/reactflow");
      if (!raw || !flow) {
        setDragPreview(null);
        return;
      }

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
          position: {
            x: position.x - defaultWidth / 2,
            y: position.y - defaultHeight / 2,
          },
          data: {
            label: "",
            color: DEFAULT_NODE_COLOR,
            textColor: DEFAULT_NODE_TEXT_COLOR,
            shape,
          },
          width: defaultWidth,
          height: defaultHeight,
        };

        flow.addNodes(newNode);
      } catch {
        // ignore malformed drag data
      } finally {
        setDragPreview(null);
      }
    },
    [flow],
  );

  const handleImport = useCallback(
    (template: CanvasTemplate) => {
      // onNodesChange "remove" is a no-op in Liveblocks — only onDelete actually
      // removes from storage. Clear everything first, then add the template nodes.
      onDelete({ nodes: canvasNodes, edges: canvasEdges });

      onNodesChange(
        template.nodes.map((n) => ({ type: "add" as const, item: n })),
      );
      onEdgesChange(
        template.edges.map((e) => ({ type: "add" as const, item: e })),
      );

      requestAnimationFrame(() => {
        flow?.fitView({ duration: 400, padding: 0.15 });
      });
    },
    [canvasEdges, canvasNodes, flow, onDelete, onEdgesChange, onNodesChange],
  );

  useEffect(() => {
    onCollaborationChange({
      isReady: true,
      saveStatus,
      saveCanvas,
      importTemplate: handleImport,
      nodeCount: canvasNodes.length,
      getCanvasSnapshot,
    });
  }, [
    canvasNodes.length,
    getCanvasSnapshot,
    handleImport,
    onCollaborationChange,
    saveCanvas,
    saveStatus,
  ]);

  useEffect(() => {
    return () => {
      onCollaborationChange(createPendingCollaborationControls());
    };
  }, [onCollaborationChange]);

  return (
    <>
      <AiChatSidebar
        roomId={roomId}
        isOpen={isAiChatOpen}
        onClose={onCloseAiChat}
        nodeCount={canvasNodes.length}
        getCanvasSnapshot={getCanvasSnapshot}
      />

      <ReactFlow<CanvasNode, CanvasEdge>
        // fitView
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        connectionMode={ConnectionMode.Loose}
        onInit={(instance) =>
          setFlow(instance as ReactFlowInstance<CanvasNode, CanvasEdge>)
        }
        nodes={renderedNodes}
        edges={canvasEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        onNodeDragStart={handleNodeDragStart}
        onNodeDragStop={handleNodeDragStop}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        panOnDrag={false}
        panActivationKeyCode="Space"
        onlyRenderVisibleElements
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
        className="bg-base [&_.react-flow__pane]:cursor-default [&_.react-flow__pane.draggable]:cursor-grab [&_.react-flow__pane.dragging]:!cursor-grabbing">
        <Background color="#2f2f35" gap={20} size={1.1} />
        <MiniMap
          pannable
          zoomable
          className="!rounded-lg !border !border-surface-border !bg-elevated"
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

      <NodePanel
        onStartDragging={(item) =>
          setDragPreview({
            shape: item.shape,
            defaultWidth: item.defaultWidth,
            defaultHeight: item.defaultHeight,
            position: null,
          })
        }
        onStopDragging={() => setDragPreview(null)}
      />

      <div className="absolute bottom-6 left-4 z-20 flex items-center rounded-lg border border-surface-border bg-elevated/90 shadow-lg shadow-black/30">
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
        <div className="my-1.5 w-px self-stretch bg-surface-border-strong" />

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
    </>
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [collaboration, setCollaboration] = useState<CollaborationControls>(
    createPendingCollaborationControls,
  );

  const closeAiChat = useCallback(() => setIsAiChatOpen(false), []);
  const updateCollaboration = useCallback((controls: CollaborationControls) => {
    setCollaboration(controls);
  }, []);

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

  return (
    <div className="relative h-screen overflow-hidden bg-base text-copy-primary">
      <ImportTemplatesModal
        isOpen={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onImport={collaboration.importTemplate}
      />

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
            <div className="rounded-xl border border-surface-border bg-base/80 px-3 py-2 text-sm text-copy-secondary">
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
              variant="danger"
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
        <EditorNavbar
          title={formatRoomName(roomId)}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
          accountControls={null}
          actions={
            <EditorRoomActions
              saveStatus={collaboration.saveStatus}
              isCanvasReady={collaboration.isReady}
              isAiChatOpen={isAiChatOpen}
              onSave={collaboration.saveCanvas}
              onOpenImport={() => setIsImportModalOpen(true)}
              onOpenShare={() => setIsShareDialogOpen(true)}
              onToggleAiChat={() => setIsAiChatOpen((v) => !v)}
            />
          }
        />

        <div className="relative min-h-0 flex-1 bg-base">
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
              className="absolute inset-0 z-30 bg-overlay lg:hidden"
            />
          ) : null}

          <ClientSideSuspense fallback={<CanvasPresenceDockFallback />}>
            <CanvasPresenceDock />
          </ClientSideSuspense>

          <ClientSideSuspense fallback={<CanvasLoadingFallback />}>
            <CollaborativeCanvas
              roomId={roomId}
              isAiChatOpen={isAiChatOpen}
              onCloseAiChat={closeAiChat}
              onCollaborationChange={updateCollaboration}
            />
          </ClientSideSuspense>
        </div>
      </div>
    </div>
  );
}

export function Editor(props: EditorProps) {
  return (
    <LiveblocksProvider throttle={16} authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={props.roomId} initialPresence={{ cursor: null }}>
        <EditorWorkspace {...props} />
      </RoomProvider>
    </LiveblocksProvider>
  );
}
