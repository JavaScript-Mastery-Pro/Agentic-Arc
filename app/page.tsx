import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight,
  Bot,
  FileText,
  GitBranch,
  Globe,
  Layers,
  LayoutDashboard,
  MousePointerClick,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Real-time Collaboration",
    description:
      "Multiple team members can work on the same canvas simultaneously. See each other's cursors, changes, and presence indicators live.",
  },
  {
    icon: Bot,
    title: "AI System Designer",
    description:
      "Describe your system in plain English. The AI agent places nodes, draws connections, and builds your architecture on the canvas automatically.",
  },
  {
    icon: FileText,
    title: "Spec Generation",
    description:
      "Turn your architecture diagram into a structured technical specification in seconds. Export as Markdown for documentation or sharing.",
  },
  {
    icon: Layers,
    title: "Rich Node Shapes",
    description:
      "Express your architecture clearly with rectangles, circles, diamonds, cylinders, hexagons, and pill shapes — each color-customisable.",
  },
  {
    icon: GitBranch,
    title: "Smart Edges & Labels",
    description:
      "Draw connections between services with smooth edges. Hover to highlight, single-click to select, double-click to add inline labels.",
  },
  {
    icon: Globe,
    title: "Shareable Rooms",
    description:
      "Every project lives in its own room with a shareable link. Invite collaborators by email and manage access from within the editor.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create a project",
    description:
      "Open your dashboard and create a new project in seconds. Each project gets its own collaborative room.",
  },
  {
    number: "02",
    title: "Design with AI or drag-and-drop",
    description:
      "Describe what you want to build in the AI chat, or drag shapes from the bottom panel and connect them by hand.",
  },
  {
    number: "03",
    title: "Collaborate and ship",
    description:
      "Invite your team, iterate together in real time, then generate a spec document and export it for your engineering workflow.",
  },
];

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <main className="min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* ── Background glows ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[600px] rounded-full bg-indigo-500/8 blur-3xl" />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between border-b border-zinc-800/60 px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            Ghost Arc
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-cyan-400">
              <LayoutDashboard className="h-4 w-4" />
              Open the Editor
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition hover:text-zinc-100">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-cyan-400">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex min-h-[calc(100svh-57px)] flex-col items-center justify-center px-6 pb-16 pt-16 text-center">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/8 px-3.5 py-1.5 text-xs font-medium text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered collaborative diagramming
          </div>

          <h1 className="mx-auto max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
            Ghost Arc —{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              build systems.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Ghost Arc combines real-time collaborative diagramming with an AI
            agent that designs system architecture from a single sentence — then
            generates a full technical spec.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isSignedIn ? (
              <Link
                href="/editor"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-zinc-700 px-7 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800/60">
                <MousePointerClick className="h-4 w-4" />
                Open the editor
              </Link>
            ) : (
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-cyan-500 px-7 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400">
                Start building free
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-28">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Everything you need
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Diagram faster, together.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            From the first node to the finished spec, Ghost Arc keeps your whole
            team in sync — with AI doing the heavy lifting.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition hover:border-zinc-700 hover:bg-zinc-900">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 transition group-hover:bg-zinc-700">
                  <Icon className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-zinc-100">
                  {feature.title}
                </h3>
                <p className="text-sm leading-6 text-zinc-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-28">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            From idea to spec in minutes.
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-full top-5 hidden h-px w-full -translate-x-3 bg-gradient-to-r from-zinc-700 to-transparent sm:block" />
              )}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
                <span className="text-3xl font-bold text-zinc-800">
                  {step.number}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-zinc-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-zinc-900 to-indigo-500/10 p-10 text-center shadow-2xl shadow-black/40 sm:p-16">
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.12),_transparent_60%)]" />
          <h2 className="relative text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Ready to map your system?
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-zinc-400">
            Ghost Arc is free to start. No credit card required. Open the
            editor, type what you&apos;re building, and let the AI handle the
            rest.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isSignedIn ? (
              <Link
                href="/editor"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-cyan-500 px-8 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400">
                Open The Editor
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-cyan-500 px-8 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400">
                  Create a free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex h-12 items-center rounded-xl border border-zinc-700 px-8 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-zinc-800/60 px-6 py-8 text-center sm:px-10">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-indigo-500">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-zinc-500">
              Ghost Arc
            </span>
          </div>
          <p className="text-xs text-zinc-600">
            Built with Next.js, Liveblocks, and Trigger.dev
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <Link href="/editor" className="transition hover:text-zinc-400">
              Editor
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
