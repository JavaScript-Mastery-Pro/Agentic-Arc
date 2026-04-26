"use client";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useFeedMessages, useCreateFeedMessage } from "@liveblocks/react";

import {
  Bot,
  Download,
  Eye,
  FileText,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DesignCancelButton, SpecCancelButton } from "./AiCancelButtons";
import { SpecPreviewDialog, type StoredSpec } from "./SpecPreviewDialog";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

import type { designAgent } from "@/trigger/design-agent";
import type { generateSpecGemini } from "@/trigger/generate-spec";
import {
  aiFeedMessageDataSchema,
  chatFeedMessageDataSchema,
  specTaskMetadataSchema,
  specTaskOutputSchema,
  tokenResponseSchema,
  triggerResponseSchema,
} from "@/types/tasks";

const COMPOSER_MIN_HEIGHT = 72;
const COMPOSER_MAX_HEIGHT = 160;

interface AiChatSidebarProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  nodeCount: number;
  getCanvasSnapshot: () => { nodes: CanvasNode[]; edges: CanvasEdge[] };
}

function formatGeneratedTime(isoTime: string) {
  return new Date(isoTime).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getSnippet(markdown: string) {
  const compact = markdown
    .replace(/[\n\r\t]+/g, " ")
    .replace(/[#*_`>-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return compact.length > 60 ? `${compact.slice(0, 60)}...` : compact;
}

function getDownloadUrl(roomId: string, specId: string) {
  return `/api/projects/${roomId}/specs/${specId}/download`;
}

function DesignRunTracker({
  runId,
  accessToken,
  onComplete,
}: {
  runId: string;
  accessToken: string;
  onComplete: (succeeded: boolean) => void;
}) {
  const { run, error } = useRealtimeRun<typeof designAgent>(runId, {
    accessToken,
  });

  const completed = useRef(false);

  useEffect(() => {
    if (
      !completed.current &&
      run &&
      (run.status === "COMPLETED" || run.status === "FAILED")
    ) {
      completed.current = true;
      onComplete(run.status === "COMPLETED");
    }
  }, [run, onComplete]);

  if (error) {
    return (
      <div className="rounded-xl border border-danger-border bg-danger px-3 py-2 text-xs text-danger-foreground">
        Failed to track AI progress.
      </div>
    );
  }

  // UI is handled by AiStatusFeed; this component only manages lifecycle
  return null;
}

function SpecRunTracker({
  runId,
  accessToken,
  onComplete,
}: {
  runId: string;
  accessToken: string;
  onComplete: (result: { specContent: string; specId: string } | null) => void;
}) {
  const { run, error } = useRealtimeRun<typeof generateSpecGemini>(runId, {
    accessToken,
  });

  const completed = useRef(false);

  useEffect(() => {
    if (
      !completed.current &&
      run &&
      (run.status === "COMPLETED" || run.status === "FAILED")
    ) {
      completed.current = true;
      if (run.status === "COMPLETED" && run.output) {
        const parsed = specTaskOutputSchema.safeParse(run.output);
        if (parsed.success) {
          const { specContent, specId } = parsed.data;
          onComplete(specContent && specId ? { specContent, specId } : null);
        } else {
          onComplete(null);
        }
      } else {
        onComplete(null);
      }
    }
  }, [run, onComplete]);

  if (error) {
    return (
      <div className="rounded-xl border border-danger-border bg-danger px-3 py-2 text-xs text-danger-foreground">
        Failed to track spec generation.
      </div>
    );
  }

  const metadata = specTaskMetadataSchema.safeParse(run?.metadata ?? {});
  const progress = metadata.success ? metadata.data.progress : undefined;
  const status = metadata.success ? metadata.data.status : undefined;

  return (
    <div className="space-y-2 rounded-xl border border-surface-border bg-elevated px-3 py-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-copy-secondary">{status ?? "Connecting..."}</span>
        <Loader2 className="h-3 w-3 animate-spin text-accent-text" />
      </div>

      {typeof progress === "number" && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Renders AI agent status messages from the Liveblocks "ai-status-feed" feed.
// Always mounted so all room users receive realtime updates, not just the triggering user.
// Renders as a compact status strip between chat and input — hidden when idle.
function AiStatusFeed() {
  const { messages, isLoading } = useFeedMessages("ai-status-feed");

  if (isLoading || !messages || messages.length === 0) return null;

  // Show only the latest status message
  const latest = [...messages].at(-1);
  if (!latest) return null;
  const parsedFeed = aiFeedMessageDataSchema.safeParse(latest.data);
  const d = parsedFeed.success ? parsedFeed.data : {};

  return (
    <div className="flex items-center gap-2 rounded-lg border border-accent-border bg-[#0F2E18] px-3 py-2">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-text opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#62C073]" />
      </span>
      <p className="truncate font-mono text-xs text-[#62C073]">
        {d?.text ?? ""}
      </p>
    </div>
  );
}

export const AiChatSidebar = memo(function AiChatSidebar({
  roomId,
  isOpen,
  onClose,
  nodeCount,
  getCanvasSnapshot,
}: AiChatSidebarProps) {
  // Liveblocks collaborative chat feed — persisted & realtime for all room users
  const { messages: feedMessages, isLoading: feedLoading } =
    useFeedMessages("ai-chat");
  const createFeedMessage = useCreateFeedMessage();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [designRunId, setDesignRunId] = useState<string | null>(null);
  const [designAccessToken, setDesignAccessToken] = useState<string | null>(
    null,
  );
  const [isCancellingDesign, setIsCancellingDesign] = useState(false);

  const [specRunId, setSpecRunId] = useState<string | null>(null);
  const [specAccessToken, setSpecAccessToken] = useState<string | null>(null);
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [isCancellingSpec, setIsCancellingSpec] = useState(false);
  const [specs, setSpecs] = useState<StoredSpec[]>([]);
  const [activeSpecId, setActiveSpecId] = useState<string | null>(null);
  const [isSpecDialogOpen, setIsSpecDialogOpen] = useState(false);

  const activeSpec = useMemo(
    () => specs.find((spec) => spec.id === activeSpecId) ?? null,
    [activeSpecId, specs],
  );

  const starterPrompts: Record<string, string> = {
    "Design an e-commerce backend":
      "Design a high-scale e-commerce backend architecture. Include an API Gateway, a User Service with Auth, a Product Catalog service using a NoSQL database, and an Order Processing system that communicates via a Message Queue. Don't forget to add a Redis cache for the catalog to handle high traffic.",
    "Create a chat app architecture":
      "Architect a real-time chat application. I need a WebSocket server for live messaging, a presence service to track online users, and a relational database for message history. Connect the services using a Pub/Sub system like Redis so it can scale horizontally, and include an S3 bucket for media attachments.",
    "Build a CI/CD pipeline":
      "Create a robust CI/CD pipeline for a microservices project. Start with a GitHub Webhook leading to a Build Server. Include separate stages for Unit Testing, Security Scanning, and Containerization (Docker). Finally, connect the flow to a Kubernetes cluster for deployment with a dedicated monitoring stack like Prometheus.",
  };

  // Load persisted specs from the server on mount
  useEffect(() => {
    let cancelled = false;

    async function loadSpecs() {
      try {
        const res = await fetch(`/api/projects/${roomId}/spec`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { specs: StoredSpec[] };
        if (!cancelled) setSpecs(data.specs);
      } catch {
        // silently ignore — specs will be empty until one is generated
      }
    }

    void loadSpecs();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  // Auto-resize textarea as content grows
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    if (!input) {
      el.style.height = "";
      return;
    }

    el.style.height = "auto";
    el.style.height = `${Math.min(
      Math.max(el.scrollHeight, COMPOSER_MIN_HEIGHT),
      COMPOSER_MAX_HEIGHT,
    )}px`;
  }, [input]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  // Scroll when new feed messages arrive
  useEffect(() => {
    if (feedMessages && feedMessages.length > 0) scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedMessages?.length]); // intentionally not including feedMessages to avoid stale-ref issues

  const handleDesignComplete = useCallback(
    (succeeded: boolean) => {
      setDesignRunId(null);
      setDesignAccessToken(null);
      setIsLoading(false);

      // Push the AI reply into the shared chat feed so all users see it
      void createFeedMessage("ai-chat", {
        role: "assistant",
        content: succeeded
          ? "Done! I've updated the canvas based on your request."
          : "Something went wrong. Please try again.",
      });
      scrollToBottom();
    },
    [createFeedMessage],
  );

  const handleCancelDesign = useCallback(async () => {
    if (!designRunId) return;
    setIsCancellingDesign(true);
    try {
      await fetch("/api/ai/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: designRunId }),
      });
    } catch {
      // best-effort
    }
    setDesignRunId(null);
    setDesignAccessToken(null);
    setIsLoading(false);
    setIsCancellingDesign(false);
    void createFeedMessage("ai-chat", {
      role: "assistant",
      content: "Design generation was cancelled.",
    });
    scrollToBottom();
  }, [designRunId, createFeedMessage]);

  const handleCancelSpec = useCallback(async () => {
    if (!specRunId) return;
    setIsCancellingSpec(true);
    try {
      await fetch("/api/ai/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: specRunId }),
      });
    } catch {
      // best-effort
    }
    setSpecRunId(null);
    setSpecAccessToken(null);
    setIsGeneratingSpec(false);
    setIsCancellingSpec(false);
  }, [specRunId]);

  const handleSpecComplete = useCallback(
    async (result: { specContent: string; specId: string } | null) => {
      setSpecRunId(null);
      setSpecAccessToken(null);
      setIsGeneratingSpec(false);

      if (!result) return;

      const { specContent, specId } = result;
      const generatedAt = new Date().toISOString();

      // The task already persisted the spec server-side; use the returned specId.
      const newSpec: StoredSpec = {
        id: specId,
        title: `Spec v${specs.length + 1}`,
        content: specContent,
        createdAt: generatedAt,
      };

      setSpecs((prev) => [newSpec, ...prev]);
      setActiveSpecId(newSpec.id);
      setIsSpecDialogOpen(true);
    },
    [specs.length],
  );

  async function handleGenerateSpec() {
    if (isGeneratingSpec) return;
    setIsGeneratingSpec(true);
    const { nodes, edges } = getCanvasSnapshot();

    const chatHistory = (feedMessages ?? []).map((m) => {
      const parsed = chatFeedMessageDataSchema.safeParse(m.data);
      const d = parsed.success
        ? parsed.data
        : { role: "user" as const, content: "" };
      return { role: d.role, content: d.content };
    });

    try {
      const triggerRes = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          projectId: roomId,
          chatHistory,
          nodes,
          edges,
        }),
      });

      if (!triggerRes.ok) {
        setIsGeneratingSpec(false);
        return;
      }

      const triggerSpecRes = await triggerRes.json();
      const specRunParsed = triggerResponseSchema.safeParse(triggerSpecRes);
      if (!specRunParsed.success) {
        setIsGeneratingSpec(false);
        return;
      }
      const { runId } = specRunParsed.data;

      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });

      if (!tokenRes.ok) {
        setIsGeneratingSpec(false);
        return;
      }

      const tokenSpecParsed = tokenResponseSchema.safeParse(
        await tokenRes.json(),
      );
      if (!tokenSpecParsed.success) {
        setIsGeneratingSpec(false);
        return;
      }
      const { publicToken } = tokenSpecParsed.data;

      setSpecRunId(runId);
      setSpecAccessToken(publicToken);
    } catch {
      setIsGeneratingSpec(false);
    }
  }

  function handleOpenSpec(spec: StoredSpec) {
    setActiveSpecId(spec.id);
    setIsSpecDialogOpen(true);
  }

  async function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();

    const prompt = input.trim();
    if (!prompt || isLoading) return;

    // Push the user message into the shared collaborative feed
    void createFeedMessage("ai-chat", { role: "user", content: prompt });

    setInput("");
    setIsLoading(true);
    scrollToBottom();

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = `${COMPOSER_MIN_HEIGHT}px`;
    }

    try {
      const triggerRes = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, prompt }),
      });

      if (!triggerRes.ok) {
        throw new Error("Failed to trigger design agent.");
      }

      const designRunParsed = triggerResponseSchema.safeParse(
        await triggerRes.json(),
      );
      if (!designRunParsed.success) {
        throw new Error("Failed to trigger design agent.");
      }
      const { runId } = designRunParsed.data;

      const tokenRes = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });

      if (!tokenRes.ok) {
        throw new Error("Failed to get design token.");
      }

      const tokenDesignParsed = tokenResponseSchema.safeParse(
        await tokenRes.json(),
      );
      if (!tokenDesignParsed.success) {
        throw new Error("Failed to get design token.");
      }
      const { publicToken } = tokenDesignParsed.data;
      setDesignRunId(runId);
      setDesignAccessToken(publicToken);
      scrollToBottom();
    } catch {
      void createFeedMessage("ai-chat", {
        role: "assistant",
        content: "Failed to reach the AI service. Please try again.",
      });
      setIsLoading(false);
      scrollToBottom();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Submit on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <>
      <aside
        className={cn(
          "absolute right-4 top-4 bottom-4 z-40 flex w-[min(24rem,calc(100vw-2rem))] flex-col rounded-2xl border border-surface-border bg-base/95 shadow-2xl shadow-black/40 backdrop-blur transition-all duration-300",
          isOpen
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-[calc(100%+1.5rem)] opacity-0",
        )}>
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-dim">
              <Sparkles className="h-4 w-4 text-accent-text" />
            </div>
            <div>
              <p className="text-sm font-semibold text-copy-primary">
                AI Workspace
              </p>
              <p className="text-[11px] text-copy-faint">
                Architect and spec drafts
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-copy-muted hover:text-copy-primary">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs
          defaultValue="architect"
          className="flex min-h-0 flex-1 flex-col px-3 py-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="architect">AI Architect</TabsTrigger>
            <TabsTrigger value="specs">Specs</TabsTrigger>
          </TabsList>

          <TabsContent
            value="architect"
            className="mt-3 flex min-h-0 flex-1 flex-col gap-3">
            {/* Chat messages — clean conversation view only */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-surface-border bg-base/50 px-3 py-3">
              {!feedLoading && (!feedMessages || feedMessages.length === 0) ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-border bg-elevated">
                    <Bot className="h-6 w-6 text-copy-faint" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-copy-secondary">
                      AI System Designer
                    </p>
                    <p className="mt-1 text-xs leading-5 text-copy-faint">
                      Describe whatever system you want to design. The AI will
                      place nodes and connections on the canvas in real time.
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {Object.entries(starterPrompts).map(
                      ([label, fullPrompt]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setInput(fullPrompt)}
                          className="rounded-lg border border-surface-border bg-elevated/60 px-2.5 py-1.5 text-xs text-copy-muted transition hover:border-surface-border-strong hover:text-copy-primary">
                          {label}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                (feedMessages ?? []).map((message) => {
                  const msgParsed = chatFeedMessageDataSchema.safeParse(
                    message.data,
                  );
                  const d = msgParsed.success
                    ? msgParsed.data
                    : { role: "user" as const, content: "" };
                  const isUser = d.role === "user";
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isUser ? "justify-end" : "justify-start",
                      )}>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                          isUser
                            ? "bg-brand-dim border-brand/50! border-2 text-copy-primary"
                            : "border border-surface-border bg-elevated text-copy-primary",
                        )}>
                        {d.content ?? ""}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Agent activity log — fixed between chat and input, hidden when idle */}
            <AiStatusFeed />

            {/* Run lifecycle trackers — invisible, only manage completion callbacks */}
            {designRunId && designAccessToken && (
              <DesignRunTracker
                runId={designRunId}
                accessToken={designAccessToken}
                onComplete={handleDesignComplete}
              />
            )}
            {specRunId && specAccessToken && (
              <SpecRunTracker
                runId={specRunId}
                accessToken={specAccessToken}
                onComplete={handleSpecComplete}
              />
            )}

            <div className="space-y-2 border-t border-surface-border px-1 pt-3">
              <div className="flex items-center gap-2">
                {isGeneratingSpec ? (
                  <SpecCancelButton
                    isCancelling={isCancellingSpec}
                    onCancel={handleCancelSpec}
                  />
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSpec}
                    disabled={nodeCount === 0}
                    className="flex-1 rounded-lg text-xs">
                    <FileText className="h-3 w-3" />
                    Generate Spec Draft
                  </Button>
                )}
              </div>

              <div className="flex items-end gap-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your system (Enter to send, Shift+Enter for new line)"
                  disabled={isLoading}
                  rows={1}
                  className="min-h-18 flex-1 resize-none rounded-lg py-2 text-sm leading-relaxed"
                />
                {isLoading ? (
                  <DesignCancelButton
                    isCancelling={isCancellingDesign}
                    onCancel={handleCancelDesign}
                  />
                ) : (
                  <Button
                    type="button"
                    variant="accent"
                    size="icon"
                    onClick={() => void handleSubmit()}
                    disabled={!input.trim()}
                    className="h-9 w-9 shrink-0 rounded-lg bg-linear-to-r from-blue-600 to-fuchsia-500 text-copy-primary hover:from-fuchsia-500 hover:to-blue-600">
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="mt-3 min-h-0 flex-1">
            <ScrollArea className="h-full rounded-xl bg-base/50">
              {specs.length === 0 ? (
                <div className="flex h-full min-h-45 items-center justify-center rounded-xl border border-dashed border-surface-border bg-elevated/30 px-4 text-center text-sm text-copy-faint">
                  No specs yet. Generate your first draft from the AI Architect
                  tab.
                </div>
              ) : (
                <div className="space-y-3">
                  {specs.map((spec) => {
                    const isSavedSpec = !spec.id.startsWith("local-");

                    return (
                      <Card
                        key={spec.id}
                        className="border-surface-border bg-elevated/60">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <CardTitle className="text-copy-primary">
                                {spec.title}
                              </CardTitle>
                              <CardDescription className="text-xs text-copy-faint">
                                Generated at{" "}
                                {formatGeneratedTime(spec.createdAt)}
                              </CardDescription>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenSpec(spec)}
                                className="h-8 w-8 rounded-lg text-copy-muted hover:bg-elevated hover:text-copy-primary"
                                aria-label="View spec">
                                <Eye className="h-4 w-4" />
                              </Button>

                              {isSavedSpec ? (
                                <a
                                  href={getDownloadUrl(roomId, spec.id)}
                                  download
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-copy-muted transition hover:bg-elevated hover:text-copy-primary"
                                  aria-label="Download spec markdown">
                                  <Download className="h-4 w-4" />
                                </a>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled
                                  className="h-8 w-8 rounded-lg text-copy-faint"
                                  aria-label="Download unavailable until saved">
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <p className="text-sm text-copy-muted">
                            {getSnippet(spec.content)}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </aside>

      <SpecPreviewDialog
        isOpen={isSpecDialogOpen}
        onOpenChange={setIsSpecDialogOpen}
        spec={activeSpec}
        roomId={roomId}
      />
    </>
  );
});
