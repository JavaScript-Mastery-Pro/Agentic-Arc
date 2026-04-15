"use client";

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import {
  Bot,
  Download,
  FileText,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { generateSpec } from "@/trigger/generate-spec";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AiChatSidebarProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
}

// ── Spec run tracker ────────────────────────────────────────────────
function SpecRunTracker({
  runId,
  accessToken,
  roomId,
  onComplete,
}: {
  runId: string;
  accessToken: string;
  roomId: string;
  onComplete: () => void;
}) {
  const { run, error } = useRealtimeRun<typeof generateSpec>(runId, {
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
      onComplete();
    }
  }, [run, onComplete]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
        Failed to track spec generation.
      </div>
    );
  }

  if (!run) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        Connecting…
      </div>
    );
  }

  const progress = (run.metadata as Record<string, unknown> | undefined)
    ?.progress as number | undefined;
  const status = (run.metadata as Record<string, unknown> | undefined)
    ?.status as string | undefined;

  const isRunning = run.status !== "COMPLETED" && run.status !== "FAILED";

  return (
    <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-300">
          {run.status === "COMPLETED"
            ? "Spec generated!"
            : run.status === "FAILED"
              ? "Spec generation failed"
              : (status ?? "Generating spec…")}
        </span>
        {isRunning && (
          <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
        )}
      </div>

      {typeof progress === "number" && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}

      {run.status === "COMPLETED" && (
        <a
          href={`/api/ai/spec/${encodeURIComponent(roomId)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition">
          <FileText className="h-3 w-3" />
          View spec
        </a>
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

  // ── Spec generation state ─────────────────────────────────────────
  const [specRunId, setSpecRunId] = useState<string | null>(null);
  const [specAccessToken, setSpecAccessToken] = useState<string | null>(null);
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [showSpecViewer, setShowSpecViewer] = useState(false);
  const [specContent, setSpecContent] = useState<string | null>(null);
  const [isLoadingSpec, setIsLoadingSpec] = useState(false);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  const handleSpecComplete = useCallback(() => {
    // Auto-open spec viewer when done
    setIsGeneratingSpec(false);
  }, []);

  async function handleGenerateSpec() {
    if (isGeneratingSpec) return;
    setIsGeneratingSpec(true);

    try {
      // 1. Trigger the spec generation task
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

      // 2. Get a public access token for realtime subscription
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

  async function handleViewSpec() {
    setShowSpecViewer(true);
    setIsLoadingSpec(true);

    try {
      const res = await fetch(`/api/ai/spec/${encodeURIComponent(roomId)}`);

      if (res.ok) {
        const data = (await res.json()) as { spec: string };
        setSpecContent(data.spec);
      } else {
        setSpecContent(null);
      }
    } catch {
      setSpecContent(null);
    } finally {
      setIsLoadingSpec(false);
    }
  }

  function handleDownloadSpec() {
    if (!specContent) return;

    const blob = new Blob([specContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${roomId}-spec.md`;
    a.click();
    URL.revokeObjectURL(url);
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
      const response = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, prompt }),
      });

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response.ok
          ? "Done! I've updated the canvas based on your request."
          : "Something went wrong. Please try again.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Failed to reach the AI service. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }

  return (
    <aside
      className={cn(
        "absolute right-4 top-4 bottom-4 z-40 flex w-[min(22rem,calc(100vw-2rem))] flex-col rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl shadow-black/40 backdrop-blur transition-all duration-300",
        isOpen
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-[calc(100%+1.5rem)] opacity-0",
      )}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">AI Architect</p>
            <p className="text-[11px] text-zinc-500">Design systems with AI</p>
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

      {/* ── Messages ───────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
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
                Describe whatever system you want to design. The AI will place
                nodes and connections on the canvas in real time.
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

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Designing on canvas…
            </div>
          </div>
        )}

        {/* ── Spec generation tracker ──────────────────────────────── */}
        {specRunId && specAccessToken && (
          <SpecRunTracker
            runId={specRunId}
            accessToken={specAccessToken}
            roomId={roomId}
            onComplete={handleSpecComplete}
          />
        )}
      </div>

      {/* ── Spec viewer overlay ────────────────────────────────────── */}
      {showSpecViewer && (
        <div className="absolute inset-0 z-50 flex flex-col rounded-2xl bg-zinc-950/98">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <p className="text-sm font-semibold text-zinc-100">
                Project Spec
              </p>
            </div>
            <div className="flex items-center gap-1">
              {specContent && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleDownloadSpec}
                  className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowSpecViewer(false)}
                className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {isLoadingSpec ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading spec…
              </div>
            ) : specContent ? (
              <div className="prose prose-sm prose-invert max-w-none text-zinc-300 prose-headings:text-zinc-100 prose-strong:text-zinc-200 prose-a:text-indigo-400">
                <pre className="whitespace-pre-wrap break-words rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs leading-relaxed text-zinc-300 font-mono">
                  {specContent}
                </pre>
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-zinc-500">
                No spec found for this project. Generate one first.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Input ──────────────────────────────────────────────────── */}
      <div className="border-t border-zinc-800 px-3 py-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateSpec}
            disabled={isGeneratingSpec || nodes.length === 0}
            className="flex-1 rounded-lg text-xs">
            {isGeneratingSpec ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <FileText className="h-3 w-3" />
                Generate Spec
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleViewSpec}
            className="rounded-lg text-xs">
            <FileText className="h-3 w-3" />
            View
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your system…"
            disabled={isLoading}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 disabled:opacity-60"
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
    </aside>
  );
}
