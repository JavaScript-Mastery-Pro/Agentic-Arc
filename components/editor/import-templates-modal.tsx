"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { CanvasNode } from "@/types/canvas";

import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/lib/import-templates";

// ── Mini diagram preview ──────────────────────────────────────────

const PREVIEW_W = 280;
const PREVIEW_H = 170;
const PREVIEW_PADDING = 10;

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  if (template.nodes.length === 0) return null;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const n of template.nodes) {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + (n.width ?? 200));
    maxY = Math.max(maxY, n.position.y + (n.height ?? 80));
  }

  const contentW = maxX - minX || 1;
  const contentH = maxY - minY || 1;
  const usableW = PREVIEW_W - PREVIEW_PADDING * 2;
  const usableH = PREVIEW_H - PREVIEW_PADDING * 2;
  const scale = Math.min(usableW / contentW, usableH / contentH);

  // Center the scaled content inside the preview
  const scaledW = contentW * scale;
  const scaledH = contentH * scale;
  const offsetX = PREVIEW_PADDING + (usableW - scaledW) / 2;
  const offsetY = PREVIEW_PADDING + (usableH - scaledH) / 2;

  function px(x: number) {
    return offsetX + (x - minX) * scale;
  }
  function py(y: number) {
    return offsetY + (y - minY) * scale;
  }
  function sw(node: CanvasNode) {
    return (node.width ?? 200) * scale;
  }
  function sh(node: CanvasNode) {
    return (node.height ?? 80) * scale;
  }

  const nodeMap = new Map(template.nodes.map((n) => [n.id, n]));
  const markerId = `arrow-${template.id}`;

  return (
    <svg
      viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`}
      width="100%"
      style={{ aspectRatio: `${PREVIEW_W} / ${PREVIEW_H}` }}
      className="block"
      aria-label={`Preview of ${template.name}`}>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(226,232,240,0.35)" />
        </marker>
      </defs>

      {/* Edges – rendered beneath nodes */}
      {template.edges.map((edge) => {
        const src = nodeMap.get(edge.source);
        const tgt = nodeMap.get(edge.target);
        if (!src || !tgt) return null;

        const sx = px(src.position.x + (src.width ?? 200) / 2);
        const sy = py(src.position.y + (src.height ?? 80) / 2);
        const tx = px(tgt.position.x + (tgt.width ?? 200) / 2);
        const ty = py(tgt.position.y + (tgt.height ?? 80) / 2);

        return (
          <line
            key={edge.id}
            x1={sx}
            y1={sy}
            x2={tx}
            y2={ty}
            stroke="rgba(226,232,240,0.28)"
            strokeWidth={1}
            markerEnd={`url(#${markerId})`}
          />
        );
      })}

      {/* Nodes – rendered on top of edges */}
      {template.nodes.map((n) => {
        const x = px(n.position.x);
        const y = py(n.position.y);
        const w = sw(n);
        const h = sh(n);
        const cx = x + w / 2;
        const cy = y + h / 2;
        const color = n.data.color;
        const shape = n.data.shape ?? "rectangle";

        if (shape === "diamond") {
          return (
            <polygon
              key={n.id}
              points={`${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`}
              fill={color}
              opacity={0.88}
            />
          );
        }

        if (shape === "hexagon") {
          const pts = [
            `${x + w * 0.25},${y}`,
            `${x + w * 0.75},${y}`,
            `${x + w},${cy}`,
            `${x + w * 0.75},${y + h}`,
            `${x + w * 0.25},${y + h}`,
            `${x},${cy}`,
          ].join(" ");
          return (
            <polygon key={n.id} points={pts} fill={color} opacity={0.88} />
          );
        }

        if (shape === "circle" || shape === "pill") {
          return (
            <rect
              key={n.id}
              x={x}
              y={y}
              width={w}
              height={h}
              rx={h / 2}
              fill={color}
              opacity={0.88}
            />
          );
        }

        // rectangle / cylinder – both render as a rounded rect in preview
        return (
          <rect
            key={n.id}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={2}
            fill={color}
            opacity={0.88}
          />
        );
      })}
    </svg>
  );
}

// ── Template card ─────────────────────────────────────────────────

interface TemplateCardProps {
  template: CanvasTemplate;
  onImport: (template: CanvasTemplate) => void;
}

function TemplateCard({ template, onImport }: TemplateCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl border-surface-border bg-base transition-colors hover:border-surface-border-strong">
      {/* Preview area */}
      <div className="bg-base p-3">
        <TemplatePreview template={template} />
      </div>

      {/* Info + action */}
      <CardHeader className="flex-1 border-t border-surface-border bg-elevated/60 px-4 pt-3 pb-2">
        <CardTitle className="text-sm">{template.name}</CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="border-surface-border bg-elevated/60 px-4 pb-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => onImport(template)}>
          <Download className="h-3.5 w-3.5" />
          Import
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Public modal component ────────────────────────────────────────

interface ImportTemplatesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

export function ImportTemplatesModal({
  isOpen,
  onOpenChange,
  onImport,
}: ImportTemplatesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Use inline style to reliably override the baked-in w-[min(92vw,32rem)] */}
      <DialogContent
        style={{ width: "min(95vw, 860px)", maxWidth: "none" }}
        className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Template</DialogTitle>
          <DialogDescription>
            Choose a starter template to pre-populate your canvas. Any existing
            nodes will be replaced — use{" "}
            <kbd className="rounded border border-surface-border-strong bg-elevated px-1 py-0.5 text-[11px] text-copy-secondary">
              ⌘Z
            </kbd>{" "}
            to undo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 pt-1">
          {CANVAS_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onImport={(t) => {
                onImport(t);
                onOpenChange(false);
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
