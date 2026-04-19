"use client";

import { useEffect } from "react";

interface ZoomControls {
  zoomIn(options?: { duration?: number }): void;
  zoomOut(options?: { duration?: number }): void;
}

/**
 * Binds canvas keyboard shortcuts (zoom in/out, undo, redo).
 * Skips when focus is inside an editable element.
 */
export function useKeyboardShortcuts(
  flow: ZoomControls | null,
  undo: () => void,
  redo: () => void,
) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMeta = e.metaKey || e.ctrlKey;

      if (!isMeta && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        flow?.zoomIn({ duration: 150 });
        return;
      }

      if (!isMeta && e.key === "-") {
        e.preventDefault();
        flow?.zoomOut({ duration: 150 });
        return;
      }

      if (isMeta && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }

      if (
        (isMeta && e.shiftKey && e.key.toLowerCase() === "z") ||
        (isMeta && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flow, undo, redo]);
}
