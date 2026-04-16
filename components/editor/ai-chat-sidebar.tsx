"use client";

import { useRealtimeRun } from "@trigger.dev/react-hooks";
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
import ReactMarkdown from "react-markdown";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import type { designAgent } from "@/trigger/design-agent";
import type { generateSpecGemini } from "@/trigger/generate-spec-gemini";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface StoredSpec {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface AiChatSidebarProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
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
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
        Failed to track AI progress.
      </div>
    );
  }

  const isRunning =
    !run || (run.status !== "COMPLETED" && run.status !== "FAILED");

  if (!isRunning) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
      <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
      <span>AI is working on the canvas...</span>
    </div>
  );
}

function SpecRunTracker({
  runId,
  accessToken,
  onComplete,
}: {
  runId: string;
  accessToken: string;
  onComplete: (specContent: string | null) => void;
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
      const specContent =
        run.status === "COMPLETED" && run.output
          ? (run.output as { specContent: string }).specContent
          : null;
      onComplete(specContent);
    }
  }, [run, onComplete]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
        Failed to track spec generation.
      </div>
    );
  }

  const progress = (run?.metadata as Record<string, unknown> | undefined)
    ?.progress as number | undefined;
  const status = (run?.metadata as Record<string, unknown> | undefined)
    ?.status as string | undefined;

  return (
    <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-300">{status ?? "Connecting..."}</span>
        <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
      </div>

      {typeof progress === "number" && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function AiChatSidebar({
  roomId,
  isOpen,
  onClose,
  nodes,
  edges,
}: AiChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [designRunId, setDesignRunId] = useState<string | null>(null);
  const [designAccessToken, setDesignAccessToken] = useState<string | null>(
    null,
  );

  const [specRunId, setSpecRunId] = useState<string | null>(null);
  const [specAccessToken, setSpecAccessToken] = useState<string | null>(null);
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [specs, setSpecs] = useState<StoredSpec[]>([]);
  const [activeSpecId, setActiveSpecId] = useState<string | null>(null);
  const [isSpecDialogOpen, setIsSpecDialogOpen] = useState(false);

  const activeSpec = useMemo(
    () => specs.find((spec) => spec.id === activeSpecId) ?? null,
    [activeSpecId, specs],
  );

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  const handleDesignComplete = useCallback((succeeded: boolean) => {
    setDesignRunId(null);
    setDesignAccessToken(null);
    setIsLoading(false);

    const assistantMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: succeeded
        ? "Done! I've updated the canvas based on your request."
        : "Something went wrong. Please try again.",
    };

    setMessages((prev) => [...prev, assistantMessage]);
    scrollToBottom();
  }, []);

  const handleSpecComplete = useCallback(
    async (specContent: string | null) => {
      setSpecRunId(null);
      setSpecAccessToken(null);
      setIsGeneratingSpec(false);

      if (!specContent) return;

      const generatedAt = new Date().toISOString();
      let specId = `local-${Date.now()}`;

      try {
        const res = await fetch(`/api/projects/${roomId}/spec`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ specContent }),
        });

        if (res.ok) {
          const data = (await res.json()) as { specId: string };
          specId = data.specId;
        }
      } catch {
        // keep local fallback id; user can still view content in current session
      }

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
    [roomId, specs.length],
  );

  async function handleGenerateSpec() {
    if (isGeneratingSpec) return;
    setIsGeneratingSpec(true);

    try {
      const triggerRes = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          projectId: roomId,
          chatHistory: messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role, content: m.content })),
          nodes,
          edges,
        }),
      });

      if (!triggerRes.ok) {
        setIsGeneratingSpec(false);
        return;
      }

      const { runId } = (await triggerRes.json()) as { runId: string };

      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });

      if (!tokenRes.ok) {
        setIsGeneratingSpec(false);
        return;
      }

      const { publicToken } = (await tokenRes.json()) as {
        publicToken: string;
      };

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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const prompt = input.trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    scrollToBottom();

    try {
      const triggerRes = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, prompt }),
      });

      if (!triggerRes.ok) {
        throw new Error("Failed to trigger design agent.");
      }

      const { runId } = (await triggerRes.json()) as { runId: string };

      const tokenRes = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });

      if (!tokenRes.ok) {
        throw new Error("Failed to get design token.");
      }

      const { publicToken } = (await tokenRes.json()) as {
        publicToken: string;
      };

      setDesignRunId(runId);
      setDesignAccessToken(publicToken);
      scrollToBottom();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Failed to reach the AI service. Please try again.",
        },
      ]);
      setIsLoading(false);
      scrollToBottom();
    }
  }

  return (
    <>
      <aside
        className={cn(
          "absolute right-4 top-4 bottom-4 z-40 flex w-[min(24rem,calc(100vw-2rem))] flex-col rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl shadow-black/40 backdrop-blur transition-all duration-300",
          isOpen
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-[calc(100%+1.5rem)] opacity-0",
        )}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                AI Workspace
              </p>
              <p className="text-[11px] text-zinc-500">
                Architect and spec drafts
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
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
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-3">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
                    <Bot className="h-6 w-6 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">
                      AI System Designer
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Describe whatever system you want to design. The AI will
                      place nodes and connections on the canvas in real time.
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {[
                      "Design an e-commerce backend",
                      "Create a chat app architecture",
                      "Build a CI/CD pipeline",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setInput(suggestion)}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "border border-zinc-800 bg-zinc-900 text-zinc-200",
                      )}>
                      {message.content}
                    </div>
                  </div>
                ))
              )}

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
            </div>

            <div className="space-y-2 border-t border-zinc-800 px-1 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateSpec}
                disabled={isGeneratingSpec || nodes.length === 0}
                className="w-full rounded-lg text-xs">
                {isGeneratingSpec ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating spec...
                  </>
                ) : (
                  <>
                    <FileText className="h-3 w-3" />
                    Generate Spec Draft
                  </>
                )}
              </Button>

              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your system..."
                  disabled={isLoading}
                  className="h-9 rounded-lg"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-9 w-9 shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="mt-3 min-h-0 flex-1">
            <ScrollArea className="h-full rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
              {specs.length === 0 ? (
                <div className="flex h-full min-h-[180px] items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 px-4 text-center text-sm text-zinc-500">
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
                        className="border-zinc-800 bg-zinc-900/70">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <CardTitle className="text-zinc-100">
                                {spec.title}
                              </CardTitle>
                              <CardDescription className="text-xs text-zinc-500">
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
                                className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                                aria-label="View spec">
                                <Eye className="h-4 w-4" />
                              </Button>

                              {isSavedSpec ? (
                                <a
                                  href={getDownloadUrl(roomId, spec.id)}
                                  download
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
                                  aria-label="Download spec markdown">
                                  <Download className="h-4 w-4" />
                                </a>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled
                                  className="h-8 w-8 rounded-lg text-zinc-600"
                                  aria-label="Download unavailable until saved">
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <p className="text-sm text-zinc-400">
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

      <Dialog open={isSpecDialogOpen} onOpenChange={setIsSpecDialogOpen}>
        <DialogContent className="w-[min(94vw,80rem)] max-w-5xl gap-0 overflow-hidden border-zinc-800 bg-zinc-900 p-0">
          <DialogHeader className="flex-row items-center justify-between border-b border-zinc-800 px-6 py-4 pr-16">
            <DialogTitle className="text-lg text-zinc-100">
              {activeSpec?.title ?? "Spec"}
            </DialogTitle>

            {activeSpec && !activeSpec.id.startsWith("local-") && (
              <a href={getDownloadUrl(roomId, activeSpec.id)} download>
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
            {activeSpec ? (
              <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                <ReactMarkdown>{activeSpec.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-500">
                No spec selected.
              </p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
