import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 py-20 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.08),_transparent_45%)]" />

      <section className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Agentic Arc
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          Build ideas into systems.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
          Jump straight into the collaborative canvas to map systems, share a
          room, and build architecture with your team in realtime.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-in"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-cyan-500 px-5 text-sm font-medium text-zinc-950 transition hover:bg-cyan-400">
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-5 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800">
            Sign Up
          </Link>
        </div>

        <Link
          href="/editor/system-blueprint"
          className="mt-4 inline-flex text-sm text-cyan-300 underline-offset-4 transition hover:text-cyan-200 hover:underline">
          Open collaborative editor
        </Link>
      </section>
    </main>
  );
}
