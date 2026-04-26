"use client";

import { Download } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface StoredSpec {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface SpecPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  spec: StoredSpec | null;
  roomId: string;
}

export function SpecPreviewDialog({
  isOpen,
  onOpenChange,
  spec,
  roomId,
}: SpecPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(94vw,80rem)] max-w-5xl gap-0 overflow-hidden border-surface-border bg-elevated p-0">
        <DialogHeader className="flex-row items-center justify-between border-b border-surface-border px-6 py-4 pr-16">
          <DialogTitle className="text-lg text-copy-primary">
            {spec?.title ?? "Spec"}
          </DialogTitle>

          {spec && !spec.id.startsWith("local-") && (
            <a
              href={`/api/projects/${roomId}/specs/${spec.id}/download`}
              download>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg">
                <Download className="h-4 w-4" />
                Download .md
              </Button>
            </a>
          )}
        </DialogHeader>

        <ScrollArea className="h-[70vh] px-6 py-5">
          {spec ? (
            <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
              <ReactMarkdown>{spec.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-copy-faint">
              No spec selected.
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
