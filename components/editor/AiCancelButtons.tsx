import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

export function DesignCancelButton({
  isCancelling,
  onCancel,
}: {
  isCancelling: boolean;
  onCancel: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      disabled={isCancelling}
      onClick={() => {
        if (!isCancelling) onCancel();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="h-9 w-9 shrink-0 rounded-lg relative group"
      aria-label={
        isCancelling ? "Cancelling..." : hovered ? "Cancel" : "Processing..."
      }>
      {isCancelling ? (
        <Loader2 className="h-4 w-4 animate-spin text-danger-foreground" />
      ) : hovered ? (
        <X className="h-4 w-4 text-danger-foreground transition" />
      ) : (
        <Loader2 className="h-4 w-4 animate-spin text-copy-muted transition" />
      )}
    </Button>
  );
}

export function SpecCancelButton({
  isCancelling,
  onCancel,
}: {
  isCancelling: boolean;
  onCancel: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isCancelling}
      onClick={() => {
        if (!isCancelling) onCancel();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-1 rounded-lg text-xs transition-colors"
      aria-label={
        isCancelling
          ? "Cancelling..."
          : hovered
            ? "Cancel"
            : "Generating spec..."
      }>
      {isCancelling ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-danger-foreground" />
          <span className="text-danger-foreground">Cancelling...</span>
        </>
      ) : hovered ? (
        <>
          <X className="h-3 w-3 text-danger-foreground" />
          <span className="text-danger-foreground">Cancel</span>
        </>
      ) : (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-copy-muted" />
          <span className="text-copy-muted">Generating spec...</span>
        </>
      )}
    </Button>
  );
}
