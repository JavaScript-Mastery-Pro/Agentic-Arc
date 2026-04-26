"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { useState } from "react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export function CanvasEdgeView({
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
  // Active = hovered or selected — both make the edge fully opaque
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
