"use client";

import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import { memo, useState } from "react";

import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_TEXT_COLOR,
  NODE_COLORS,
  type CanvasEdge,
  type CanvasNode,
  type NodeShape,
} from "@/types/canvas";
import { cn } from "@/lib/utils";

// ── Shape-specific wrapper styles ──────────────────────────────────
const simpleShapeClasses: Record<"rectangle" | "pill" | "circle", string> = {
  rectangle: "rounded-2xl",
  circle: "rounded-full",
  pill: "rounded-full",
};

// Connection handle shared style — white dot, visible on any node color
const handleClass =
  "!z-20 !h-3 !w-3 !rounded-full !border-2 !border-zinc-900 !bg-white !transition-opacity !duration-150 !opacity-0 group-hover/node:!opacity-100";

function getNodeTextColor(nodeColor: string, savedTextColor?: unknown) {
  if (typeof savedTextColor === "string") return savedTextColor;

  return (
    NODE_COLORS.find((color) => color.nodeColor === nodeColor)?.textColor ??
    DEFAULT_NODE_TEXT_COLOR
  );
}

export const CanvasNodeView = memo(function CanvasNodeView({
  id,
  data,
  selected,
  dragging,
}: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const isPreview = data.preview === true;
  const showSelectedControls = selected && !isPreview && !dragging;

  const hasText =
    typeof data.label === "string" && data.label.trim().length > 0;
  const nodeColor =
    typeof data.color === "string" ? data.color : DEFAULT_NODE_COLOR;
  const nodeTextColor = getNodeTextColor(nodeColor, data.textColor);
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
      {showSelectedControls ? (
        <NodeToolbar position={Position.Top} offset={14}>
          <div className="nodrag flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#111114]/95 p-2 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-md">
            {NODE_COLORS.map(({ nodeColor: color, textColor }) => {
              const isSelectedColor = nodeColor === color;
              const isHoveredColor = hoveredColor === color;
              const shouldGlow = isSelectedColor || isHoveredColor;

              return (
                <button
                  key={color}
                  type="button"
                  title={color}
                  onClick={() => updateNodeData(id, { color, textColor })}
                  onMouseEnter={() => setHoveredColor(color)}
                  onMouseLeave={() => setHoveredColor(null)}
                  className={cn(
                    "h-6 w-6 rounded-full border transition-all duration-100 hover:scale-110",
                    isSelectedColor
                      ? "scale-110"
                      : "border-white/15 hover:border-white/40",
                  )}
                  style={{
                    backgroundColor: color,
                    borderColor: shouldGlow ? textColor : undefined,
                    boxShadow: shouldGlow
                      ? `0 0 0 2px ${textColor}55, 0 0 18px ${textColor}33`
                      : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                  }}
                />
              );
            })}
          </div>
        </NodeToolbar>
      ) : null}

      {/* ── Resize handles (visible only when selected) ──────────────── */}
      {showSelectedControls ? (
        <NodeResizer
          minWidth={80}
          minHeight={80}
          color="#67e8f9"
          lineClassName="!border-white/30"
          handleClassName="!h-2.5 !w-2.5 !rounded !border !border-zinc-900 !bg-white"
        />
      ) : null}

      {/* ── Connection handles – all four sides ──────────────────────── */}
      {!isPreview ? (
        <>
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
        </>
      ) : null}

      {/* ── Node body – centered text, double-click to edit ──────────── */}
      <div
        className="relative z-10 flex w-full flex-col items-center justify-center px-5 py-3"
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!isEditing) setIsEditing(true);
        }}>
        <p
          aria-hidden={isEditing}
          className={cn(
            "w-full select-none break-words text-center text-sm font-semibold leading-snug",
            !hasText && "opacity-60",
            isEditing && "invisible",
          )}
          style={{ color: nodeTextColor }}>
          {hasText ? data.label : isPreview ? "Drop to add" : null}
        </p>

        {isEditing && !isPreview && (
          <textarea
            value={data.label}
            autoFocus
            onChange={(e) => updateNodeData(id, { label: e.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsEditing(false);
            }}
            className="nodrag nopan nowheel absolute inset-0 resize-none bg-transparent px-5 py-3 text-center text-sm leading-snug text-zinc-950 outline-none placeholder:text-zinc-800"
            style={{ color: nodeTextColor }}
            placeholder="Add text"
          />
        )}
      </div>
    </div>
  );
});
