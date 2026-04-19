"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const AUTOSAVE_DELAY_MS = 3000;

export function useAutoSave(
  roomId: string,
  nodes: CanvasNode[],
  edges: CanvasEdge[],
) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveCanvas = useCallback(async () => {
    if (!nodes.length && !edges.length) return;

    setSaveStatus("saving");

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(roomId)}/canvas`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, edges }),
        },
      );

      if (response.ok) {
        setSaveStatus("saved");
        window.setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        console.error("Failed to save canvas", await response.text());
        setSaveStatus("idle");
      }
    } catch (error) {
      console.error("Failed to save canvas", error);
      setSaveStatus("idle");
    }
  }, [roomId, nodes, edges]);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveCanvas();
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [nodes, edges, saveCanvas]);

  return { saveStatus, saveCanvas };
}
